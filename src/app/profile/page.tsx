"use client"

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Calendar,
    CreditCard,
    Crown,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle
} from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchSubscription() {
            if (!session?.user?.id) return;

            try {
                const response = await fetch("/api/subscription");
                const data = await response.json();

                if (data.success) {
                    setSubscription(data.subscription);
                }
            } catch (error) {
                console.error("Error fetching subscription:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (session?.user?.id) {
            fetchSubscription();
        }
    }, [session?.user?.id]);

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to cancel subscription");
            }

            alert("Subscription cancelled successfully. You'll have access until the end of your billing period.");

            // Refresh subscription data
            const subResponse = await fetch("/api/subscription");
            const subData = await subResponse.json();
            if (subData.success) {
                setSubscription(subData.subscription);
            }
        } catch (error: any) {
            console.error("Error:", error);
            alert(error.message || "Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case "PRO":
                return "bg-gradient-to-r from-blue-500 to-purple-500";
            case "ENTERPRISE":
                return "bg-gradient-to-r from-purple-500 to-pink-500";
            default:
                return "bg-gray-600";
        }
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (isActive) {
            return (
                <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                </Badge>
            );
        }

        switch (status) {
            case "TRIALING":
                return (
                    <Badge className="bg-blue-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Trial
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge className="bg-orange-500 text-white">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge className="bg-red-500 text-white">
                        <XCircle className="w-3 h-3 mr-1" />
                        Expired
                    </Badge>
                );
            case "PAST_DUE":
                return (
                    <Badge className="bg-yellow-500 text-white">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Past Due
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-500 text-white">
                        {status}
                    </Badge>
                );
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
            </div>

            <div className="relative z-10">
                <Header
                    title="PROFILE"
                    showCategories={false}
                    showSearch={false}
                    showControls={false}
                />

                <div className="container mx-auto px-4 py-16 max-w-5xl">
                    {/* Success Message */}
                    {showSuccess && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 animate-[fadeIn_0.5s_ease-out]">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <p className="text-green-400 font-medium">
                                Subscription activated successfully! Welcome to your new plan.
                            </p>
                        </div>
                    )}

                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        My Profile
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Information Card */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-400" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Name</p>
                                    <p className="text-white font-medium">
                                        {session.user?.name || "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        Email
                                    </p>
                                    <p className="text-white font-medium">{session.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Member Since
                                    </p>
                                    <p className="text-white font-medium">
                                        {subscription?.createdAt
                                            ? new Date(subscription.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Card */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-purple-400" />
                                    Subscription Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">Current Plan</p>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${getPlanBadgeColor(subscription?.planType || subscription?.effectivePlan)} text-white px-3 py-1`}>
                                            {(subscription?.planType || subscription?.effectivePlan) === "FREE" && <span>Free</span>}
                                            {(subscription?.planType || subscription?.effectivePlan) === "PRO" && (
                                                <>
                                                    <Crown className="w-3.5 h-3.5 mr-1" />
                                                    Pro
                                                </>
                                            )}
                                            {(subscription?.planType || subscription?.effectivePlan) === "ENTERPRISE" && (
                                                <>
                                                    <Crown className="w-3.5 h-3.5 mr-1" />
                                                    Enterprise
                                                </>
                                            )}
                                        </Badge>
                                        {subscription && getStatusBadge(subscription.status, subscription.isActive)}
                                    </div>
                                </div>

                                {subscription?.status === "TRIALING" && subscription?.trialStartedAt && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Trial Started</p>
                                        <p className="text-white font-medium">
                                            {new Date(subscription.trialStartedAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                )}

                                {subscription?.status === "TRIALING" && subscription?.trialEndsAt && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Trial Ends</p>
                                        <p className="text-white font-medium">
                                            {new Date(subscription.trialEndsAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                )}

                                {subscription?.isActive && subscription?.currentPeriodEnd && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">
                                            {subscription.cancelAtPeriodEnd ? "Access Until" : "Renews On"}
                                        </p>
                                        <p className="text-white font-medium">
                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                )}

                                {subscription?.billingCycle && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Billing Cycle</p>
                                        <p className="text-white font-medium capitalize">
                                            {subscription.billingCycle}
                                        </p>
                                    </div>
                                )}

                                {(subscription?.planType !== "FREE" && subscription?.effectivePlan !== "FREE") && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Auto-Renewal</p>
                                        <p className="text-white font-medium">
                                            {!subscription.cancelAtPeriodEnd ? (
                                                <span className="text-green-400">✓ Enabled</span>
                                            ) : (
                                                <span className="text-orange-400">✗ Disabled</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {subscription?.cancelAtPeriodEnd && (
                                    <div className="p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                                        <p className="text-orange-400 text-sm">
                                            Your subscription will be cancelled at the end of the current period.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-wrap gap-4">
                        {(subscription?.planType === "FREE" || subscription?.effectivePlan === "FREE") && (
                            <Button
                                onClick={() => router.push("/pricing")}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade to Pro
                            </Button>
                        )}

                        {subscription?.isActive &&
                            (subscription?.planType !== "FREE" && subscription?.effectivePlan !== "FREE") &&
                            !subscription?.cancelAtPeriodEnd && (
                                <Button
                                    onClick={handleCancelSubscription}
                                    disabled={isCancelling}
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        "Cancel Subscription"
                                    )}
                                </Button>
                            )}

                        {subscription?.cancelAtPeriodEnd && (
                            <Button
                                onClick={() => router.push("/pricing")}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                Reactivate Subscription
                            </Button>
                        )}
                    </div>

                    {/* Features */}
                    {(subscription?.planType !== "FREE" && subscription?.effectivePlan !== "FREE") && subscription?.isActive && (
                        <Card className="mt-8 bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle>Your Plan Features</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Here's what you get with your {subscription.planType || subscription.effectivePlan} plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(subscription.planType === "PRO" || subscription.effectivePlan === "PRO") && (
                                        <>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Access to 1000+ cryptocurrencies</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Real-time updates every 30 seconds</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Advanced charts and analytics</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Priority support</span>
                                            </div>
                                        </>
                                    )}
                                    {(subscription.planType === "ENTERPRISE" || subscription.effectivePlan === "ENTERPRISE") && (
                                        <>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Unlimited cryptocurrency tracking</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">Real-time streaming data</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">API access</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                                <span className="text-gray-300">24/7 premium support</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
