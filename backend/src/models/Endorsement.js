const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate endorsements for same skill
endorsementSchema.index({ from: 1, to: 1, skill: 1 }, { unique: true });

// Index for query optimization
endorsementSchema.index({ to: 1 });
endorsementSchema.index({ from: 1 });
endorsementSchema.index({ skill: 1 });
endorsementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Endorsement', endorsementSchema);
