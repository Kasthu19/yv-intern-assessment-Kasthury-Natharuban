const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberApplication',
      required: true
    },
    membershipNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    membershipTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipType',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED'],
      default: 'ACTIVE',
      index: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year membership standard
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Membership', membershipSchema);
