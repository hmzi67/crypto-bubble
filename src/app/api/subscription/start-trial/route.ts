import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startTrial } from "@/lib/subscription";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planType } = body;

    if (!planType || !["PRO", "ENTERPRISE"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Check if user already had a trial
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (
      existingSubscription &&
      existingSubscription.trialStartedAt !== null
    ) {
      return NextResponse.json(
        { error: "You have already used your trial period" },
        { status: 400 }
      );
    }

    const subscription = await startTrial(session.user.id, planType, 14);

    return NextResponse.json({
      subscription,
      success: true,
      message: "Trial started successfully! You have 14 days to explore all features.",
    });
  } catch (error) {
    console.error("Error starting trial:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 }
    );
  }
}
