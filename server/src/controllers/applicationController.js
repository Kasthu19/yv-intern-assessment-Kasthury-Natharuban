const MemberApplication = require('../models/MemberApplication');
const Membership = require('../models/Membership');
const MembershipType = require('../models/MembershipType');
const AuditLog = require('../models/AuditLog');
const generateMembershipNumber = require('../utils/membershipNumberGenerator');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * Submit a membership application (F-04)
 */
const submitApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      applicantType,
      fullName,
      companyName,
      nic,
      registrationNo,
      email,
      phone,
      address,
      membershipTypeId
    } = req.body;

    // BR-03: Check if user already holds a PENDING application
    const existingPending = await MemberApplication.findOne({ userId, status: 'PENDING' });
    if (existingPending) {
      return sendError(
        res,
        'APPLICATION_PENDING_EXISTS',
        'You already have an active membership application in PENDING status. Please wait for review.',
        400
      );
    }

    // Verify membership type exists and matches applicant type
    const membershipType = await MembershipType.findById(membershipTypeId);
    if (!membershipType || !membershipType.isActive) {
      return sendError(res, 'NOT_FOUND', 'Selected membership type is invalid or inactive', 400);
    }

    if (membershipType.applicableTo !== applicantType) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        `Membership type '${membershipType.name}' is for ${membershipType.applicableTo} applicants only`,
        400
      );
    }

    const application = await MemberApplication.create({
      userId,
      applicantType,
      fullName: applicantType === 'INDIVIDUAL' ? fullName : undefined,
      companyName: applicantType === 'COMPANY' ? companyName : undefined,
      nic: applicantType === 'INDIVIDUAL' ? nic : undefined,
      registrationNo: applicantType === 'COMPANY' ? registrationNo : undefined,
      email,
      phone,
      address,
      membershipTypeId,
      status: 'PENDING'
    });

    return sendSuccess(res, { application }, 'Membership application submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user's own application and membership details (F-05, BR-11)
 */
const getMyApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get latest application
    const application = await MemberApplication.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('membershipTypeId');

    let membership = null;
    if (application && application.status === 'APPROVED') {
      membership = await Membership.findOne({ userId, applicationId: application._id }).populate('membershipTypeId');
    }

    return sendSuccess(res, {
      hasApplication: !!application,
      application,
      membership
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List applications with status filter and pagination (F-06, requires 'application.view')
 */
const listApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const [applications, total] = await Promise.all([
      MemberApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email userType')
        .populate('membershipTypeId', 'name applicableTo annualFee')
        .populate('reviewedBy', 'fullName email'),
      MemberApplication.countDocuments(filter)
    ]);

    return sendSuccess(res, {
      applications,
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
 * Approve application (F-07, BR-02, BR-10, requires 'application.approve')
 */
const approveApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const reviewerId = req.user._id;

    const application = await MemberApplication.findById(applicationId);
    if (!application) {
      return sendError(res, 'NOT_FOUND', 'Application not found', 404);
    }

    if (application.status !== 'PENDING') {
      return sendError(res, 'BAD_REQUEST', `Application is already ${application.status.toLowerCase()}`, 400);
    }

    // Generate unique membership number (YV-2026-XXXXXX)
    const membershipNumber = await generateMembershipNumber();

    // Create Active Membership record
    const membership = await Membership.create({
      userId: application.userId,
      applicationId: application._id,
      membershipNumber,
      membershipTypeId: application.membershipTypeId,
      status: 'ACTIVE',
      startDate: new Date()
    });

    // Update Application Status
    application.status = 'APPROVED';
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();
    await application.save();

    // Audit Log (BR-09)
    await AuditLog.create({
      actorUserId: reviewerId,
      action: 'APPLICATION_APPROVED',
      entityType: 'MemberApplication',
      entityId: application._id,
      details: {
        membershipNumber,
        applicantType: application.applicantType,
        applicantEmail: application.email
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    return sendSuccess(
      res,
      { application, membership },
      `Application approved successfully. Membership Number: ${membershipNumber}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reject application (F-08, requires 'application.reject')
 */
const rejectApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const reviewerId = req.user._id;
    const { reason } = req.body;

    const application = await MemberApplication.findById(applicationId);
    if (!application) {
      return sendError(res, 'NOT_FOUND', 'Application not found', 404);
    }

    if (application.status !== 'PENDING') {
      return sendError(res, 'BAD_REQUEST', `Application is already ${application.status.toLowerCase()}`, 400);
    }

    application.status = 'REJECTED';
    application.rejectionReason = reason;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();
    await application.save();

    // Audit Log (BR-09)
    await AuditLog.create({
      actorUserId: reviewerId,
      action: 'APPLICATION_REJECTED',
      entityType: 'MemberApplication',
      entityId: application._id,
      details: {
        reason,
        applicantEmail: application.email
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    return sendSuccess(res, { application }, 'Application rejected successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplicationStatus,
  listApplications,
  approveApplication,
  rejectApplication
};
