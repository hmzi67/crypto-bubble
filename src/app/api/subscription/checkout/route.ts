import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planType, billingPeriod } = await req.json();

    if (!planType || !["PRO", "ENTERPRISE"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    if (!billingPeriod || !["monthly", "yearly"].includes(billingPeriod)) {
      return NextResponse.json(
        { error: "Invalid billing period" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Update subscription with customer ID
      if (subscription) {
        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: session.user.id,
            stripeCustomerId: customerId,
            planType: "FREE",
            status: "ACTIVE",
          },
        });
      }
    }

    // Define price IDs (you'll need to create these in your Stripe dashboard)
    // For now, we'll create the prices dynamically or use test mode prices
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planType} Plan`,
            description: planType === "PRO" 
              ? "For serious traders - Advanced analytics and real-time updates"
              : "For professional teams - Unlimited access and API integration",
          },
          recurring: {
            interval: billingPeriod === "yearly" ? "year" : "month",
          },
          unit_amount: 
            planType === "PRO"
              ? billingPeriod === "yearly" 
                ? 31320 // $29 * 12 * 0.9 = $313.20
                : 2900 // $29
              : billingPeriod === "yearly"
                ? 106920 // $99 * 12 * 0.9 = $1069.20
                : 9900, // $99
        },
        quantity: 1,
      },
    ];

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: priceData,
      success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        planType,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planType,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
