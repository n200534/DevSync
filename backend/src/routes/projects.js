const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const Collaboration = require('../models/Collaboration');
const Application = require('../models/Application');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user; // Use the user object from middleware
    const { title, description, techStack, repoUrl, liveUrl, screenshots } = req.body;

    if (!title || !description || !techStack) {
      return res.status(400).json({ error: 'Title, description, and tech stack are required' });
    }

    const project = await Project.create({
      title,
      description,
      techStack,
      repoUrl,
      liveUrl,
      screenshots: screenshots || [],
      owner: id
    });

    // Populate owner information
    await project.populate('owner', '_id username name avatar');
    
    // Convert MongoDB _id to id for consistency
    const projectData = {
      ...project.toObject(),
      id: project._id,
      owner: {
        ...project.owner.toObject(),
        id: project.owner._id
      }
    };

    res.status(201).json(projectData);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects (with filters)
router.get('/', async (req, res) => {
  try {
    const { tech, search, limit = 20, page = 1 } = req.query;
    
    const where = {};
    
    if (tech) {
      const techArray = tech.split(',').map(t => t.trim());
      where.techStack = { hasSome: techArray };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const projects = await Project.find(where)
      .populate('owner', '_id username name avatar')
      .populate({
        path: 'collaborations',
        populate: {
          path: 'user',
          select: '_id username name avatar'
        }
      })
      .populate({
        path: 'applications',
        populate: {
          path: 'user',
          select: '_id username name avatar'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Convert MongoDB _id to id for consistency
    const projectsData = projects.map(project => ({
      ...project,
      id: project._id,
      owner: {
        ...project.owner,
        id: project.owner._id
      },
      collaborations: project.collaborations.map(collab => ({
        ...collab,
        user: {
          ...collab.user,
          id: collab.user._id
        }
      })),
      applications: project.applications.map(app => ({
        ...app,
        id: app._id,
        user: {
          ...app.user,
          id: app.user._id
        }
      }))
    }));

    res.json(projectsData);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('owner', '_id username name avatar')
      .populate({
        path: 'collaborations',
        populate: {
          path: 'user',
          select: '_id username name avatar'
        }
      })
      .populate({
        path: 'applications',
        populate: {
          path: 'user',
          select: '_id username name avatar'
        }
      })
      .lean();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Convert MongoDB _id to id for consistency
    const projectData = {
      ...project,
      id: project._id,
      owner: {
        ...project.owner,
        id: project.owner._id
      },
      collaborations: project.collaborations.map(collab => ({
        ...collab,
        user: {
          ...collab.user,
          id: collab.user._id
        }
      })),
      applications: project.applications.map(app => ({
        ...app,
        id: app._id,
        user: {
          ...app.user,
          id: app.user._id
        }
      }))
    };

    res.json(projectData);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Update project (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user; // Use the user object from middleware
    const { title, description, techStack, repoUrl, liveUrl, screenshots, isOpen } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only project owner can update project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title,
        description,
        techStack,
        repoUrl,
        liveUrl,
        screenshots,
        isOpen
      },
      { new: true, runValidators: true }
    ).populate('owner', '_id username name avatar');

    // Convert MongoDB _id to id for consistency
    const projectData = {
      ...updatedProject.toObject(),
      id: updatedProject._id,
      owner: {
        ...updatedProject.owner.toObject(),
        id: updatedProject.owner._id
      }
    };

    res.json(projectData);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Apply to join project
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user; // Use the user object from middleware
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: userId,
      project: id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this project' });
    }

    const application = await Application.create({
      user: userId,
      project: id,
      message
    });

    // Populate user and project information
    await application.populate('user', '_id username name avatar');
    await application.populate('project', '_id title');

    // Convert MongoDB _id to id for consistency
    const applicationData = {
      ...application.toObject(),
      id: application._id,
      user: {
        ...application.user.toObject(),
        id: application.user._id
      },
      project: {
        ...application.project.toObject(),
        id: application.project._id
      }
    };

    res.status(201).json(applicationData);
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({ error: 'Failed to apply to project' });
  }
});

// Accept/reject application (project owner only)
router.put('/:id/applications/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { id, applicationId } = req.params;
    const { id: userId } = req.user; // Use the user object from middleware
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only project owner can manage applications' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.project.toString() !== id) {
      return res.status(400).json({ error: 'Application does not belong to this project' });
    }

    // Update application status
    await Application.findByIdAndUpdate(applicationId, { status });

    // If accepted, add user as collaborator
    if (status === 'accepted') {
      await Collaboration.create({
        user: application.user,
        project: id,
        role: 'Collaborator'
      });
    }

    res.json({ message: `Application ${status}` });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete project (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user; // Use the user object from middleware

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only project owner can delete project' });
    }

    // Delete related records first
    await Collaboration.deleteMany({ project: id });
    await Application.deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
