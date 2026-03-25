# 🚀 InterviewOS Deployment Guide

**Complete step-by-step guide to deploy InterviewOS to production using Render (backend) + Vercel (frontend) + MongoDB Atlas.**

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup (Render)](#backend-setup-render)
3. [Frontend Setup (Vercel)](#frontend-setup-vercel)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Environment Variables](#environment-variables)
6. [Stripe Configuration](#stripe-configuration)
7. [Email Service (SendGrid)](#email-service-sendgrid)
8. [Secrets & Security](#secrets--security)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Monitoring & Debugging](#monitoring--debugging)

---

## Prerequisites

Before you start, you need:

- ✅ GitHub account (repo with your code)
- ✅ Render account (https://render.com) — **free tier available**
- ✅ Vercel account (https://vercel.com) — **free tier available**
- ✅ MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) — **free tier available**
- ✅ SendGrid account (https://sendgrid.com) — **free tier: 100 emails/day**
- ✅ Stripe account (https://stripe.com) — for production billing
- ✅ Google OAuth credentials (for sign-in)

---

## Backend Setup (Render)

### Step 1: Prepare Your GitHub Repository

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub

1. Go to https://dashboard.render.com
2. Sign up (free tier available)
3. Go to **Blueprints** → click **New Blueprint**
4. Select your GitHub repository
5. Render will detect `render.yaml` and show all services

### Step 3: Configure Environment Variables

In Render dashboard, set these **encrypted environment variables** for the `interviewos-api` service:

```
NODE_ENV=production
PORT=8090
CLIENT_URL=https://yourdomain.com  ← Your Vercel frontend URL

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/interviewos  ← MongoDB Atlas
JWT_ACCESS_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_REFRESH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
INVITE_TOKEN_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

SENDGRID_API_KEY=<from SendGrid>
FROM_EMAIL=noreply@yourdomain.com

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>

OPENAI_API_KEY=<optional>
REDIS_URL=redis://...  ← if using Redis
```

### Step 4: Deploy

1. Click **Deploy** in Render dashboard
2. Wait for build to complete (2-5 minutes)
3. Verify: Visit `https://interviewos-api.render.com/health` ← should return JSON

```json
{ "status": "ok", "timestamp": "2024-01-15T10:30:00Z" }
```

### Step 5: Enable Auto-Deploys (Optional)

Go to Service Settings → **Auto-Deploy** → Toggle ON

Now every `git push` to main triggers automatic deployment.

---

## Frontend Setup (Vercel)

### Step 1: Import GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Vercel auto-detects `vercel.json` configuration

### Step 2: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://interviewos-api.render.com/api/v1
```

This allows your frontend to communicate with the backend.

### Step 3: Build & Deploy

1. Vercel automatically detects `npm run build` in `frontend/package.json`
2. Click **Deploy**
3. Wait for build (1-2 minutes)
4. Your frontend is live at: `https://interviewos-[random].vercel.app`

### Step 4: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `interviewos.com`)
3. Update DNS records as instructed by Vercel

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier: 512 MB storage)
3. Create organization → Create project

### Step 2: Create Cluster

1. **Create Deployment** → **M0 (Free)** tier
2. Set **Region**: closest to your location
3. Click **Create Cluster** (takes 5-10 min)

### Step 3: Add Network Access

1. Go to **Network Access** on the left sidebar
2. Click **Add IP Address**
3. Select **Allow from anywhere** (for development)
   - Production: Use Render IP or whitelist specific IPs

### Step 4: Create Database User

1. Go to **Database Access**
2. Click **Create Database User**
3. Save username & password (you'll need this)

### Step 5: Get Connection String

1. Click **Databases** → **Connect** button on your cluster
2. Select **Drivers** → **Node.js**
3. Copy connection string:

```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/interviewos?retryWrites=true&w=majority
```

Replace `USERNAME`, `PASSWORD`, and add database name `interviewos`.

This is your `MONGODB_URI` for Render.

---

## Environment Variables

### How to Generate Secure Secrets

```bash
# Generate a 32-character random hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Do this **3 times** for:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `INVITE_TOKEN_SECRET`

### Verifying Environment Variables

Once deployed to Render, verify your backend can access them:

```bash
curl https://interviewos-api.render.com/api/v1/auth/me \
  -H "Authorization: Bearer fake_token"
# Should return 401 (unauthorized), not 500 (misconfigured)
```

---

## Stripe Configuration

### Step 1: Get Stripe Keys

1. Go to https://stripe.com/dashboard
2. Go to **Developers** → **API Keys**
3. Copy **Secret Key** (starts with `sk_live_`)
4. Copy **Publishable Key** (starts with `pk_live_`)

### Step 2: Set Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. URL: `https://interviewos-api.render.com/api/v1/billing/webhook`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Webhook Secret** (starts with `whsec_`)

### Step 3: Save to Render

Add to Render environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## Email Service (SendGrid)

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/free
2. Sign up (free tier: 100 emails/day)
3. Verify email address

### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "InterviewOS Production"
4. Copy key (starts with `SG.`)

### Step 3: Verify Sender Email

1. Go to **Sender Authentication**
2. Click **Verify a Single Sender**
3. Add email: `noreply@yourdomain.com`
4. Click verification link in email

### Step 4: Save to Render

Add to Render environment variables:
- `SENDGRID_API_KEY`
- `FROM_EMAIL=noreply@yourdomain.com`

---

## Secrets & Security

### Best Practices

✅ **DO:**
- Store secrets in Render/Vercel encrypted environment variables (never in code)
- Rotate secrets every 90 days
- Use different secrets for development vs. production
- Enable IP whitelisting in MongoDB Atlas for production
- Use HTTPS for all connections (Render/Vercel enforce this)

❌ **DON'T:**
- Commit `.env` files to Git
- Share secrets in Slack or email
- Use same secrets across environments
- Commit API keys in code

### Managing Secrets in GitHub Actions

If you use GitHub Actions (recommended), store secrets in:

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `RENDER_API_KEY` — for Render deployments
   - `VERCEL_TOKEN` — for Vercel deployments
   - `SENDGRID_API_KEY` — for CI/CD

Then reference in workflows as `${{ secrets.SENDGRID_API_KEY }}`

---

## Post-Deployment Checklist

- [ ] Backend is reachable: `https://interviewos-api.render.com/health`
- [ ] Frontend loads: `https://interviewos-[random].vercel.app`
- [ ] Can register: POST to `/api/v1/auth/register`
- [ ] Verification email was sent (check SendGrid logs)
- [ ] Can verify email: POST to `/api/v1/auth/verify-email`
- [ ] Can login: POST to `/api/v1/auth/login`
- [ ] Token refresh works: POST to `/api/v1/auth/refresh`
- [ ] Stripe webhooks are received (check logs)
- [ ] Database has users (check MongoDB Atlas)

---

## Monitoring & Debugging

### View Logs

**Render Backend Logs:**
```bash
# In Render dashboard → Service → Logs
# Or via CLI:
render logs --service interviewos-api
```

**Vercel Frontend Logs:**
```bash
# In Vercel dashboard → Deployments → Logs
# Or via CLI:
vercel logs
```

**SendGrid Email Logs:**
```
SendGrid dashboard → Email Activity → Filter by email/status
```

### Common Issues

#### "Cannot connect to MongoDB"

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:** Check `MONGODB_URI` environment variable is set correctly in Render.

#### "SendGrid API key invalid"

```
Error: Unauthorized
```

**Fix:** Verify API key is correct and not expired. Create a new one if needed.

#### "CORS error from frontend"

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix:** Check `CLIENT_URL` in Render matches your Vercel domain.

#### "Node modules not installed"

```
Error: Cannot find module 'express'
```

**Fix:** Render's buildCommand should run `npm install`. Check build logs.

---

## Cost Breakdown (as of 2024)

| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Standard (0.5GB RAM) | $12/month |
| Vercel Frontend | Pro | Free (included in Free tier) |
| MongoDB Atlas | M0 (512 MB) | Free |
| SendGrid | Free | Free (100 emails/day) |
| Stripe | Pay-as-you-go | 2.9% + $0.30 per subscription |
| **Total** | | ~$12/month + Stripe % |

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Set up MongoDB Atlas
4. ✅ Configure SendGrid
5. ✅ Integrate Stripe (optional for launch)
6. ⏭️ Set up monitoring (Sentry, DataDog)
7. ⏭️ Configure CDN (Cloudflare)
8. ⏭️ Set up analytics (Mixpanel, Plausible)
9. ⏭️ Create runbooks for common issues

---

## Help & Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/manual
- SendGrid Docs: https://docs.sendgrid.com
- Stripe Docs: https://stripe.com/docs/api

Happy deploying! 🎉
