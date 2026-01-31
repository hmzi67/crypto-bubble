import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserPlanFeatures, userHasFeature } from "@/lib/subscription";
import { PlanFeatures } from "@/lib/subscription";

/**
 * Check if authenticated user has access to a specific feature
 */
export async function checkFeatureAccess(
  req: NextRequest,
  featureName: keyof PlanFeatures
): Promise<{ authorized: boolean; response?: NextResponse; userId?: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to access this feature" },
        { status: 401 }
      ),
    };
  }

  const hasAccess = await userHasFeature(session.user.id, featureName);

  if (!hasAccess) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Subscription required",
          message: `This feature requires a premium subscription. Please upgrade your plan.`,
          feature: featureName,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
  };
}

/**
 * Middleware wrapper to protect API routes with feature requirements
 */
export function withFeatureAccess(
  featureName: keyof PlanFeatures,
  handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { authorized, response, userId } = await checkFeatureAccess(req, featureName);

    if (!authorized || !userId) {
      return response!;
    }

    return handler(req, { userId });
  };
}

/**
 * Check if user's plan meets minimum requirement
 */
export async function checkMinimumPlan(
  userId: string,
  requiredPlan: "PRO" | "ENTERPRISE"
): Promise<boolean> {
  const features = await getUserPlanFeatures(userId);
  
  // If they have PRO features, they meet PRO requirement
  if (requiredPlan === "PRO") {
    return features.advancedCharts || features.historicalDataAccess;
  }
  
  // If they need ENTERPRISE, check for enterprise-specific features
  if (requiredPlan === "ENTERPRISE") {
    return features.apiAccess || features.whiteLabel;
  }
  
  return false;
}
