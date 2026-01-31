import { PlanType, SubscriptionStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface PlanFeatures {
  // Data Access Limits
  maxCryptocurrencies: number;
  maxStocks: number;
  maxForexPairs: number;
  
  // Data Features
  realTimeUpdateInterval: number; // in seconds
  historicalDataYears: number;
  historicalDataAccess: boolean;
  
  // Category Access
  cryptoAccess: boolean;
  stocksAccess: boolean;
  forexAccess: boolean;
  
  // Advanced Features
  customAlerts: boolean;
  advancedCharts: boolean;
  multipleTimeframes: boolean;
  detailedAnalytics: boolean;
  
  // Export & API
  exportData: boolean;
  exportFormats: string[]; // csv, json, excel
  apiAccess: boolean;
  
  // Support & Branding
  prioritySupport: boolean;
  whiteLabel: boolean;
  
  // Update & Refresh
  autoRefresh: boolean;
  customRefreshInterval: boolean;
}

export const planFeatures: Record<PlanType, PlanFeatures> = {
  FREE: {
    // Data Access Limits
    maxCryptocurrencies: 50, // Limited to top 50
    maxStocks: 0, // No stock access
    maxForexPairs: 0, // No forex access
    
    // Data Features
    realTimeUpdateInterval: 300, // 5 minutes
    historicalDataYears: 0,
    historicalDataAccess: false, // No historical charts
    
    // Category Access
    cryptoAccess: true, // Only crypto available
    stocksAccess: false,
    forexAccess: false,
    
    // Advanced Features
    customAlerts: false,
    advancedCharts: false,
    multipleTimeframes: false, // Only default timeframe
    detailedAnalytics: false,
    
    // Export & API
    exportData: false,
    exportFormats: [],
    apiAccess: false,
    
    // Support & Branding
    prioritySupport: false,
    whiteLabel: false,
    
    // Update & Refresh
    autoRefresh: false, // Manual refresh only
    customRefreshInterval: false,
  },
  PRO: {
    // Data Access Limits
    maxCryptocurrencies: Infinity, // Unlimited
    maxStocks: Infinity, // Unlimited
    maxForexPairs: Infinity, // Unlimited
    
    // Data Features
    realTimeUpdateInterval: 30, // 30 seconds
    historicalDataYears: 5,
    historicalDataAccess: true,
    
    // Category Access
    cryptoAccess: true,
    stocksAccess: true,
    forexAccess: true,
    
    // Advanced Features
    customAlerts: true,
    advancedCharts: true,
    multipleTimeframes: true,
    detailedAnalytics: true,
    
    // Export & API
    exportData: true,
    exportFormats: ["csv", "json", "excel"],
    apiAccess: false,
    
    // Support & Branding
    prioritySupport: true,
    whiteLabel: false,
    
    // Update & Refresh
    autoRefresh: true,
    customRefreshInterval: true,
  },
  ENTERPRISE: {
    // Data Access Limits
    maxCryptocurrencies: Infinity,
    maxStocks: Infinity,
    maxForexPairs: Infinity,
    
    // Data Features
    realTimeUpdateInterval: 1, // real-time streaming
    historicalDataYears: Infinity,
    historicalDataAccess: true,
    
    // Category Access
    cryptoAccess: true,
    stocksAccess: true,
    forexAccess: true,
    
    // Advanced Features
    customAlerts: true,
    advancedCharts: true,
    multipleTimeframes: true,
    detailedAnalytics: true,
    
    // Export & API
    exportData: true,
    exportFormats: ["csv", "json", "excel", "xml"],
    apiAccess: true,
    
    // Support & Branding
    prioritySupport: true,
    whiteLabel: true,
    
    // Update & Refresh
    autoRefresh: true,
    customRefreshInterval: true,
  },
};

/**
 * Check if a subscription is active (either in trial or paid period)
 */
export function isSubscriptionActive(
  status: SubscriptionStatus,
  trialEndsAt: Date | null,
  currentPeriodEnd: Date | null
): boolean {
  const now = new Date();

  switch (status) {
    case "ACTIVE":
      // Check if current period hasn't ended
      return !currentPeriodEnd || currentPeriodEnd > now;

    case "TRIALING":
      // Check if trial hasn't expired
      return !!trialEndsAt && trialEndsAt > now;

    case "EXPIRED":
    case "CANCELLED":
    case "PAST_DUE":
      return false;

    default:
      return false;
  }
}

/**
 * Get the effective plan type for a user, considering trial expiration
 */
export function getEffectivePlanType(
  planType: PlanType,
  status: SubscriptionStatus,
  trialEndsAt: Date | null,
  currentPeriodEnd: Date | null
): PlanType {
  if (isSubscriptionActive(status, trialEndsAt, currentPeriodEnd)) {
    return planType;
  }

  // If subscription is not active, downgrade to FREE
  return "FREE";
}

/**
 * Check if user has access to a specific feature
 */
export async function userHasFeature(
  userId: string,
  featureName: keyof PlanFeatures
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    // No subscription = FREE plan
    return planFeatures.FREE[featureName] === true;
  }

  const effectivePlan = getEffectivePlanType(
    subscription.planType,
    subscription.status,
    subscription.trialEndsAt,
    subscription.currentPeriodEnd
  );

  const features = planFeatures[effectivePlan];
  return features[featureName] === true || features[featureName] === Infinity;
}

/**
 * Get user's current plan features
 */
export async function getUserPlanFeatures(
  userId: string
): Promise<PlanFeatures> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return planFeatures.FREE;
  }

  const effectivePlan = getEffectivePlanType(
    subscription.planType,
    subscription.status,
    subscription.trialEndsAt,
    subscription.currentPeriodEnd
  );

  return planFeatures[effectivePlan];
}

/**
 * Get user's subscription with computed status
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!subscription) {
    // Create default FREE subscription for user
    return await prisma.subscription.create({
      data: {
        userId,
        planType: "FREE",
        status: "ACTIVE",
      },
      include: { user: true },
    });
  }

  const effectivePlan = getEffectivePlanType(
    subscription.planType,
    subscription.status,
    subscription.trialEndsAt,
    subscription.currentPeriodEnd
  );

  const now = new Date();
  const isActive = isSubscriptionActive(
    subscription.status,
    subscription.trialEndsAt,
    subscription.currentPeriodEnd
  );

  // Auto-update expired trials
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt <= now &&
    isActive === false
  ) {
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "EXPIRED",
        planType: "FREE",
      },
      include: { user: true },
    });
    return { ...updated, effectivePlan: "FREE" as PlanType, isActive: false };
  }

  return {
    ...subscription,
    effectivePlan,
    isActive,
  };
}

/**
 * Start a trial for a user
 */
export async function startTrial(
  userId: string,
  planType: "PRO" | "ENTERPRISE",
  trialDays: number = 14
) {
  const trialStartedAt = new Date();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: {
      planType,
      status: "TRIALING",
      trialStartedAt,
      trialEndsAt,
      currentPeriodStart: trialStartedAt,
      currentPeriodEnd: trialEndsAt,
    },
    create: {
      userId,
      planType,
      status: "TRIALING",
      trialStartedAt,
      trialEndsAt,
      currentPeriodStart: trialStartedAt,
      currentPeriodEnd: trialEndsAt,
    },
  });

  return subscription;
}

/**
 * Upgrade a subscription
 */
export async function upgradeSubscription(
  userId: string,
  planType: PlanType,
  billingCycle: "monthly" | "yearly",
  pricePerMonth: number
) {
  const now = new Date();
  const currentPeriodEnd = new Date();
  
  if (billingCycle === "monthly") {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  }

  return await prisma.subscription.upsert({
    where: { userId },
    update: {
      planType,
      status: "ACTIVE",
      billingCycle,
      pricePerMonth,
      currentPeriodStart: now,
      currentPeriodEnd,
      trialEndsAt: null,
      trialStartedAt: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
    create: {
      userId,
      planType,
      status: "ACTIVE",
      billingCycle,
      pricePerMonth,
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string, immediately: boolean = false) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error("No subscription found");
  }

  if (immediately) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        planType: "FREE",
        canceledAt: new Date(),
        currentPeriodEnd: new Date(),
      },
    });
  } else {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });
  }
}

/**
 * Check if user can access a cryptocurrency limit
 */
export async function canAccessCryptoLimit(
  userId: string,
  requestedLimit: number
): Promise<boolean> {
  const features = await getUserPlanFeatures(userId);
  return requestedLimit <= features.maxCryptocurrencies;
}
