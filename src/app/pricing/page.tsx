"use client"

import React, { useState } from "react";
import Header from "@/components/layout/header";
import { Check, ChevronDown } from "lucide-react";
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
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    const faqData = [
        {
            question: "Can I switch plans later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and cryptocurrency payments."
        },
        {
            question: "Is there a free trial for Pro and Enterprise?",
            answer: "Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
            </div>

            <div className="relative z-10">
                <Header
                    title="PRICING"
                    showCategories={false}
                    showSearch={false}
                    showControls={false}
                />

                <div className="container mx-auto px-4 py-16">
                    {/* Header Section */}
                    <div className="text-center mb-12 animate-[fadeIn_0.8s_ease-out_forwards]">
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Choose Your Plan
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
                            Select the perfect plan for your trading needs
                        </p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700 shadow-xl animate-[slideUp_0.8s_ease-out_0.3s_forwards]">
                            <button
                                onClick={() => setBillingPeriod("monthly")}
                                className={`px-6 py-2 rounded-md transition-all duration-300 transform ${
                                    billingPeriod === "monthly"
                                        ? "bg-blue-600 text-white shadow-lg scale-105"
                                        : "text-gray-400 hover:text-white hover:scale-105"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod("yearly")}
                                className={`px-6 py-2 rounded-md transition-all duration-300 relative transform ${
                                    billingPeriod === "yearly"
                                        ? "bg-blue-600 text-white shadow-lg scale-105"
                                        : "text-gray-400 hover:text-white hover:scale-105"
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
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                                className={`relative rounded-2xl p-8 transition-all duration-500 transform animate-[slideUp_0.8s_ease-out_forwards] ${
                                    hoveredCard === index ? 'scale-105 -translate-y-2 shadow-2xl' : 'scale-100'
                                } ${
                                    plan.popular
                                        ? "bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-blue-400 shadow-2xl"
                                        : "bg-gray-800 border border-gray-700 hover:border-gray-600 hover:shadow-2xl"
                                }`}
                            >
                                {/* Glow effect on hover */}
                                {hoveredCard === index && (
                                    <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                                        plan.popular ? 'bg-blue-400/20' : 'bg-blue-600/10'
                                    } blur-xl -z-10 animate-pulse`}></div>
                                )}

                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold animate-bounce shadow-lg">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold mb-2 transition-all duration-300">{plan.name}</h3>
                                    <p className={`text-sm ${plan.popular ? "text-blue-100" : "text-gray-400"}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        <span className={`text-5xl font-bold transition-transform duration-500 inline-block ${
                                            hoveredCard === index ? 'scale-110' : 'scale-100'
                                        }`}>
                                            {plan.monthlyPrice === 0 ? "$0" : `$${calculatePrice(plan.monthlyPrice)}`}
                                        </span>
                                        {plan.monthlyPrice > 0 && (
                                            <span className={`ml-2 ${plan.popular ? "text-blue-100" : "text-gray-400"}`}>
                                                {billingPeriod === "yearly" ? "/year" : "/month"}
                                            </span>
                                        )}
                                    </div>
                                    {getSavingsText(plan.monthlyPrice) && (
                                        <p className="text-green-300 text-sm mt-2 font-semibold animate-pulse">
                                            {getSavingsText(plan.monthlyPrice)}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    className={`w-full py-6 mb-6 font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                                        plan.popular
                                            ? "bg-white text-blue-600 hover:bg-gray-100"
                                            : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                >
                                    {plan.buttonText}
                                </Button>

                                <div className="space-y-4">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div 
                                            key={featureIndex} 
                                            style={{ transitionDelay: `${featureIndex * 50}ms` }}
                                            className={`flex items-start transition-all duration-300 transform ${
                                                hoveredCard === index ? 'translate-x-2' : 'translate-x-0'
                                            }`}
                                        >
                                            <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-300 ${
                                                plan.popular ? "text-green-300" : "text-green-400"
                                            } ${hoveredCard === index ? 'scale-125' : 'scale-100'}`} />
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
                    <div className="mt-20 max-w-4xl mx-auto animate-[fadeIn_0.8s_ease-out_0.8s_forwards]">
                        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqData.map((faq, index) => (
                                <div 
                                    key={index}
                                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden transition-all duration-300 hover:border-blue-500 hover:shadow-xl cursor-pointer group"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <div className="p-6 flex justify-between items-center">
                                        <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors duration-300">{faq.question}</h3>
                                        <ChevronDown className={`w-6 h-6 text-blue-400 transition-transform duration-300 ${
                                            openFaq === index ? 'rotate-180' : 'rotate-0'
                                        }`} />
                                    </div>
                                    <div className={`transition-all duration-300 overflow-hidden ${
                                        openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <p className="text-gray-400 px-6 pb-6">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}