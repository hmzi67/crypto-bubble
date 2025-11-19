"use client"

import React, {useEffect, useState} from "react";
import { Search, TrendingUp, DollarSign, BarChart3, LineChart, User, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";


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
    timeframe?: string;
    marketCapGroup?: number;
    sizeBy?: 'marketCap' | 'volume24h';
    onTimeframeChange?: (value: string) => void;
    onMarketCapGroupChange?: (value: number) => void;
    onSizeByChange?: (value: 'marketCap' | 'volume24h') => void;
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
    showControls = true,
    placeholder,
    categories,
    timeframe,
    marketCapGroup,
    sizeBy,
    onTimeframeChange,
    onMarketCapGroupChange,
    onSizeByChange,
}) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString())
        }, 1000);

        return () => clearInterval(interval)
    }, [])

    const defaultCategories = [
        { id: "crypto", label: "Crypto", icon: <TrendingUp className="w-4 h-4" /> },
        { id: "forex", label: "Forex", icon: <DollarSign className="w-4 h-4" /> },
        { id: "forex-pair", label: "Forex Pairs", icon: <BarChart3 className="w-4 h-4" /> },
        { id: "stock", label: "Stocks", icon: <LineChart className="w-4 h-4" /> }
    ];

    const categoriesData = categories || defaultCategories;
    const searchPlaceholder = placeholder || `Search ${selectedCategory === 'crypto' ? 'cryptocurrency' : selectedCategory === 'forex' ? 'currencies' : selectedCategory === 'stock' ? 'stocks' : 'forex pairs'}`;

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

                    {/* Auth Buttons */}
                    {status === "loading" ? (
                        <div className="w-24 h-10 bg-gray-800/50 rounded-lg animate-pulse"></div>
                    ) : session ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-300 font-medium max-w-[120px] truncate">
                                    {session.user?.name || session.user?.email}
                                </span>
                            </button>
                            
                            {showUserMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-20" 
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700/50 rounded-lg shadow-2xl z-30 overflow-hidden">
                                        <div className="p-3 border-b border-gray-700/50">
                                            <p className="text-sm text-gray-400">Signed in as</p>
                                            <p className="text-sm font-medium text-white truncate">{session.user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut({ callbackUrl: '/auth/login' });
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-700/50">
                                    <LogIn className="w-4 h-4" />
                                    <span className="font-medium">Login</span>
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all shadow-lg">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-bar for info and controls */}
            {showControls && (
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
                                <div className="flex items-center gap-x-6 gap-y-4 text-sm text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="timeframe-select" className="font-semibold text-gray-400">Timeframe:</label>
                                        <select
                                            id="timeframe-select"
                                            value={timeframe}
                                            onChange={(e) => onTimeframeChange?.(e.target.value)}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="1h">1 Hour</option>
                                            <option value="24h">24 Hours</option>
                                            <option value="7d">7 Days</option>
                                            <option value="30d">30 Days</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label htmlFor="marketcap-select" className="font-semibold text-gray-400">Market Cap:</label>
                                        <select
                                            id="marketcap-select"
                                            value={marketCapGroup}
                                            onChange={(e) => onMarketCapGroupChange?.(Number(e.target.value))}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            {[1, 2, 3, 4, 5].map(page => (
                                                <option key={page} value={page}>
                                                    Top #{(page - 1) * 100 + 1} - #{page * 100}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label htmlFor="sizeby-select" className="font-semibold text-gray-400">Size by:</label>
                                        <select
                                            id="sizeby-select"
                                            value={sizeBy}
                                            onChange={(e) => onSizeByChange?.(e.target.value as 'marketCap' | 'volume24h')}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="marketCap">Market Cap</option>
                                            <option value="volume24h">Volume (24h)</option>
                                        </select>
                                    </div>
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
            )}
        </div>
    );
};

export default Header;