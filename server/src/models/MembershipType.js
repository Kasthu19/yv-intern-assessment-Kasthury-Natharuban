const mongoose = require('mongoose');

const membershipTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    applicableTo: {
      type: String,
      enum: ['INDIVIDUAL', 'COMPANY'],
      required: true
    },
    annualFee: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MembershipType', membershipTypeSchema);
