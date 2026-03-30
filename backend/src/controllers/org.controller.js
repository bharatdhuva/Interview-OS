"use strict";

const { z } = require('zod');
const { Organization } = require('../models/organization.model');
const { User } = require('../models/user.model');

const createOrgSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'interviewer', 'candidate']).default('candidate'),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'interviewer', 'candidate']),
});

const createOrganization = async (req, res) => {
  try {
    const payload = createOrgSchema.parse(req.body);

    const existing = await Organization.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Organization slug already exists' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.organization) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to an organization',
      });
    }

    const org = await Organization.create({
      name: payload.name,
      slug: payload.slug,
      domain: payload.domain,
      owner: user._id,
      members: [{ user: user._id, role: 'owner', invitedBy: user._id }],
      subscription: {
        plan: user.subscription?.plan || 'free',
        seats: 1,
        stripeCustomerId: user.subscription?.stripeCustomerId,
      },
    });

    user.organization = org._id;
    user.orgRole = 'owner';
    await user.save();

    return res.status(201).json({ success: true, data: org, message: 'Organization created successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', error: error.issues });
    }
    return res.status(500).json({ success: false, message: 'Failed to create organization', error: error.message });
  }
};

const getMyOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role orgRole createdAt');

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, data: org });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch organization', error: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const payload = inviteMemberSchema.parse(req.body);
    const org = await Organization.findById(req.user.organization);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    let memberUser = await User.findOne({ email: payload.email });

    if (!memberUser) {
      memberUser = await User.create({
        name: payload.email.split('@')[0],
        email: payload.email,
        passwordHash: 'placeholder',
        role: payload.role === 'candidate' ? 'candidate' : 'interviewer',
        isEmailVerified: false,
      });
    }

    if (memberUser.organization && String(memberUser.organization) !== String(org._id)) {
      return res.status(400).json({ success: false, message: 'User belongs to another organization' });
    }

    const alreadyMember = org.members.some((m) => String(m.user) === String(memberUser._id));
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this organization' });
    }

    const seats = org.subscription?.seats || 1;
    const plan = org.subscription?.plan || 'free';
    if (plan === 'team' && org.members.length >= seats) {
      return res.status(403).json({
        success: false,
        message: `Seat limit reached for Team plan (${seats}). Upgrade seats to invite more members.`,
      });
    }

    if (plan !== 'team' && org.members.length >= 1) {
      return res.status(403).json({
        success: false,
        message: 'Free/Pro plans support only one user. Upgrade to Team for multi-user access.',
      });
    }

    org.members.push({
      user: memberUser._id,
      role: payload.role,
      invitedBy: req.user.id,
      joinedAt: new Date(),
    });

    await org.save();

    memberUser.organization = org._id;
    memberUser.orgRole = payload.role;
    await memberUser.save();

    return res.status(201).json({
      success: true,
      data: { organizationId: org._id, userId: memberUser._id, email: memberUser.email, role: payload.role },
      message: 'Member invited successfully',
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', error: error.issues });
    }
    return res.status(500).json({ success: false, message: 'Failed to invite member', error: error.message });
  }
};

const listMembers = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization).populate('members.user', 'name email role orgRole');

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({ success: true, count: org.members.length, data: org.members });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to list members', error: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const payload = updateRoleSchema.parse(req.body);
    const { userId } = req.params;

    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const member = org.members.find((m) => String(m.user) === String(userId));
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in organization' });
    }

    if (member.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Owner role cannot be modified' });
    }

    member.role = payload.role;
    await org.save();

    await User.findByIdAndUpdate(userId, { orgRole: payload.role });

    return res.status(200).json({ success: true, message: 'Member role updated successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', error: error.issues });
    }
    return res.status(500).json({ success: false, message: 'Failed to update role', error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const member = org.members.find((m) => String(m.user) === String(userId));
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in organization' });
    }

    if (member.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Owner cannot be removed from organization' });
    }

    org.members = org.members.filter((m) => String(m.user) !== String(userId));
    await org.save();

    await User.findByIdAndUpdate(userId, { $unset: { organization: '', orgRole: '' } });

    return res.status(200).json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove member', error: error.message });
  }
};

module.exports = {
  createOrganization,
  getMyOrganization,
  inviteMember,
  listMembers,
  updateMemberRole,
  removeMember,
};
