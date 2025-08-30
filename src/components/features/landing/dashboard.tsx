"use client"

import React, { useState } from "react";
import { Home } from "lucide-react";
import Header from "@/components/layout/header";

const Dashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header
                title="DASHBOARD"
                subtitle="Trading Analytics & Overview"
                onSearchChange={setSearchTerm}
                searchTerm={searchTerm}
                showCategories={false}
                showControls={false}
                placeholder="Search assets, charts, or tools..."
                rightActions={
                    <button className="group p-3 text-gray-400 hover:text-white hover:bg-green-600/20 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-green-500/50">
                        <Home className="w-5 h-5" />
                    </button>
                }
            />

            <div className="p-6">
                <h2 className="text-white text-2xl font-bold mb-4">Welcome to Dashboard</h2>
                <p className="text-gray-400">Your trading overview and analytics</p>
            </div>
        </div>
    );
};

export default Dashboard;