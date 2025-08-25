const express = require('express');
const Endorsement = require('../models/Endorsement');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Give endorsement to another user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id: fromId } = req.user; // Use the user object from middleware
    const { toId, skill, message } = req.body;

    if (!toId || !skill) {
      return res.status(400).json({ error: 'User ID and skill are required' });
    }

    if (fromId === toId) {
      return res.status(400).json({ error: 'Cannot endorse yourself' });
    }

    // Check if user exists
    const targetUser = await User.findById(toId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already endorsed for this skill
    const existingEndorsement = await Endorsement.findOne({
      from: fromId,
      to: toId,
      skill
    });

    if (existingEndorsement) {
      return res.status(400).json({ error: 'You have already endorsed this user for this skill' });
    }

    const endorsement = await Endorsement.create({
      from: fromId,
      to: toId,
      skill,
      message
    });

    // Populate user information
    await endorsement.populate('from', '_id username name avatar');
    await endorsement.populate('to', '_id username name');

    // Convert MongoDB _id to id for consistency
    const endorsementData = {
      ...endorsement.toObject(),
      id: endorsement._id,
      from: {
        ...endorsement.from.toObject(),
        id: endorsement.from._id
      },
      to: {
        ...endorsement.to.toObject(),
        id: endorsement.to._id
      }
    };

    res.status(201).json(endorsementData);
  } catch (error) {
    console.error('Create endorsement error:', error);
    res.status(500).json({ error: 'Failed to create endorsement' });
  }
});

// Get endorsements for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const endorsements = await Endorsement.find({ to: userId })
      .populate('from', '_id username name avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to id for consistency
    const endorsementsData = endorsements.map(endorsement => ({
      ...endorsement,
      id: endorsement._id,
      from: {
        ...endorsement.from,
        id: endorsement.from._id
      }
    }));

    res.json(endorsementsData);
  } catch (error) {
    console.error('Get user endorsements error:', error);
    res.status(500).json({ error: 'Failed to get endorsements' });
  }
});

// Get endorsements by skill
router.get('/skill/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    
    const endorsements = await Endorsement.find({ skill })
      .populate('from', '_id username name avatar')
      .populate('to', '_id username name avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to id for consistency
    const endorsementsData = endorsements.map(endorsement => ({
      ...endorsement,
      id: endorsement._id,
      from: {
        ...endorsement.from,
        id: endorsement.from._id
      },
      to: {
        ...endorsement.to,
        id: endorsement.to._id
      }
    }));

    res.json(endorsementsData);
  } catch (error) {
    console.error('Get skill endorsements error:', error);
    res.status(500).json({ error: 'Failed to get endorsements' });
  }
});

// Remove endorsement (only the endorser can remove)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user; // Use the user object from middleware

    const endorsement = await Endorsement.findById(id);

    if (!endorsement) {
      return res.status(404).json({ error: 'Endorsement not found' });
    }

    if (endorsement.from.toString() !== userId) {
      return res.status(403).json({ error: 'Only the endorser can remove the endorsement' });
    }

    await Endorsement.findByIdAndDelete(id);

    res.json({ message: 'Endorsement removed successfully' });
  } catch (error) {
    console.error('Remove endorsement error:', error);
    res.status(500).json({ error: 'Failed to remove endorsement' });
  }
});

// Get endorsement statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const endorsements = await Endorsement.find({ to: userId })
      .select('skill')
      .lean();

    // Count endorsements by skill
    const skillCounts = endorsements.reduce((acc, endorsement) => {
      acc[endorsement.skill] = (acc[endorsement.skill] || 0) + 1;
      return acc;
    }, {});

    // Get top skills
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      totalEndorsements: endorsements.length,
      uniqueSkills: Object.keys(skillCounts).length,
      skillCounts,
      topSkills
    });
  } catch (error) {
    console.error('Get endorsement stats error:', error);
    res.status(500).json({ error: 'Failed to get endorsement statistics' });
  }
});

module.exports = router;
