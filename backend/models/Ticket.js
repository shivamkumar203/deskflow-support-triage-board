const mongoose = require('mongoose');

const SLA_TARGETS = {
  urgent: 60,       // 1 hour
  high: 240,        // 4 hours
  medium: 1440,     // 24 hours
  low: 4320         // 72 hours
};

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be one of: low, medium, high, urgent'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in_progress', 'resolved', 'closed'],
        message: 'Status must be one of: open, in_progress, resolved, closed'
      },
      default: 'open'
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Automates createdAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for ageMinutes
ticketSchema.virtual('ageMinutes').get(function () {
  const endTime = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = endTime - new Date(this.createdAt);
  return Math.max(0, Math.floor(diffMs / 60000));
});

// Virtual field for slaBreached
ticketSchema.virtual('slaBreached').get(function () {
  const target = SLA_TARGETS[this.priority];
  if (!target) return false;
  return this.ageMinutes > target;
});

module.exports = mongoose.model('Ticket', ticketSchema);
