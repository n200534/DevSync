const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get trending projects
router.get('/projects', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get projects with recent activity (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const projects = await Project.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate('owner', '_id username name avatar title company')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

    // Calculate trending score based on various factors
    const trendingProjects = projects.map(project => {
      const daysSinceCreated = Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));
      const likesCount = project.likes?.length || 0;
      const applicationsCount = project.applications?.length || 0;
      
      // Simple trending score calculation
      let trendingScore = 0;
      if (daysSinceCreated <= 7) trendingScore += 30; // New projects get boost
      if (daysSinceCreated <= 3) trendingScore += 20; // Very new projects get more boost
      
      trendingScore += Math.min(likesCount * 2, 30); // Likes contribute to score
      trendingScore += Math.min(applicationsCount * 3, 20); // Applications contribute more
      
      // Determine trending reason
      let trendingReason = 'popular';
      if (daysSinceCreated <= 1) trendingReason = 'new';
      else if (daysSinceCreated <= 3) trendingReason = 'hot';
      else if (likesCount > 10) trendingReason = 'featured';

      return {
        id: project._id,
        title: project.title,
        description: project.description,
        techStack: project.techStack || [],
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        isOpenForCollaboration: project.isOpenForCollaboration,
        maxCollaborators: project.maxCollaborators || 5,
        createdAt: project.createdAt,
        owner: {
          id: project.owner._id,
          username: project.owner.username,
          name: project.owner.name,
          avatar: project.owner.avatar || '',
          title: project.owner.title || 'Developer',
          company: project.owner.company || ''
        },
        stats: {
          views: Math.floor(Math.random() * 10000) + 1000, // Mock views for now
          likes: likesCount,
          applications: applicationsCount,
          trendingScore: Math.min(trendingScore, 100)
        },
        trendingReason
      };
    });

    // Sort by trending score
    trendingProjects.sort((a, b) => b.stats.trendingScore - a.stats.trendingScore);

    res.json(trendingProjects);
  } catch (error) {
    console.error('Get trending projects error:', error);
    res.status(500).json({ error: 'Failed to get trending projects' });
  }
});

// Get trending developers
router.get('/developers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get users with recent activity (created in last 30 days or with recent posts)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get users who have created posts recently or are new
    const recentPosts = await Post.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).distinct('author');

    const users = await User.find({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } }, // New users
        { _id: { $in: recentPosts } } // Users with recent posts
      ]
    })
    .select('_id username name avatar title company skills bio')
    .limit(parseInt(limit))
    .lean();

    // Calculate trending score for developers
    const trendingDevelopers = users.map(user => {
      const daysSinceJoined = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
      
      let trendingScore = 0;
      if (daysSinceJoined <= 7) trendingScore += 40; // New users get boost
      if (daysSinceJoined <= 3) trendingScore += 30; // Very new users get more boost
      
      // Add some randomness for demo purposes
      trendingScore += Math.floor(Math.random() * 30) + 20;

      // Mock recent activity
      const activities = [
        'Published a new open source project',
        'Shared insights on latest tech trends',
        'Contributed to multiple repositories',
        'Completed a major project milestone',
        'Mentored junior developers',
        'Spoke at a tech conference'
      ];
      const recentActivity = activities[Math.floor(Math.random() * activities.length)];

      return {
        id: user._id,
        username: user.username,
        name: user.name,
        title: user.title || 'Developer',
        company: user.company || '',
        avatar: user.avatar || '',
        skills: user.skills || [],
        trendingScore: Math.min(trendingScore, 100),
        recentActivity
      };
    });

    // Sort by trending score
    trendingDevelopers.sort((a, b) => b.trendingScore - a.trendingScore);

    res.json(trendingDevelopers);
  } catch (error) {
    console.error('Get trending developers error:', error);
    res.status(500).json({ error: 'Failed to get trending developers' });
  }
});

// Get trending skills
router.get('/skills', async (req, res) => {
  try {
    // Get all unique skills from users and projects
    const userSkills = await User.distinct('skills');
    const projectSkills = await Project.distinct('techStack');
    
    const allSkills = [...new Set([...userSkills, ...projectSkills])];
    
    // Count occurrences and calculate growth (mock data for now)
    const trendingSkills = allSkills.slice(0, 20).map(skill => {
      const growth = Math.floor(Math.random() * 30) + 5; // 5-35% growth
      const colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-purple-100 text-purple-800',
        'bg-orange-100 text-orange-800',
        'bg-pink-100 text-pink-800',
        'bg-yellow-100 text-yellow-800',
        'bg-red-100 text-red-800',
        'bg-cyan-100 text-cyan-800'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        name: skill,
        growth: `+${growth}%`,
        color
      };
    });

    // Sort by growth (descending)
    trendingSkills.sort((a, b) => {
      const aGrowth = parseInt(a.growth.replace('+', '').replace('%', ''));
      const bGrowth = parseInt(b.growth.replace('+', '').replace('%', ''));
      return bGrowth - aGrowth;
    });

    res.json(trendingSkills);
  } catch (error) {
    console.error('Get trending skills error:', error);
    res.status(500).json({ error: 'Failed to get trending skills' });
  }
});

module.exports = router;
