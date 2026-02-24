"use client";

import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export function SubscriptionStatus() {
    const { subscription, effectivePlan, isActive, isLoading } = useSubscription();

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Loading subscription...</p>
                </CardContent>
            </Card>
        );
    }

    if (!subscription) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Subscription</CardTitle>
                    <CardDescription>Get started with a free plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/pricing">
                        <Button>View Plans</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = () => {
        if (!isActive) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Expired
                </Badge>
            );
        }

        if (subscription.status === "TRIALING") {
            return (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Trial
                </Badge>
            );
        }

        return (
            <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
            </Badge>
        );
    };

    const getPlanBadge = () => {
        const colors: Record<string, string> = {
            FREE: "bg-gray-500",
            PRO: "bg-blue-500",
            ENTERPRISE: "bg-purple-500",
        };

        return (
            <Badge className={`${colors[effectivePlan]} text-white`}>
                {effectivePlan}
            </Badge>
        );
    };

    const getRemainingDays = () => {
        if (!subscription.trialEndsAt && !subscription.currentPeriodEnd) return null;

        const endDate = subscription.trialEndsAt || subscription.currentPeriodEnd;
        if (!endDate) return null;

        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    };

    const remainingDays = getRemainingDays();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Subscription
                            {getPlanBadge()}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                            {getStatusBadge()}
                            {remainingDays !== null && remainingDays > 0 && (
                                <span className="text-sm">
                                    {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
                                </span>
                            )}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {subscription.status === "TRIALING" && remainingDays !== null && remainingDays <= 3 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Your trial is ending soon! Upgrade now to continue enjoying all features.
                        </p>
                        <Link href="/pricing">
                            <Button className="mt-2" size="sm">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Upgrade Now
                            </Button>
                        </Link>
                    </div>
                )}

                {!isActive && effectivePlan === "FREE" && subscription.planType !== "FREE" && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            Your subscription has expired
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            You&apos;ve been downgraded to the Free plan. Upgrade to regain access to pro features.
                        </p>
                        <Link href="/pricing">
                            <Button className="mt-2" size="sm" variant="destructive">
                                Reactivate Subscription
                            </Button>
                        </Link>
                    </div>
                )}

                {effectivePlan === "FREE" && !subscription.trialStartedAt && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                            Start your 14-day free trial
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Try Pro or Enterprise features risk-free. No credit card required.
                        </p>
                        <Link href="/pricing">
                            <Button className="mt-2" size="sm" variant="outline">
                                View Plans
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
