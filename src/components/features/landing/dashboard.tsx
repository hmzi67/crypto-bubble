"use client"

import React, { useState } from "react";
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
            />

            <div className="p-6">
                <h2 className="text-white text-2xl font-bold mb-4">Welcome to Dashboard</h2>
                <p className="text-gray-400">Your trading overview and analytics</p>
            </div>
        </div>
    );
};

export default Dashboard;