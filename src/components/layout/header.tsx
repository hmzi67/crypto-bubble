"use client"

import React, { useState } from "react";
import { Search, Settings, Menu, TrendingUp, DollarSign, BarChart3, User } from "lucide-react";

type HeaderProps = {
    title?: string;
    subtitle?: string;
    onSearchChange?: (term: string) => void;
    onCategoryChange?: (category: string) => void;
    onRestartAnimation?: () => void;
    searchTerm?: string;
    selectedCategory?: string;
    showCategories?: boolean;
    showSearch?: boolean;
    showControls?: boolean;
    placeholder?: string;
    categories?: Array<{
        id: string;
        label: string;
        icon: React.ReactNode;
    }>;
    rightActions?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
    title = "MARKET BUBBLES",
    subtitle = "Live Market Visualization",
    onSearchChange,
    onCategoryChange,
    onRestartAnimation,
    searchTerm = "",
    selectedCategory = "crypto",
    showCategories = true,
    showSearch = true,
    showControls = true,
    placeholder,
    categories,
    rightActions
}) => {
    const [selectedRange, setSelectedRange] = useState<string>("1 - 100");
    const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

    const defaultCategories = [
        { id: "crypto", label: "Crypto", icon: <TrendingUp className="w-4 h-4" /> },
        { id: "forex", label: "Forex", icon: <DollarSign className="w-4 h-4" /> },
        { id: "forex-pair", label: "Forex Pairs", icon: <BarChart3 className="w-4 h-4" /> }
    ];

    const categoriesData = categories || defaultCategories;
    const searchPlaceholder = placeholder || `Search ${selectedCategory === 'crypto' ? 'cryptocurrency' : selectedCategory === 'forex' ? 'currencies' : 'forex pairs'}`;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onSearchChange?.(value);
    };

    return (
        <div className="min-w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-2xl">
            {/* Main Header */}
            <div className="flex items-center justify-between p-6">
                {/* Left Section - Brand and Categories */}
                <div className="flex items-center gap-6">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-black text-lg">
                                    {title.split(' ').map(word => word[0]).join('').substring(0, 2)}
                                </span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                        </div>
                        <div>
                            <h1 className="text-white text-2xl font-black tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {title}
                            </h1>
                            <p className="text-gray-400 text-xs font-medium">{subtitle}</p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    {showCategories && (
                        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                            {categoriesData.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onCategoryChange?.(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${selectedCategory === category.id
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                                            : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                >
                                    {category.icon}
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Section - Controls */}
                <div className="flex items-center gap-4">
                    {/* Enhanced Search Bar */}
                    {showSearch && (
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="bg-gray-800/80 backdrop-blur-sm text-white pl-12 pr-4 py-3 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:bg-gray-800 focus:outline-none w-72 transition-all duration-300 shadow-inner"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                    )}

                    {/* Controls */}
                    {showControls && (
                        <>
                            {/* Range Selector */}
                            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                                <span className="text-gray-300 text-sm font-medium">Range:</span>
                                <select
                                    value={selectedRange}
                                    onChange={(e) => setSelectedRange(e.target.value)}
                                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer hover:text-blue-400 transition-colors"
                                >
                                    <option value="1 - 50" className="bg-gray-800">1 - 50</option>
                                    <option value="1 - 100" className="bg-gray-800">1 - 100</option>
                                    <option value="1 - 200" className="bg-gray-800">1 - 200</option>
                                    <option value="1 - 500" className="bg-gray-800">1 - 500</option>
                                </select>
                            </div>

                            {/* Currency Selector */}
                            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                                <span className="text-gray-300 text-sm font-medium">Currency:</span>
                                <select
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer hover:text-blue-400 transition-colors"
                                >
                                    <option value="USD" className="bg-gray-800">$ USD</option>
                                    <option value="EUR" className="bg-gray-800">€ EUR</option>
                                    <option value="GBP" className="bg-gray-800">£ GBP</option>
                                    <option value="JPY" className="bg-gray-800">¥ JPY</option>
                                    <option value="BTC" className="bg-gray-800">₿ BTC</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onRestartAnimation}
                                    className="group p-3 text-gray-400 hover:text-white hover:bg-blue-600/20 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50"
                                    title="Restart Animation"
                                >
                                    <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                                </button>
                                <button className="group p-3 text-gray-400 hover:text-white hover:bg-purple-600/20 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50">
                                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* User Profile */}
                    <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">Hamza</span>
                    </div>

                    {/* Custom Right Actions */}
                    {rightActions}
                </div>
            </div>

            {/* Category-specific Information Bar */}
            <div className="px-6 pb-4">
                <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center gap-6">
                        <div className="text-sm">
                            <span className="text-gray-400">Market Status:</span>
                            <span className="text-green-400 font-semibold ml-2 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Live
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-400">Last Update:</span>
                            <span className="text-white font-semibold ml-2">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                        {selectedCategory === 'crypto' && (
                            <div className="text-sm">
                                <span className="text-gray-400">Total Market Cap:</span>
                                <span className="text-blue-400 font-semibold ml-2">$2.1T</span>
                            </div>
                        )}
                        {selectedCategory === 'forex' && (
                            <div className="text-sm">
                                <span className="text-gray-400">Major Pairs:</span>
                                <span className="text-blue-400 font-semibold ml-2">Active</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Current Time (UTC):</span>
                        <div className="text-xs font-semibold text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                            2025-08-30 13:31:45
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;