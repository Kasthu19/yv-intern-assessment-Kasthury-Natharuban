const Joi = require('joi');
const { sendError } = require('../utils/responseFormatter');
const { VALID_PERMISSIONS } = require('../models/OfficerRole');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return sendError(res, 'VALIDATION_ERROR', 'Input validation failed', 400, details);
    }

    req[source] = value;
    next();
  };
};

// Sri Lankan phone number regex: accepts 0771234567, +94771234567, 94771234567
const sriLankanPhoneRegex = /^(?:\+94|94|0)?7[0-9]{8}$/;

const schemas = {
  register: Joi.object({
    fullName: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required()
  }),

  submitApplication: Joi.object({
    applicantType: Joi.string().valid('INDIVIDUAL', 'COMPANY').required(),
    fullName: Joi.when('applicantType', {
      is: 'INDIVIDUAL',
      then: Joi.string().trim().min(3).max(100).required(),
      otherwise: Joi.string().trim().allow('', null)
    }),
    companyName: Joi.when('applicantType', {
      is: 'COMPANY',
      then: Joi.string().trim().min(3).max(100).required(),
      otherwise: Joi.string().trim().allow('', null)
    }),
    nic: Joi.when('applicantType', {
      is: 'INDIVIDUAL',
      then: Joi.string().trim().required().messages({
        'any.required': 'NIC number is required for individual applicants'
      }),
      otherwise: Joi.string().trim().allow('', null)
    }),
    registrationNo: Joi.when('applicantType', {
      is: 'COMPANY',
      then: Joi.string().trim().required().messages({
        'any.required': 'Business registration number is required for company applicants'
      }),
      otherwise: Joi.string().trim().allow('', null)
    }),
    email: Joi.string().email().lowercase().trim().required(),
    phone: Joi.string().pattern(sriLankanPhoneRegex).required().messages({
      'string.pattern.base': 'Phone number must be a valid Sri Lankan format (e.g., 0771234567 or +94771234567)'
    }),
    address: Joi.string().trim().max(250).required(),
    membershipTypeId: Joi.string().hex().length(24).required()
  }),

  rejectApplication: Joi.object({
    reason: Joi.string().trim().min(3).max(500).required().messages({
      'any.required': 'A reason is required when rejecting an application'
    })
  }),

  createOfficerRole: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().allow('', null),
    permissions: Joi.array().items(Joi.string().valid(...VALID_PERMISSIONS)).default([])
  }),

  updateRolePermissions: Joi.object({
    permissions: Joi.array().items(Joi.string().valid(...VALID_PERMISSIONS)).required()
  }),

  assignRole: Joi.object({
    userId: Joi.string().hex().length(24).required()
  })
};

module.exports = {
  validate,
  schemas
};
