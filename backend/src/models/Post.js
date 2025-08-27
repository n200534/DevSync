const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['achievement', 'project', 'milestone', 'learning', 'collaboration'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  achievement: {
    title: String,
    description: String,
    icon: String,
    badge: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
postSchema.index({ type: 1 });
postSchema.index({ author: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes': 1 });
postSchema.index({ 'bookmarks': 1 });

// Virtual for post stats
postSchema.virtual('stats').get(function() {
  return {
    likes: this.likes.length,
    comments: this.comments.length,
    shares: this.shares,
    bookmarks: this.bookmarks.length
  };
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
