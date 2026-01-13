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
    scaleMode?: 'realistic' | 'balanced';
    onTimeframeChange?: (value: string) => void;
    onMarketCapGroupChange?: (value: number) => void;
    onSizeByChange?: (value: 'marketCap' | 'volume24h') => void;
    onScaleModeChange?: (value: 'realistic' | 'balanced') => void;
};

const Header: React.FC<HeaderProps> = ({
    title = "MARKET BUBBLES",
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
    scaleMode,
    onTimeframeChange,
    onMarketCapGroupChange,
    onSizeByChange,
    onScaleModeChange,
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
        { id: "crypto", label: "Crypto", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { id: "forex", label: "Forex", icon: <DollarSign className="w-3.5 h-3.5" /> },
        { id: "forex-pair", label: "Forex Pairs", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { id: "stock", label: "Stocks", icon: <LineChart className="w-3.5 h-3.5" /> }
    ];

    const categoriesData = categories || defaultCategories;
    const searchPlaceholder = placeholder || `Search ${selectedCategory === 'crypto' ? 'cryptocurrency' : selectedCategory === 'forex' ? 'currencies' : selectedCategory === 'stock' ? 'stocks' : 'forex pairs'}`;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onSearchChange?.(value);
    };

    // Compact select styling
    const selectClassName = "bg-gray-800/80 border border-gray-700/50 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer";
    const selectStyle = { 
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
        backgroundPosition: 'right 0.25rem center', 
        backgroundRepeat: 'no-repeat', 
        backgroundSize: '1em 1em',
        paddingRight: '1.5rem'
    };

    return (
        <header className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-lg sticky top-0 z-50">
            {/* Main Header Row - Height: 56px */}
            <div className="flex items-center justify-between px-3 h-14 gap-2">
                
                {/* Left: Logo + Categories */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Compact Logo */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 flex items-center justify-center shadow">
                                <span className="text-white font-black text-xs">CF</span>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap hidden lg:block">
                            {title}
                        </h1>
                    </div>

                    {/* Category Tabs */}
                    {showCategories && (
                        <div className="flex items-center gap-0.5 bg-gray-800/60 p-0.5 rounded-lg border border-gray-700/40">
                            {categoriesData.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onCategoryChange?.(category.id)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                                        selectedCategory === category.id
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                    }`}
                                >
                                    {category.icon}
                                    <span className="hidden sm:inline">{category.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Search + Auth */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Compact Search */}
                    {showSearch && (
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="bg-gray-800/70 text-white text-xs pl-7 pr-3 py-1.5 rounded-md border border-gray-700/50 focus:border-blue-500/50 focus:outline-none w-36 lg:w-48 transition-all"
                            />
                        </div>
                    )}

                    {/* Auth */}
                    {status === "loading" ? (
                        <div className="w-16 h-7 bg-gray-800/50 rounded animate-pulse"></div>
                    ) : session ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-all"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-300 text-xs font-medium max-w-[60px] truncate hidden sm:inline">
                                    {session.user?.name || session.user?.email?.split('@')[0]}
                                </span>
                            </button>
                            
                            {showUserMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-20" 
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700/50 rounded-lg shadow-xl z-30 overflow-hidden">
                                        <div className="p-2 border-b border-gray-700/50">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-xs font-medium text-white truncate">{session.user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut({ callbackUrl: '/auth/login' });
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-gray-700/50 transition-colors text-xs"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Link href="/auth/login">
                                <button className="flex items-center gap-1 px-2 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all text-xs font-medium">
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Login</span>
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs font-semibold transition-all shadow">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Crypto Filter Bar - Height: 40px - Only shown for crypto category */}
            {showControls && selectedCategory === 'crypto' && (
                <div className="flex items-center justify-center gap-4 px-3 h-10 bg-gray-800/40 border-t border-gray-700/30">
                    {/* Market Status */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1 text-green-400 font-medium">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Live
                        </span>
                    </div>
                    
                    <div className="w-px h-5 bg-gray-700/50" />

                    {/* Timeframe */}
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-500">Timeframe:</label>
                        <select
                            value={timeframe}
                            onChange={(e) => onTimeframeChange?.(e.target.value)}
                            className={selectClassName}
                            style={selectStyle}
                        >
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                        </select>
                    </div>

                    <div className="w-px h-5 bg-gray-700/50" />

                    {/* Market Cap Group */}
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-500">Market Cap:</label>
                        <select
                            value={marketCapGroup}
                            onChange={(e) => onMarketCapGroupChange?.(Number(e.target.value))}
                            className={selectClassName}
                            style={selectStyle}
                        >
                            {[1, 2, 3, 4, 5].map(page => (
                                <option key={page} value={page}>
                                    Top #{(page - 1) * 100 + 1} - #{page * 100}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-px h-5 bg-gray-700/50" />

                    {/* Size By */}
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-500">Size by:</label>
                        <select
                            value={sizeBy}
                            onChange={(e) => onSizeByChange?.(e.target.value as 'marketCap' | 'volume24h')}
                            className={selectClassName}
                            style={selectStyle}
                        >
                            <option value="marketCap">Market Cap</option>
                            <option value="volume24h">Volume (24h)</option>
                        </select>
                    </div>

                    <div className="w-px h-5 bg-gray-700/50" />

                    {/* Scale Mode */}
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-500">Scale:</label>
                        <select
                            value={scaleMode}
                            onChange={(e) => onScaleModeChange?.(e.target.value as 'realistic' | 'balanced')}
                            className={selectClassName}
                            style={selectStyle}
                            title="Balanced: Log scale. Realistic: Power scale."
                        >
                            <option value="balanced">Balanced</option>
                            <option value="realistic">Realistic</option>
                        </select>
                    </div>
                    
                    <div className="w-px h-5 bg-gray-700/50" />
                    
                    {/* Updated Time */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-500">Updated:</span>
                        <span className="text-white font-medium tabular-nums">{time}</span>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
