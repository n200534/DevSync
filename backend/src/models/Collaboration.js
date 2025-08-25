const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate collaborations
collaborationSchema.index({ user: 1, project: 1 }, { unique: true });

// Index for query optimization
collaborationSchema.index({ project: 1 });
collaborationSchema.index({ user: 1 });

module.exports = mongoose.model('Collaboration', collaborationSchema);
