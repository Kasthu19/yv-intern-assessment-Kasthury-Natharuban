const MembershipType = require('../models/MembershipType');
const { sendSuccess } = require('../utils/responseFormatter');

const getMembershipTypes = async (req, res, next) => {
  try {
    const types = await MembershipType.find({ isActive: true }).sort({ annualFee: 1 });
    return sendSuccess(res, { membershipTypes: types });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMembershipTypes };
