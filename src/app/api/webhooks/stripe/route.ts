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
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  Webhook signature verification failed.`, errMsg);
      return NextResponse.json(
        { error: `Webhook Error: ${errMsg}` },
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
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    console.log("🔵 Processing checkout.session.completed", { sessionId: session.id });
    
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType as PlanType;
    const billingPeriod = session.metadata?.billingPeriod;

    console.log("Metadata:", { userId, planType, billingPeriod });

    if (!userId || !planType) {
      console.error("❌ Missing metadata in checkout session:", { userId, planType });
      return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("Stripe subscription data:", {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      trial_start: stripeSubscription.trial_start,
      trial_end: stripeSubscription.trial_end,
      current_period_start: stripeSubscription.items.data[0]?.current_period_start,
      current_period_end: stripeSubscription.items.data[0]?.current_period_end,
    });

    const trialEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null;
      
    const trialStart = stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000)
      : null;

    // Use current_period_start/end if available, otherwise use trial dates as fallback
    const itemPeriod = stripeSubscription.items.data[0];
    const currentPeriodStart = itemPeriod?.current_period_start
      ? new Date(itemPeriod.current_period_start * 1000)
      : (trialStart || new Date());
    
    const currentPeriodEnd = itemPeriod?.current_period_end
      ? new Date(itemPeriod.current_period_end * 1000)
      : trialEnd;

    const status: SubscriptionStatus = stripeSubscription.status === "trialing" ? "TRIALING" : "ACTIVE";

    const subscriptionData = {
      planType,
      status,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      stripeCustomerId: session.customer as string,
      billingCycle: billingPeriod,
      trialStartedAt: trialStart,
      trialEndsAt: trialEnd,
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: false,
    };

    await prisma.subscription.upsert({
      where: { userId },
      update: subscriptionData,
      create: {
        userId,
        ...subscriptionData,
      },
    });

    console.log(`✅ Subscription created/updated for user ${userId} - Plan: ${planType}, Status: ${status}`);
  } catch (error: unknown) {
    console.error("❌ Error in handleCheckoutComplete:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    console.log("🔵 Processing subscription update", { subscriptionId: subscription.id });
    
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error("❌ Missing userId in subscription metadata");
      return;
    }

  const planType = subscription.metadata?.planType as PlanType;
  
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000)
    : null;

  const subItem = subscription.items.data[0];
  const currentPeriodStart = subItem?.current_period_start
    ? new Date(subItem.current_period_start * 1000)
    : (trialStart || new Date());
  
  const currentPeriodEnd = subItem?.current_period_end
    ? new Date(subItem.current_period_end * 1000)
    : trialEnd;

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
      trialStartedAt: trialStart,
      trialEndsAt: trialEnd,
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });

  console.log(`✅ Subscription updated for user ${userId} - Status: ${status}, Plan: ${planType}`);
  } catch (error: unknown) {
    console.error("❌ Error in handleSubscriptionUpdate:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log("🔵 Processing subscription deleted", { subscriptionId: subscription.id });
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
  } catch (error: unknown) {
    console.error("❌ Error in handleSubscriptionDeleted:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log("🔵 Processing invoice.payment_succeeded", { invoiceId: invoice.id });
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  const paymentSubItem = subscription.items.data[0];
  const currentPeriodStart = paymentSubItem?.current_period_start
    ? new Date(paymentSubItem.current_period_start * 1000)
    : new Date();
  
  const currentPeriodEnd = paymentSubItem?.current_period_end
    ? new Date(paymentSubItem.current_period_end * 1000)
    : null;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
    },
  });

  console.log(`✅ Payment succeeded for user ${userId}`);
  } catch (error: unknown) {
    console.error("❌ Error in handleInvoicePaymentSucceeded:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log("🔵 Processing invoice.payment_failed", { invoiceId: invoice.id });
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

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
  } catch (error: unknown) {
    console.error("❌ Error in handleInvoicePaymentFailed:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    throw error;
  }
}
