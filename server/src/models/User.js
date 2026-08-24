const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Never return password hash by default in queries
    },
    userType: {
      type: String,
      enum: ['CHAIRMAN', 'OFFICER', 'MEMBER'],
      default: 'MEMBER',
      required: true
    },
    officerRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficerRole',
      default: null
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

// Transform schema to remove sensitive fields when converting to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
