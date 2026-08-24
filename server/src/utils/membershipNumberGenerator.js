const Membership = require('../models/Membership');

/**
 * Generates unique membership number in format YV-2026-XXXXXX
 */
const generateMembershipNumber = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Membership.countDocuments();
  const sequenceNumber = (count + 1).toString().padStart(6, '0');
  
  let membershipNumber = `YV-${currentYear}-${sequenceNumber}`;
  
  // Safety check for uniqueness collisions
  let exists = await Membership.findOne({ membershipNumber });
  let extraOffset = 1;
  while (exists) {
    const altSeq = (count + 1 + extraOffset).toString().padStart(6, '0');
    membershipNumber = `YV-${currentYear}-${altSeq}`;
    exists = await Membership.findOne({ membershipNumber });
    extraOffset++;
  }
  
  return membershipNumber;
};

module.exports = generateMembershipNumber;
