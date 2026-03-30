"use strict";

const requireOrganization = (req, res, next) => {
  if (!req.user?.organization) {
    return res.status(403).json({
      success: false,
      message: 'Organization membership is required for this action.',
    });
  }

  req.orgId = req.user.organization;
  return next();
};

const requireOrgRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.orgRole || !roles.includes(req.user.orgRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient organization permissions.',
      });
    }

    return next();
  };
};

module.exports = { requireOrganization, requireOrgRole };
