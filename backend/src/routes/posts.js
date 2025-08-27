const express = require('express');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { 
      type, 
      content, 
      tags, 
      project, 
      achievement 
    } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }

    const post = await Post.create({
      type,
      content,
      tags: tags || [],
      project: project || undefined,
      achievement: achievement || undefined,
      author: id
    });

    // Populate author information
    await post.populate('author', '_id username name avatar title company');
    
    // Convert MongoDB _id to id for consistency
    const postData = {
      ...post.toObject(),
      id: post._id,
      author: {
        ...post.author.toObject(),
        id: post.author._id
      }
    };

    res.status(201).json(postData);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    
    const where = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }

    const posts = await Post.find(where)
      .populate('author', '_id username name avatar title company')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Convert MongoDB _id to id for consistency
    const postsData = posts.map(post => ({
      ...post,
      id: post._id,
      author: {
        ...post.author,
        id: post.author._id
      }
    }));

    res.json(postsData);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', '_id username name avatar title company')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Convert MongoDB _id to id for consistency
    const postData = {
      ...post,
      id: post._id,
      author: {
        ...post.author,
        id: post.author._id
      }
    };

    res.json(postData);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(likeId => likeId.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({ 
      isLiked: !isLiked,
      likesCount: post.likes.length 
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Bookmark/Unbookmark post
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isBookmarked = post.bookmarks.includes(userId);

    if (isBookmarked) {
      // Unbookmark
      post.bookmarks = post.bookmarks.filter(bookmarkId => bookmarkId.toString() !== userId);
    } else {
      // Bookmark
      post.bookmarks.push(userId);
    }

    await post.save();

    res.json({ 
      isBookmarked: !isBookmarked,
      bookmarksCount: post.bookmarks.length 
    });
  } catch (error) {
    console.error('Bookmark post error:', error);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
});

// Delete post (author only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Only post author can delete post' });
    }

    await Post.findByIdAndDelete(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
