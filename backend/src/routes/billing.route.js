"use strict";

const { Router } = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getSubscription,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
} = require('../controllers/billing.controller');

const router = Router();

router.post('/webhook', handleWebhook);

router.use(protect);
router.get('/subscription', getSubscription);
router.post('/checkout', createCheckoutSession);
router.post('/portal', createPortalSession);

module.exports = router;
