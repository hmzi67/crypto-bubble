"use client"

import React, { useState } from "react";
import Header from "@/components/layout/header";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingPeriod = "monthly" | "yearly";

interface PricingPlan {
    name: string;
    description: string;
    monthlyPrice: number;
    features: string[];
    popular?: boolean;
    buttonText: string;
}

const plans: PricingPlan[] = [
    {
        name: "Free",
        description: "Perfect for getting started",
        monthlyPrice: 0,
        features: [
            "Access to top 100 cryptocurrencies",
            "Basic market visualization",
            "24h price changes",
            "Real-time updates every 5 minutes",
            "Community support"
        ],
        buttonText: "Get Started"
    },
    {
        name: "Pro",
        description: "For serious traders",
        monthlyPrice: 29,
        popular: true,
        features: [
            "All Free features",
            "Access to 1000+ cryptocurrencies",
            "Advanced charts and analytics",
            "Real-time updates every 30 seconds",
            "Historical data (1 year)",
            "Custom alerts and notifications",
            "Priority support",
            "Export data to CSV"
        ],
        buttonText: "Start Pro Trial"
    },
    {
        name: "Enterprise",
        description: "For professional teams",
        monthlyPrice: 99,
        features: [
            "All Pro features",
            "Unlimited cryptocurrency tracking",
            "Real-time streaming data",
            "Historical data (unlimited)",
            "API access",
            "Custom integrations",
            "Dedicated account manager",
            "24/7 premium support",
            "White-label options"
        ],
        buttonText: "Contact Sales"
    }
];

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

    const calculatePrice = (monthlyPrice: number) => {
        if (monthlyPrice === 0) return 0;
        if (billingPeriod === "yearly") {
            return Math.round(monthlyPrice * 12 * 0.9); // 10% discount
        }
        return monthlyPrice;
    };

    const getDisplayPrice = (monthlyPrice: number) => {
        const price = calculatePrice(monthlyPrice);
        if (billingPeriod === "yearly") {
            return `$${price}/year`;
        }
        return `$${price}/mo`;
    };

    const getSavingsText = (monthlyPrice: number) => {
        if (monthlyPrice === 0 || billingPeriod === "monthly") return null;
        const savings = Math.round(monthlyPrice * 12 * 0.1);
        return `Save $${savings}/year`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Header
                title="PRICING"
                showCategories={false}
                showSearch={false}
                showControls={false}
            />

            <div className="container mx-auto px-4 py-16">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Select the perfect plan for your trading needs
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={() => setBillingPeriod("monthly")}
                            className={`px-6 py-2 rounded-md transition-all duration-200 ${billingPeriod === "monthly"
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod("yearly")}
                            className={`px-6 py-2 rounded-md transition-all duration-200 relative ${billingPeriod === "yearly"
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Yearly
                            
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${plan.popular
                                    ? "bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-blue-400 shadow-2xl"
                                    : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className={`text-sm ${plan.popular ? "text-blue-100" : "text-gray-400"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-bold">
                                        {plan.monthlyPrice === 0 ? "$0" : `$${calculatePrice(plan.monthlyPrice)}`}
                                    </span>
                                    {plan.monthlyPrice > 0 && (
                                        <span className={`ml-2 ${plan.popular ? "text-blue-100" : "text-gray-400"}`}>
                                            {billingPeriod === "yearly" ? "/year" : "/month"}
                                        </span>
                                    )}
                                </div>
                                {getSavingsText(plan.monthlyPrice) && (
                                    <p className="text-green-300 text-sm mt-2 font-semibold">
                                        {getSavingsText(plan.monthlyPrice)}
                                    </p>
                                )}
                            </div>

                            <Button
                                className={`w-full py-6 mb-6 font-semibold text-lg transition-all duration-200 ${plan.popular
                                        ? "bg-white text-blue-600 hover:bg-gray-100"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {plan.buttonText}
                            </Button>

                            <div className="space-y-4">
                                {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-start">
                                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${plan.popular ? "text-green-300" : "text-green-400"
                                            }`} />
                                        <span className={`text-sm ${plan.popular ? "text-blue-50" : "text-gray-300"}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
                            <p className="text-gray-400">
                                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-gray-400">
                                We accept all major credit cards, PayPal, and cryptocurrency payments.
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2">Is there a free trial for Pro and Enterprise?</h3>
                            <p className="text-gray-400">
                                Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
