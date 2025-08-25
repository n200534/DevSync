const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allow null/undefined values
  },
  skills: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search optimization (only for skills since email, username, and githubId are already indexed by unique: true)
userSchema.index({ skills: 1 });

// Virtual for public profile data
userSchema.virtual('publicProfile').get(function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    bio: this.bio,
    avatar: this.avatar,
    githubUrl: this.githubUrl,
    skills: this.skills,
    createdAt: this.createdAt
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
