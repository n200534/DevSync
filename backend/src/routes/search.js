const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Global search across users, projects, and skills
router.get('/', async (req, res) => {
  try {
    const { q: query, type, limit = 20 } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();
    const results = [];

    // Search users if type is not specified or is 'developers'
    if (!type || type === 'developers' || type === 'all') {
      const users = await User.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { username: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
          { skills: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .select('_id username name bio avatar githubUrl skills')
      .limit(parseInt(limit))
      .lean();

      users.forEach(user => {
        results.push({
          type: 'developer',
          id: user._id,
          title: user.name,
          description: user.bio || `Developer with expertise in ${user.skills?.join(', ') || 'various technologies'}`,
          avatar: user.avatar || '',
          username: user.username,
          skills: user.skills || [],
          followers: 0, // TODO: Implement followers count
          projects: 0, // TODO: Calculate from user's projects
          endorsements: 0 // TODO: Calculate from endorsements
        });
      });
    }

    // Search projects if type is not specified or is 'projects'
    if (!type || type === 'projects' || type === 'all') {
      const projects = await Project.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { techStack: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('owner', '_id username name avatar')
      .limit(parseInt(limit))
      .lean();

      projects.forEach(project => {
        results.push({
          type: 'project',
          id: project._id,
          title: project.title,
          description: project.description,
          techStack: project.techStack || [],
          isOpenForCollaboration: project.isOpenForCollaboration,
          createdAt: project.createdAt,
          owner: {
            id: project.owner._id,
            username: project.owner.username,
            name: project.owner.name,
            avatar: project.owner.avatar || ''
          },
          stats: {
            views: 0, // TODO: Implement views tracking
            likes: project.likes?.length || 0,
            applications: project.applications?.length || 0
          }
        });
      });
    }

    // Search skills if type is not specified or is 'skills'
    if (!type || type === 'skills' || type === 'all') {
      // Get unique skills from users and projects
      const userSkills = await User.distinct('skills', {
        skills: { $in: [new RegExp(searchTerm, 'i')] }
      });

      const projectSkills = await Project.distinct('techStack', {
        techStack: { $in: [new RegExp(searchTerm, 'i')] }
      });

      const allSkills = [...new Set([...userSkills, ...projectSkills])];

      allSkills.forEach(skill => {
        results.push({
          type: 'skill',
          id: skill,
          title: skill,
          description: `Find developers and projects related to ${skill}`,
          followers: 0, // TODO: Count users with this skill
          projects: 0 // TODO: Count projects using this skill
        });
      });
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      // Exact title matches first
      if (aTitle === searchLower && bTitle !== searchLower) return -1;
      if (bTitle === searchLower && aTitle !== searchLower) return 1;

      // Title starts with search term
      if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1;
      if (bTitle.startsWith(searchLower) && !aTitle.startsWith(searchLower)) return 1;

      // Title contains search term
      if (aTitle.includes(searchLower) && !bTitle.includes(searchLower)) return -1;
      if (bTitle.includes(searchLower) && !aTitle.includes(searchLower)) return 1;

      return 0;
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Search users only
router.get('/users', async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();

    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
        { bio: { $regex: searchTerm, $options: 'i' } },
        { skills: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    })
    .select('_id username name bio avatar githubUrl skills')
    .limit(parseInt(limit))
    .lean();

    const results = users.map(user => ({
      id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar || '',
      githubUrl: user.githubUrl,
      skills: user.skills || []
    }));

    res.json(results);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Search projects only
router.get('/projects', async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();

    const projects = await Project.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { techStack: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    })
    .populate('owner', '_id username name avatar')
    .limit(parseInt(limit))
    .lean();

    const results = projects.map(project => ({
      ...project,
      id: project._id,
      owner: {
        ...project.owner,
        id: project.owner._id
      }
    }));

    res.json(results);
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

module.exports = router;
