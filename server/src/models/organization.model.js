"use strict";

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'interviewer', 'candidate'],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    logo: { type: String },
    domain: { type: String, lowercase: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [memberSchema], default: [] },
    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
      seats: { type: Number, default: 1 },
      stripeCustomerId: { type: String },
    },
    settings: {
      allowCandidateSelfRegister: { type: Boolean, default: false },
      requireProctoring: { type: Boolean, default: false },
      defaultInterviewDuration: { type: Number, default: 60 },
      brandColor: { type: String, default: '#1f2937' },
    },
  },
  { timestamps: true }
);

organizationSchema.index({ owner: 1, createdAt: -1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = { Organization };
