"use strict";

const { InterviewRoom } = require('../models/room.model');

const startOfMonthUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
};

const enforceInterviewLimit = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const plan = user.subscription?.plan || 'free';

    if (plan !== 'free') {
      return next();
    }

    const thisMonthCount = await InterviewRoom.countDocuments({
      interviewer: user._id,
      createdAt: { $gte: startOfMonthUtc() },
      mode: { $ne: 'take_home' },
    });

    if (thisMonthCount >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Free plan limit reached (3 interviews/month). Upgrade to Pro.',
        data: { upgradeUrl: '/pricing' },
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to validate plan limit',
      error: error.message,
    });
  }
};

module.exports = { enforceInterviewLimit };
