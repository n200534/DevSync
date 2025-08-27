const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { type, limit = 20, page = 1 } = req.query;
    
    const where = { user: userId };
    
    if (type && type !== 'all') {
      where.type = type;
    }

    const notifications = await Notification.find(where)
      .populate('actor', '_id username name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Convert MongoDB _id to id for consistency
    const notificationsData = notifications.map(notification => ({
      ...notification,
      id: notification._id,
      timestamp: notification.createdAt,
      actor: notification.actor ? {
        ...notification.actor,
        id: notification.actor._id
      } : undefined
    }));

    res.json(notificationsData);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (internal use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { 
      type, 
      title, 
      message, 
      actionUrl, 
      actorId, 
      metadata 
    } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Type, title, and message are required' });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      actionUrl,
      actor: actorId,
      metadata
    });

    // Populate actor information
    await notification.populate('actor', '_id username name avatar');

    // Convert MongoDB _id to id for consistency
    const notificationData = {
      ...notification.toObject(),
      id: notification._id,
      timestamp: notification.createdAt,
      actor: notification.actor ? {
        ...notification.actor.toObject(),
        id: notification.actor._id
      } : undefined
    };

    res.status(201).json(notificationData);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
