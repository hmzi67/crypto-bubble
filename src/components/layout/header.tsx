"use client"

import React, {useEffect, useState} from "react";
import { Search, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

type HeaderProps = {
    title?: string;
    subtitle?: string;
    onSearchChange?: (term: string) => void;
    onCategoryChange?: (category: string) => void;
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
};

const Header: React.FC<HeaderProps> = ({
    title = "MARKET BUBBLES",
    subtitle = "Live Market Visualization",
    onSearchChange,
    onCategoryChange,
    searchTerm = "",
    selectedCategory = "crypto",
    showCategories = true,
    showSearch = true,
    placeholder,
    categories
}) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString())
        }, 1000);

        return () => clearInterval(interval)
    }, [])

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
                            <h1 className=" text-2xl font-black tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors z-10" />
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
                        <span className="text-gray-400">Updated Time:</span>
                        <span className="text-white font-semibold ml-2">
                                {time}
                            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;