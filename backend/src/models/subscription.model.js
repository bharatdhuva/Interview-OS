"use strict";

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    stripeSubscriptionId: { type: String, required: true, unique: true, index: true },
    stripeCustomerId: { type: String, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    plan: { type: String, enum: ['free', 'pro', 'team'], required: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'unpaid'],
      default: 'active',
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEnd: { type: Date },
    latestInvoice: {
      id: { type: String },
      amountPaid: { type: Number },
      invoicePdf: { type: String },
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, createdAt: -1 });
subscriptionSchema.index({ organization: 1, createdAt: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Subscription };
