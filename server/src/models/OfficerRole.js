const mongoose = require('mongoose');

const VALID_PERMISSIONS = [
  'member.view',
  'application.view',
  'application.approve',
  'application.reject',
  'role.manage',
  'audit.view'
];

const officerRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    permissions: [
      {
        type: String,
        enum: VALID_PERMISSIONS
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('OfficerRole', officerRoleSchema);
module.exports.VALID_PERMISSIONS = VALID_PERMISSIONS;
