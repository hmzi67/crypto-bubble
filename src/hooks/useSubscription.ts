import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PlanType } from "@prisma/client";
import { getEffectivePlanType, isSubscriptionActive } from "@/lib/subscription";
import { SubscriptionData } from "@/types";

export function useSubscription() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<PlanType>("FREE");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription");
        const data = await response.json();

        if (data.success) {
          setSubscription(data.subscription);
          setEffectivePlan(data.subscription.effectivePlan);
          setIsActive(data.subscription.isActive);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [session?.user?.id]);

  const startTrial = async (planType: "PRO" | "ENTERPRISE") => {
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start trial");
      }

      setSubscription(data.subscription);
      return { success: true, message: data.message };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const cancelSubscription = async (immediately: boolean = false) => {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediately }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setSubscription(data.subscription);
      return { success: true, message: data.message };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;

    const planFeatures: Record<PlanType, string[]> = {
      FREE: ["basic"],
      PRO: ["basic", "advanced", "alerts", "export", "charts"],
      ENTERPRISE: [
        "basic",
        "advanced",
        "alerts",
        "export",
        "charts",
        "api",
        "whitelabel",
      ],
    };

    return planFeatures[effectivePlan]?.includes(feature) || false;
  };

  const isPro = effectivePlan === "PRO" || effectivePlan === "ENTERPRISE";
  const isEnterprise = effectivePlan === "ENTERPRISE";
  const isFree = effectivePlan === "FREE";

  return {
    subscription,
    effectivePlan,
    isActive,
    isLoading,
    isPro,
    isEnterprise,
    isFree,
    startTrial,
    cancelSubscription,
    hasFeature,
  };
}
