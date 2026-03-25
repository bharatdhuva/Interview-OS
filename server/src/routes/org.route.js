"use strict";

const { Router } = require('express');
const { protect } = require('../middleware/auth.middleware');
const { requireOrganization, requireOrgRole } = require('../middleware/orgScope.middleware');
const {
  createOrganization,
  getMyOrganization,
  inviteMember,
  listMembers,
  updateMemberRole,
  removeMember,
} = require('../controllers/org.controller');

const router = Router();

router.use(protect);

router.post('/', createOrganization);
router.get('/', requireOrganization, getMyOrganization);
router.post('/invite', requireOrganization, requireOrgRole('owner', 'admin'), inviteMember);
router.get('/members', requireOrganization, requireOrgRole('owner', 'admin'), listMembers);
router.patch('/members/:userId/role', requireOrganization, requireOrgRole('owner', 'admin'), updateMemberRole);
router.delete('/members/:userId', requireOrganization, requireOrgRole('owner', 'admin'), removeMember);

module.exports = router;
