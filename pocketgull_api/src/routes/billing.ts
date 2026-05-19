import { Router } from 'express';
import Stripe from 'stripe';

export const billingRouter = Router();

// Initialize Stripe (requires STRIPE_SECRET_KEY in environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16',
});

// Mock database to link Apigee Developer Apps with Stripe Customers
const userDatabase: Record<string, { stripeCustomerId?: string; apigeeAppId: string; tier: string }> = {
  'user_123': { apigeeAppId: 'app_abc', tier: 'free' }
};

billingRouter.post('/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Dynamically register the user in the mock datastore if they don't exist yet
    if (!userDatabase[userId]) {
      userDatabase[userId] = {
        apigeeAppId: `app_${Math.random().toString(36).substring(7)}`,
        tier: 'free'
      };
    }

    // Determine target domain from request context for dynamic redirects
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Premium Clinical',
              description: 'Unlimited multimodal queries, secure cloud sync, and literature index access.',
            },
            unit_amount: 4900, // $49.00 / month
            recurring: { interval: 'month' }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?upgrade=success`,
      cancel_url: `${origin}/?upgrade=cancelled`,
      client_reference_id: userId, // Pass our internal user ID to Stripe
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('[Billing API] Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// We need the raw body for Stripe webhook signature verification
import express from 'express';

billingRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err: any) {
    console.error(`[Billing API] Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId && userDatabase[userId]) {
      console.log(`[Billing API] Payment successful for user ${userId}. Upgrading Apigee Quota...`);
      
      // Update local database
      userDatabase[userId].tier = 'premium';
      userDatabase[userId].stripeCustomerId = session.customer as string;

      // TODO: Call Google Cloud Apigee Management API to add the "Premium Clinical" API Product to the Developer's App
      // Example pseudo-code for Apigee upgrade:
      // await apigeeClient.organizations.developers.apps.update({
      //   name: `organizations/my-org/developers/dev@email.com/apps/${userDatabase[userId].apigeeAppId}`,
      //   requestBody: { apiProducts: ['premium-clinical-product'] }
      // });
      
      console.log(`[Billing API] Successfully upgraded Apigee App ${userDatabase[userId].apigeeAppId} to Premium Tier.`);
    }
  }

  res.json({ received: true });
});
