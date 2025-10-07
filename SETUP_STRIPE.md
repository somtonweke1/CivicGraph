# 🔐 Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for CivicGraph to start generating revenue.

---

## 📋 Prerequisites

1. **Stripe Account**: Sign up at https://stripe.com
2. **Vercel Account**: For deployment (you already have this)
3. **Supabase Database**: Already configured ✅

---

## 🚀 Step 1: Create Stripe Account and Get API Keys

### 1.1 Create Stripe Account
1. Go to https://stripe.com
2. Click "Start now" or "Sign in"
3. Complete account setup
4. Verify your email

### 1.2 Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Find your **Publishable key** (starts with `pk_test_`)
3. Find your **Secret key** (starts with `sk_test_`)
4. Copy both keys

### 1.3 Add to Environment Variables

**For Local Development:**
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**For Vercel Production:**
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add these variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your publishable key
   - `STRIPE_SECRET_KEY` = your secret key
3. Click "Save"
4. Redeploy your app

---

## 💳 Step 2: Create Stripe Products and Prices

You need to create a product and price for each subscription tier.

### Option A: Using Stripe Dashboard (Easier)

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. For each tier, create:

**Pro Tier:**
- **Name**: CivicGraph Pro
- **Description**: Unlimited actions, AI recommendations, priority support
- **Pricing**: Recurring, $29/month
- **Price ID**: Copy this (e.g., `price_xxxxx`) - you'll need it!

**Team Tier:**
- **Name**: CivicGraph Team
- **Description**: Everything in Pro + 5 user seats, team dashboard
- **Pricing**: Recurring, $99/month
- **Price ID**: Copy this

### Option B: Using Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products and prices
stripe products create \
  --name="CivicGraph Pro" \
  --description="Unlimited actions and AI features"

stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month
```

### Update Price IDs in Code

Once you have your price IDs from Stripe, update them in:

**File: `app/pricing/page.tsx`**
```typescript
{
  name: "Pro",
  priceId: "price_xxxxx", // ← Replace with your actual Stripe price ID
},
{
  name: "Team",
  priceId: "price_xxxxx", // ← Replace with your actual Stripe price ID
}
```

**File: `supabase/migrations/002_subscription_schema.sql`**
```sql
INSERT INTO stripe_prices (plan_name, price_id, amount, interval)
VALUES
  ('Pro', 'price_xxxxx', 2900, 'month'), -- ← Replace with actual price ID
  ('Team', 'price_xxxxx', 9900, 'month'); -- ← Replace with actual price ID
```

Then run the migration:
```bash
# Apply migration to Supabase
supabase db push
```

---

## 🔔 Step 3: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app when subscriptions are created, updated, or canceled.

### 3.1 Install Stripe CLI (for local testing)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_`. Add it to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3.2 Set Up Production Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://civicgraph.vercel.app/api/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Vercel environment variables:
   - Variable: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_your_production_webhook_secret`
8. Redeploy

---

## ✅ Step 4: Test the Integration

### 4.1 Test Locally

1. Start your dev server:
```bash
npm run dev
```

2. In another terminal, start webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Go to http://localhost:3000/pricing

4. Click "Start 14-Day Trial" on Pro plan

5. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

6. Complete checkout

7. Check your terminal for webhook events

8. Verify in Supabase that user's `subscription_tier` was updated:
```sql
SELECT id, username, subscription_tier, subscription_status
FROM user_profiles
WHERE subscription_tier != 'Free';
```

### 4.2 Test Production

1. Deploy to Vercel:
```bash
git add .
git commit -m "Add Stripe payment integration"
git push
```

2. Go to https://civicgraph.vercel.app/pricing

3. Test the same flow

4. Check Stripe Dashboard → Payments to see test payments

---

## 🔒 Step 5: Run Database Migration

Apply the subscription schema to Supabase:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Studio:
# Go to https://app.supabase.com/project/YOUR_PROJECT/sql
# Copy content from supabase/migrations/002_subscription_schema.sql
# Execute it
```

This adds:
- `subscription_tier` column to `user_profiles`
- `subscription_status` column
- `subscription_id` column
- `stripe_customer_id` column
- `usage_tracking` table for metering
- Functions for checking limits

---

## 💰 Step 6: Go Live with Real Payments

When you're ready to accept real money:

### 6.1 Activate Your Stripe Account
1. Complete business verification at https://dashboard.stripe.com/account/onboarding
2. Add bank account for payouts
3. Complete tax forms (W-9 if US-based)

### 6.2 Switch to Live Mode
1. Go to https://dashboard.stripe.com/apikeys
2. Toggle from "Test mode" to "Live mode"
3. Get new **live API keys** (start with `pk_live_` and `sk_live_`)
4. Update Vercel environment variables with live keys
5. Create products and prices in live mode
6. Update price IDs in code
7. Set up live webhooks

### 6.3 Update Pricing Page
Change price IDs from test to live versions:
```typescript
{
  name: "Pro",
  priceId: "price_live_xxxxx", // ← Live price ID
}
```

---

## 📊 Step 7: Monitor Revenue

### Stripe Dashboard
- **Revenue**: https://dashboard.stripe.com/payments
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Customers**: https://dashboard.stripe.com/customers
- **Analytics**: https://dashboard.stripe.com/analytics/revenue

### Key Metrics to Track
- **MRR (Monthly Recurring Revenue)**: Total subscription revenue per month
- **Churn Rate**: % of customers who cancel
- **Customer Lifetime Value (LTV)**: Average revenue per customer
- **Conversion Rate**: % of visitors who subscribe

---

## 🎯 Revenue Projections

Based on your monetization strategy:

**Month 1-3 (Beta)**:
- Target: 100 customers
- Mix: 80 Pro ($29), 20 Team ($99)
- **MRR**: $4,300/month
- **ARR**: ~$50K

**Month 4-6 (Launch)**:
- Target: 500 customers
- Mix: 400 Pro, 80 Team, 20 Nonprofit ($299)
- **MRR**: $21,800/month
- **ARR**: ~$260K

**Month 7-12 (Growth)**:
- Target: 1,500 customers
- Mix: 1,000 Pro, 400 Team, 80 Nonprofit, 20 Enterprise ($999)
- **MRR**: $100,000/month
- **ARR**: ~$1.2M

---

## 🚨 Important Security Notes

1. **NEVER commit Stripe secret keys to Git**
   - Already in `.gitignore`: `.env.local`
   - Use environment variables only

2. **Verify webhook signatures**
   - Already implemented in `app/api/webhooks/stripe/route.ts`
   - Prevents unauthorized requests

3. **Use Stripe's official SDK**
   - Already using `stripe` and `@stripe/stripe-js`
   - Don't build your own payment processing

4. **Enable Stripe Radar**
   - Free fraud detection
   - Blocks suspicious payments automatically

5. **Set up email receipts**
   - Go to Stripe Dashboard → Settings → Emails
   - Enable "Successful payments"

---

## 🐛 Troubleshooting

### Problem: Checkout button does nothing
**Solution**: Check browser console for errors. Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set.

### Problem: Webhook not receiving events
**Solution**:
1. Check webhook secret is correct
2. Verify endpoint URL is accessible
3. Check Stripe Dashboard → Webhooks → View logs

### Problem: User subscription_tier not updating
**Solution**:
1. Check webhook is firing (Stripe Dashboard → Webhooks → Events)
2. Check API route logs in Vercel
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Problem: "Invalid price ID" error
**Solution**: Make sure you created the products/prices in Stripe and copied the correct price IDs.

---

## 📚 Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
- **Supabase Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations

---

## ✅ Checklist

Before going live, complete this checklist:

- [ ] Stripe account created and verified
- [ ] API keys added to Vercel environment variables
- [ ] Products and prices created in Stripe
- [ ] Price IDs updated in code
- [ ] Database migration applied
- [ ] Webhooks configured and tested
- [ ] Test checkout flow works
- [ ] Subscription updates work
- [ ] Usage limits enforced for Free tier
- [ ] Email receipts enabled
- [ ] Fraud protection enabled

---

**Once setup is complete, your CivicGraph platform will be a fully functional money-making machine!** 💰🚀

Next steps:
1. Complete Stripe setup (this guide)
2. Build impact report generator (premium feature)
3. Add API with authentication
4. Create white-label customization
5. Build verification system

Each premium feature increases the value proposition and justifies higher pricing tiers, driving revenue growth toward the $15M ARR target! 📈
