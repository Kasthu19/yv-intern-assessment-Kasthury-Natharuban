const Membership = require('../models/Membership');
const MemberApplication = require('../models/MemberApplication');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseFormatter');

const getDashboardStats = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalMembers, pendingApplications, approvedThisMonth, totalUsers] = await Promise.all([
      Membership.countDocuments({ status: 'ACTIVE' }),
      MemberApplication.countDocuments({ status: 'PENDING' }),
      MemberApplication.countDocuments({
        status: 'APPROVED',
        reviewedAt: { $gte: startOfMonth }
      }),
      User.countDocuments()
    ]);

    return sendSuccess(res, {
      stats: {
        totalMembers,
        pendingApplications,
        approvedThisMonth,
        totalUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
