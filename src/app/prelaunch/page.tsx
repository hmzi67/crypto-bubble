"use client";
import Link from "next/link";
import {
    TrendingUp,
    Calendar,
    Sparkles,
    Database,
    Eye,
    Zap
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export default function CryptoBubblesPreLaunch() {
    // State for countdown timer
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // TODO: Set your actual launch date for Crypto Bubbles here
    // useMemo ensures the date object doesn't change on every render
    const launchDate = useMemo(() => new Date('2025-12-25T00:00:00'), []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = launchDate.getTime() - new Date().getTime();

            if (difference <= 0) {
                // Launch date has passed or is now
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, [launchDate]); // Re-run if launchDate changes

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
            {/* Enhanced CSS Animations for background */}
            <style jsx>{`
                @keyframes gradientShift {
                    0% { background-position: 0 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                
            `}</style>
            {/* Sticky Floating Navigation - Adapted for Dark Theme */}
            <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/30 px-6 py-3 w-[90vw]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold text-white">CRYPTO BUBBLES</span>
                        </div>
                    </div>
                    {/* Desktop Navigation Links - Simplified */}
                    <div className="hidden lg:flex items-center space-x-6">

                        {/* Placeholder or Disabled Button for Pre-Launch */}
                        <button
                            disabled
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full transition-all duration-200 opacity-70 cursor-not-allowed text-sm font-medium"
                        >
                            Launching Soon
                        </button>
                    </div>

                </div>
            </nav>

            {/* Hero Section for Pre-Launch */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pt-40 pb-20 text-center">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Pre-Launch Badge */}
                        <div className="inline-flex items-center justify-center lg:justify-start">
                            <span className="inline-flex items-center justify-center gap-1 bg-gray-800/80 backdrop-blur-sm text-purple-400 font-semibold px-4 py-1.5 rounded-full text-sm mb-6 border border-purple-500/30 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                Almost Live!
                            </span>
                        </div>
                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CRYPTO BUBBLES</span> is
                            Launching Soon
                        </h1>
                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                            Witness the live financial market in a whole new way. Interactive, real-time visualization of crypto and forex data is almost here.
                        </p>

                        {/* Countdown Timer Section - Styled like a Card */}
                        <div className="max-w-2xl mx-auto bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-center text-2xl font-bold text-white mb-2">
                                    <Calendar className="mr-2 h-6 w-6" />
                                    <span>Launching In</span>
                                </div>
                                <p className="text-center text-gray-400 mb-6">
                                    Get ready to dive into the data ocean!
                                </p>
                                {/* Countdown Timer Display */}
                                <div className="flex justify-center space-x-4 sm:space-x-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-md border border-gray-600">
                                            {timeLeft.days}
                                        </div>
                                        <span className="mt-2 text-xs sm:text-sm text-gray-400 font-medium">Days</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center pt-2">
                                        <span className="text-xl sm:text-2xl font-bold text-white">:</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-md border border-gray-600">
                                            {timeLeft.hours}
                                        </div>
                                        <span className="mt-2 text-xs sm:text-sm text-gray-400 font-medium">Hours</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center pt-2">
                                        <span className="text-xl sm:text-2xl font-bold text-white">:</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-md border border-gray-600">
                                            {timeLeft.minutes}
                                        </div>
                                        <span className="mt-2 text-xs sm:text-sm text-gray-400 font-medium">Minutes</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center pt-2">
                                        <span className="text-xl sm:text-2xl font-bold text-white">:</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-md border border-gray-600">
                                            {timeLeft.seconds}
                                        </div>
                                        <span className="mt-2 text-xs sm:text-sm text-gray-400 font-medium">Seconds</span>
                                    </div>
                                </div>
                                {/* Launch Date */}
                                <p className="mt-6 text-sm text-gray-500 text-center">
                                    Target Launch: {launchDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {launchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Teaser Section */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Awaits You</h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                            A sneak peek into the powerful features of CRYPTO BUBBLES.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Feature Card 1 - Styled manually */}
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
                                <p className="text-gray-400">
                                    Live visualization of cryptocurrency and forex market data, updating in real-time.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-lg flex items-center justify-center mb-4">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Interactive Visualization</h3>
                                <p className="text-gray-400">
                                    Engage with the market through dynamic, interactive bubble charts representing assets.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Multi-Category View</h3>
                                <p className="text-gray-400">
                                    Switch seamlessly between Crypto, Forex, and Forex Pair categories for focused analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer - Adapted for Dark Theme */}
            <footer className="bg-gray-900 text-gray-400 mt-20 border-t border-gray-800">
                <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0">
                    {/* Left Section: Logo and Copyright */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="flex flex-col justify-center items-start space-x-2 max-w-md">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                <span className="text-xl font-bold text-white">CRYPTO BUBBLES</span>
                            </div>
                            <span className="mt-2 text-sm">
                                Live market visualization bringing crypto and forex data to life. Experience the future of financial data interaction.
                            </span>
                        </div>
                    </div>
                    {/* Right Section: Navigation Links */}
                    <div className="grid grid-cols-2 gap-8 text-center md:text-left">
                        <div>
                            <h4 className="font-semibold text-white mb-3">Project</h4>
                            <ul className="space-y-2">
                                <li><Link href="/" className="hover:text-white transition-colors duration-200">About</Link></li>
                                <li><Link href="/" className="hover:text-white transition-colors duration-200">Features</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors duration-200">Blog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-3">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors duration-200">Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p className="py-2 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} CRYPTO BUBBLES. All rights reserved.
                </p>
            </footer>
        </div>
    );
}