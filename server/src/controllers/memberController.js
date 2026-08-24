const Membership = require('../models/Membership');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * Member listing with search (name/email), status filter, and pagination (F-09, requires 'member.view')
 */
const listMembers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ['ACTIVE', 'EXPIRED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    // Build aggregation / population search pipeline
    let userMatch = {};
    if (search) {
      userMatch = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Find users matching search criteria if provided
    let matchingUserIds = null;
    if (search) {
      const users = await User.find(userMatch).select('_id');
      matchingUserIds = users.map(u => u._id);
      filter.$or = [
        { userId: { $in: matchingUserIds } },
        { membershipNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const [memberships, total] = await Promise.all([
      Membership.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email userType')
        .populate('membershipTypeId', 'name applicableTo annualFee')
        .populate('applicationId', 'applicantType fullName companyName nic registrationNo phone email address'),
      Membership.countDocuments(filter)
    ]);

    return sendSuccess(res, {
      members: memberships,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Member Directory as CSV (Bonus Feature)
 */
const exportMembersCSV = async (req, res, next) => {
  try {
    const memberships = await Membership.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email')
      .populate('membershipTypeId', 'name applicableTo annualFee')
      .populate('applicationId', 'applicantType fullName companyName nic registrationNo phone email address');

    const headers = [
      'Membership Number',
      'User Name',
      'User Email',
      'Applicant Type',
      'Applicant Name/Company',
      'NIC/Reg No',
      'Phone',
      'Membership Type',
      'Annual Fee (LKR)',
      'Status',
      'Start Date'
    ];

    const rows = memberships.map(m => {
      const app = m.applicationId || {};
      const user = m.userId || {};
      const type = m.membershipTypeId || {};
      const displayName = app.applicantType === 'COMPANY' ? app.companyName : (app.fullName || user.fullName);
      const identifier = app.applicantType === 'COMPANY' ? app.registrationNo : app.nic;

      return [
        `"${m.membershipNumber}"`,
        `"${user.fullName || ''}"`,
        `"${user.email || ''}"`,
        `"${app.applicantType || ''}"`,
        `"${displayName || ''}"`,
        `"${identifier || ''}"`,
        `"${app.phone || ''}"`,
        `"${type.name || ''}"`,
        `"${type.annualFee || 0}"`,
        `"${m.status}"`,
        `"${new Date(m.startDate).toISOString().split('T')[0]}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="members_export_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMembers,
  exportMembersCSV
};
