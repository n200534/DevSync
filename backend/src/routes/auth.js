const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email', 'read:user'] 
}));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user } = req;
      
      console.log('GitHub user data:', JSON.stringify(user, null, 2));
      
      // Check if user has required data
      if (!user || !user.id) {
        console.error('Missing user ID from GitHub');
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Unable to get user information from GitHub`);
      }
      
      // Handle email - GitHub might not provide it if user hasn't made it public
      let email = '';
      if (user.emails && user.emails[0] && user.emails[0].value) {
        email = user.emails[0].value;
      } else {
        // Create a fallback email using GitHub ID
        email = `${user.username}@github.${user.id}.devsync.local`;
        console.log('No email from GitHub, using fallback:', email);
      }
      
      const username = user.username || `user_${user.id}`;
      const name = user.displayName || user.username || username;
      const avatar = user.photos && user.photos[0] ? user.photos[0].value : '';
      const githubUrl = user.profileUrl || '';
      
      // Check if user exists in our database by GitHub ID first, then by email
      let dbUser = await User.findOne({ 
        $or: [
          { 'githubId': user.id },
          { email: email }
        ]
      });

      if (!dbUser) {
        // Create new user
        dbUser = await User.create({
          email: email,
          username: username,
          name: name,
          avatar: avatar,
          githubUrl: githubUrl,
          githubId: user.id // Store GitHub ID for future reference
        });
        console.log('Created new user:', dbUser.username);
      } else {
        // Update existing user with latest GitHub info
        dbUser.githubId = user.id;
        dbUser.avatar = avatar;
        dbUser.githubUrl = githubUrl;
        if (user.displayName && user.displayName !== dbUser.name) {
          dbUser.name = user.displayName;
        }
        await dbUser.save();
        console.log('Updated existing user:', dbUser.username);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: dbUser.id, email: dbUser.email, githubId: dbUser.githubId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
);

// Verify JWT token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
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

    // Convert MongoDB _id to id for consistency
    const userData = {
      ...user.toObject(),
      id: user._id
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
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
      createdAt: 1,
      updatedAt: 1
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Convert MongoDB _id to id for consistency
    const userData = {
      ...user.toObject(),
      id: user._id
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
