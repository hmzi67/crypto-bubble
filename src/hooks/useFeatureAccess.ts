import { useCallback } from "react";
import { useSubscription } from "./useSubscription";
import { planFeatures, PlanFeatures } from "@/lib/subscription";
import { PlanType } from "@prisma/client";

/**
 * Hook to check if current user has access to specific features
 * based on their subscription plan
 */
export function useFeatureAccess() {
  const { effectivePlan, isLoading } = useSubscription();

  const features = planFeatures[effectivePlan] || planFeatures.FREE;

  /**
   * Check if user has access to a specific feature
   */
  const hasFeature = useCallback((featureName: keyof PlanFeatures): boolean => {
    const featureValue = features[featureName];
    
    // Handle boolean features
    if (typeof featureValue === "boolean") {
      return featureValue;
    }
    
    // Handle numeric features (treat Infinity as true)
    if (typeof featureValue === "number") {
      return featureValue === Infinity || featureValue > 0;
    }
    
    // Handle array features
    if (Array.isArray(featureValue)) {
      return featureValue.length > 0;
    }
    
    return false;
  }, [features]);

  /**
   * Check if user's plan meets minimum requirement
   */
  const meetsMinimumPlan = useCallback((requiredPlan: PlanType): boolean => {
    const planHierarchy: Record<PlanType, number> = {
      FREE: 0,
      PRO: 1,
      ENTERPRISE: 2,
    };
    
    return planHierarchy[effectivePlan] >= planHierarchy[requiredPlan];
  }, [effectivePlan]);

  /**
   * Get limit value for a numeric feature
   */
  const getFeatureLimit = useCallback((featureName: keyof PlanFeatures): number => {
    const featureValue = features[featureName];
    
    if (typeof featureValue === "number") {
      return featureValue;
    }
    
    return 0;
  }, [features]);

  return {
    effectivePlan,
    isLoading,
    features,
    hasFeature,
    meetsMinimumPlan,
    getFeatureLimit,
    isPro: effectivePlan === "PRO" || effectivePlan === "ENTERPRISE",
    isFree: effectivePlan === "FREE",
  };
}
