const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select({
      _id: 1,
      email: 1,
      username: 1,
      name: 1,
      bio: 1,
      avatar: 1,
      githubUrl: 1,
      githubId: 1,
      skills: 1,
      createdAt: 1
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    req.user = {
      ...user.toObject(),
      id: user._id
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select({
      _id: 1,
      email: 1,
      username: 1,
      name: 1,
      bio: 1,
      avatar: 1,
      githubUrl: 1,
      githubId: 1,
      skills: 1,
      createdAt: 1
    });

    if (user) {
      req.user = {
        ...user.toObject(),
        id: user._id
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
