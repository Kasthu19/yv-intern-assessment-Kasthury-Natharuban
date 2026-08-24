const mongoose = require('mongoose');

const memberApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicantType: {
      type: String,
      enum: ['INDIVIDUAL', 'COMPANY'],
      required: true
    },
    fullName: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    nic: {
      type: String,
      trim: true
    },
    registrationNo: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    membershipTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipType',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MemberApplication', memberApplicationSchema);
