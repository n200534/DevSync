const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', '_id username name avatar title company')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: '_id username name'
      }
    })
    .sort({ updatedAt: -1 })
    .lean();

    // Transform conversations to match frontend interface
    const conversationsData = conversations.map(conversation => {
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== userId
      );
      
      return {
        id: conversation._id,
        participant: {
          id: otherParticipant._id,
          username: otherParticipant.username,
          name: otherParticipant.name,
          avatar: otherParticipant.avatar || '',
          title: otherParticipant.title || 'Developer',
          company: otherParticipant.company || '',
          isOnline: false // TODO: Implement online status
        },
        lastMessage: conversation.lastMessage ? {
          id: conversation.lastMessage._id,
          content: conversation.lastMessage.content,
          senderId: conversation.lastMessage.sender._id,
          receiverId: userId,
          timestamp: conversation.lastMessage.createdAt,
          isRead: conversation.lastMessage.isRead,
          type: conversation.lastMessage.type
        } : null,
        unreadCount: 0, // TODO: Calculate unread count
        updatedAt: conversation.updatedAt
      };
    });

    res.json(conversationsData);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;
    const { limit = 50, page = 1 } = req.query;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', '_id username name avatar')
      .populate('receiver', '_id username name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Transform messages to match frontend interface
    const messagesData = messages.map(message => ({
      id: message._id,
      content: message.content,
      senderId: message.sender._id,
      receiverId: message.receiver._id,
      timestamp: message.createdAt,
      isRead: message.isRead,
      type: message.type,
      sender: {
        id: message.sender._id,
        username: message.sender.username,
        name: message.sender.name,
        email: '',
        avatar: message.sender.avatar || '',
        title: '',
        company: '',
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      receiver: {
        id: message.receiver._id,
        username: message.receiver.username,
        name: message.receiver.name,
        email: '',
        avatar: message.receiver.avatar || '',
        title: '',
        company: '',
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: message.createdAt
    }));

    res.json(messagesData.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;
    const { content, type = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Find the other participant
    const receiverId = conversation.participants.find(
      p => p.toString() !== userId
    );

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      receiver: receiverId,
      content: content.trim(),
      type
    });

    // Populate sender and receiver information
    await message.populate('sender', '_id username name avatar');
    await message.populate('receiver', '_id username name avatar');

    // Transform message to match frontend interface
    const messageData = {
      id: message._id,
      content: message.content,
      senderId: message.sender._id,
      receiverId: message.receiver._id,
      timestamp: message.createdAt,
      isRead: message.isRead,
      type: message.type,
      sender: {
        id: message.sender._id,
        username: message.sender.username,
        name: message.sender.name,
        email: '',
        avatar: message.sender.avatar || '',
        title: '',
        company: '',
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      receiver: {
        id: message.receiver._id,
        username: message.receiver.username,
        name: message.receiver.name,
        email: '',
        avatar: message.receiver.avatar || '',
        title: '',
        company: '',
        skills: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: message.createdAt
    };

    res.status(201).json(messageData);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create or get conversation with another user
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    if (userId === participantId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if user exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId]
      });
    }

    // Populate conversation data
    await conversation.populate('participants', '_id username name avatar title company');

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== userId
    );

    const conversationData = {
      id: conversation._id,
      participant: {
        id: otherParticipant._id,
        username: otherParticipant.username,
        name: otherParticipant.name,
        avatar: otherParticipant.avatar || '',
        title: otherParticipant.title || 'Developer',
        company: otherParticipant.company || '',
        isOnline: false
      },
      lastMessage: null,
      unreadCount: 0,
      updatedAt: conversation.updatedAt
    };

    res.status(201).json(conversationData);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all messages in conversation as read for this user
    await Message.updateMany(
      { 
        conversation: conversationId,
        receiver: userId,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
