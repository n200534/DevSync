const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Collaboration = require('../models/Collaboration');
const Endorsement = require('../models/Endorsement');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile by username (public)
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get owned projects
    const ownedProjects = await Project.find({ owner: user._id })
      .select('_id title description techStack repoUrl liveUrl screenshots isOpen createdAt')
      .lean();

    // Get collaborations
    const collaborations = await Collaboration.find({ user: user._id })
      .populate('project', '_id title description techStack repoUrl liveUrl screenshots isOpen createdAt')
      .lean();

    // Get endorsements
    const receivedEndorsements = await Endorsement.find({ to: user._id })
      .populate('from', '_id username name avatar')
      .select('skill message createdAt')
      .lean();

    const userData = {
      id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      githubUrl: user.githubUrl,
      skills: user.skills,
      createdAt: user.createdAt,
      ownedProjects: ownedProjects.map(project => ({
        ...project,
        id: project._id
      })),
      collaborations: collaborations.map(collab => ({
        role: collab.role,
        project: {
          ...collab.project,
          id: collab.project._id
        }
      })),
      receivedEndorsements: receivedEndorsements.map(endorsement => ({
        skill: endorsement.skill,
        message: endorsement.message,
        createdAt: endorsement.createdAt,
        from: {
          id: endorsement.from._id,
          username: endorsement.from.username,
          name: endorsement.from.name,
          avatar: endorsement.from.avatar
        }
      }))
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user; // Use the user object from middleware
    const { bio, skills, githubUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { bio, skills, githubUrl },
      { new: true, runValidators: true }
    ).select('_id email username name bio avatar githubUrl skills createdAt');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert MongoDB _id to id for consistency
    const userData = {
      ...updatedUser.toObject(),
      id: updatedUser._id
    };

    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users by skills
router.get('/search', async (req, res) => {
  try {
    const { skills, limit = 20 } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills parameter is required' });
    }

    const skillArray = skills.split(',').map(s => s.trim());
    
    const users = await User.find({
      skills: { $in: skillArray }
    })
    .select('_id username name bio avatar skills githubUrl')
    .limit(parseInt(limit))
    .lean();

    // Convert MongoDB _id to id for consistency
    const usersData = users.map(user => ({
      ...user,
      id: user._id
    }));

    res.json(usersData);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get all users (for network page)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const users = await User.find({})
      .select('_id username name bio avatar githubUrl skills createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Convert MongoDB _id to id for consistency
    const usersData = users.map(user => ({
      ...user,
      id: user._id
    }));

    res.json(usersData);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get current user (authenticated)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User data is already available from middleware
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
});

module.exports = router;
