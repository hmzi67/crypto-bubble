import "next-auth";
import { PlanType, SubscriptionStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscription?: {
        id: string;
        planType: PlanType;
        status: SubscriptionStatus;
        trialEndsAt: Date | null;
        currentPeriodEnd: Date | null;
      } | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    subscription?: {
      id: string;
      planType: PlanType;
      status: SubscriptionStatus;
      trialEndsAt: Date | null;
      currentPeriodEnd: Date | null;
    } | null;
  }
}
