"use client";

import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { PlanType } from "@prisma/client";

interface FeatureGateProps {
    children: React.ReactNode;
    requiredPlan: PlanType;
    feature: string;
    fallback?: React.ReactNode;
}

export function FeatureGate({
    children,
    requiredPlan,
    feature,
    fallback,
}: FeatureGateProps) {
    const { effectivePlan, isLoading } = useSubscription();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const planHierarchy: Record<PlanType, number> = {
        FREE: 0,
        PRO: 1,
        ENTERPRISE: 2,
    };

    const hasAccess = planHierarchy[effectivePlan] >= planHierarchy[requiredPlan];

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <Card className="border-2 border-dashed">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">
                            {requiredPlan} Feature
                        </CardTitle>
                        <CardDescription>
                            Upgrade to {requiredPlan} to access {feature}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Link href="/pricing">
                    <Button className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to {requiredPlan}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

interface PlanBadgeProps {
    requiredPlan: PlanType;
    className?: string;
}

export function PlanBadge({ requiredPlan, className = "" }: PlanBadgeProps) {
    const colors: Record<PlanType, string> = {
        FREE: "bg-gray-500",
        PRO: "bg-blue-500",
        ENTERPRISE: "bg-purple-500",
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${colors[requiredPlan]} ${className}`}
        >
            {requiredPlan}
        </span>
    );
}
