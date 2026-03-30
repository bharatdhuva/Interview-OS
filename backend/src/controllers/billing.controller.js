"use strict";

const Stripe = require('stripe');
const { User } = require('../models/user.model');
const { Subscription } = require('../models/subscription.model');

const PLAN_FROM_PRICE = {
  [process.env.STRIPE_PRICE_PRO || 'price_pro']: 'pro',
  [process.env.STRIPE_PRICE_TEAM || 'price_team']: 'team',
};

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const getUser = async (req) => User.findById(req.user.id);

const getSubscription = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const latest = user.subscription || { plan: 'free', status: 'active' };
    return res.status(200).json({ success: true, data: latest });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription', error: error.message });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.',
      });
    }

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ success: false, message: 'priceId is required' });
    }

    const user = await getUser(req);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user._id) },
      });
      customerId = customer.id;

      user.subscription = {
        ...(user.subscription || {}),
        stripeCustomerId: customerId,
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'active',
      };
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: {
        userId: String(user._id),
      },
    });

    return res.status(200).json({ success: true, data: { url: session.url, id: session.id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create checkout session', error: error.message });
  }
};

const createPortalSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing portal.',
      });
    }

    const user = await getUser(req);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'No Stripe customer found for this account' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    return res.status(200).json({ success: true, data: { url: session.url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create billing portal session', error: error.message });
  }
};

const upsertUserSubscription = async ({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  trialEnd,
  plan,
}) => {
  const normalizedPlan = plan || 'free';

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      subscription: {
        stripeCustomerId,
        stripeSubscriptionId,
        plan: normalizedPlan,
        status: status === 'canceled' ? 'cancelled' : status,
        currentPeriodEnd,
        cancelAtPeriodEnd: !!cancelAtPeriodEnd,
        trialEnd,
      },
    });
  }

  if (stripeSubscriptionId) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        stripeCustomerId,
        user: userId,
        plan: normalizedPlan,
        status: status === 'canceled' ? 'cancelled' : status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: !!cancelAtPeriodEnd,
        trialEnd,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const handleWebhook = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe is not configured' });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Stripe signature' });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: 'Missing STRIPE_WEBHOOK_SECRET' });
    }

    const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const subId = session.subscription;

      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items?.data?.[0]?.price?.id;
        await upsertUserSubscription({
          userId,
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
          plan: PLAN_FROM_PRICE[priceId] || 'pro',
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const priceId = sub.items?.data?.[0]?.price?.id;

      const user = await User.findOne({ 'subscription.stripeCustomerId': sub.customer }).select('_id');

      await upsertUserSubscription({
        userId: user?._id,
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        plan: event.type === 'customer.subscription.deleted' ? 'free' : PLAN_FROM_PRICE[priceId] || 'pro',
      });
    }

    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          {
            latestInvoice: {
              id: invoice.id,
              amountPaid: invoice.amount_paid,
              invoicePdf: invoice.invoice_pdf,
            },
            status: event.type === 'invoice.payment_failed' ? 'past_due' : 'active',
          },
          { new: true }
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

module.exports = {
  getSubscription,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
};
