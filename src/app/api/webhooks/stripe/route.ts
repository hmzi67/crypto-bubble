import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as PlanType;
  const billingPeriod = session.metadata?.billingPeriod;

  if (!userId || !planType) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const trialEnd = stripeSubscription.trial_end
    ? new Date(stripeSubscription.trial_end * 1000)
    : null;

  const currentPeriodEnd = new Date(
    (stripeSubscription as any).current_period_end * 1000
  );

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      planType,
      status: stripeSubscription.status === "trialing" ? "TRIALING" : "ACTIVE",
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      stripeCustomerId: session.customer as string,
      billingCycle: billingPeriod,
      trialStartedAt: trialEnd ? new Date() : null,
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId,
      planType,
      status: stripeSubscription.status === "trialing" ? "TRIALING" : "ACTIVE",
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      stripeCustomerId: session.customer as string,
      billingCycle: billingPeriod,
      trialStartedAt: trialEnd ? new Date() : null,
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd,
    },
  });

  console.log(`✅ Subscription created/updated for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  const planType = subscription.metadata?.planType as PlanType;
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const trialEnd = (subscription as any).trial_end
    ? new Date((subscription as any).trial_end * 1000)
    : null;

  let status: SubscriptionStatus = "ACTIVE";
  if (subscription.status === "trialing") status = "TRIALING";
  else if (subscription.status === "past_due") status = "PAST_DUE";
  else if (subscription.status === "canceled") status = "CANCELLED";
  else if (subscription.status === "unpaid") status = "EXPIRED";

  await prisma.subscription.update({
    where: { userId },
    data: {
      planType,
      status,
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      canceledAt: (subscription as any).canceled_at
        ? new Date((subscription as any).canceled_at * 1000)
        : null,
    },
  });

  console.log(`✅ Subscription updated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "CANCELLED",
      planType: "FREE",
      canceledAt: new Date(),
    },
  });

  console.log(`✅ Subscription cancelled for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    },
  });

  console.log(`✅ Payment succeeded for user ${userId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "PAST_DUE",
    },
  });

  console.log(`⚠️ Payment failed for user ${userId}`);
}
