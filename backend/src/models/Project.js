const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  techStack: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  isOpenForCollaboration: {
    type: Boolean,
    default: true
  },
  maxCollaborators: {
    type: Number,
    default: 5
  },
  requirements: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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

// Index for search optimization
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ techStack: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ isOpenForCollaboration: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project summary
projectSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    techStack: this.techStack,
    isOpenForCollaboration: this.isOpenForCollaboration,
    createdAt: this.createdAt
  };
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
