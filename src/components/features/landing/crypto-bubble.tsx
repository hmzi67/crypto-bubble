"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import Header from "@/components/layout/header";

type CryptoCoin = {
    id: string;
    symbol: string;
    name: string;
    change24h: number;
    marketCap: number;
    price: number;
    volume24h?: number;
    rank?: number;
    radius?: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
    category?: "crypto" | "forex" | "forex-pair" | "major" | "minor" | "exotic";
    color?: string;
    size?: number;
    currentRate?: number;
    countryCode?: string;
    bid?: number;
    ask?: number;
    spread?: number;
};

// Mock data generation functions
const generateMockCryptoData = (): CryptoCoin[] => {
    const cryptos = [
        { symbol: "BTC", name: "Bitcoin", price: 64250.45, change24h: 2.45, marketCap: 1265000000000, rank: 1 },
        { symbol: "ETH", name: "Ethereum", price: 3420.89, change24h: -1.23, marketCap: 411000000000, rank: 2 },
        { symbol: "BNB", name: "BNB", price: 580.67, change24h: 3.67, marketCap: 84500000000, rank: 3 },
        { symbol: "SOL", name: "Solana", price: 145.23, change24h: 5.23, marketCap: 67800000000, rank: 4 },
        { symbol: "XRP", name: "XRP", price: 0.5234, change24h: -2.18, marketCap: 29400000000, rank: 5 },
        { symbol: "USDC", name: "USD Coin", price: 1.0001, change24h: 0.01, marketCap: 28100000000, rank: 6 },
        { symbol: "STETH", name: "Staked Ether", price: 3415.67, change24h: -1.19, marketCap: 27600000000, rank: 7 },
        { symbol: "ADA", name: "Cardano", price: 0.4523, change24h: 1.85, marketCap: 15800000000, rank: 8 },
        { symbol: "AVAX", name: "Avalanche", price: 28.50, change24h: 4.12, marketCap: 11200000000, rank: 9 },
        { symbol: "DOGE", name: "Dogecoin", price: 0.1245, change24h: -0.95, marketCap: 17600000000, rank: 10 },
        { symbol: "TRX", name: "TRON", price: 0.1634, change24h: 2.73, marketCap: 14100000000, rank: 11 },
        { symbol: "LINK", name: "Chainlink", price: 11.85, change24h: 3.45, marketCap: 7200000000, rank: 12 },
        { symbol: "TON", name: "Toncoin", price: 5.42, change24h: -1.67, marketCap: 13800000000, rank: 13 },
        { symbol: "MATIC", name: "Polygon", price: 0.5834, change24h: 2.34, marketCap: 5400000000, rank: 14 },
        { symbol: "SHIB", name: "Shiba Inu", price: 0.000018, change24h: 1.23, marketCap: 10600000000, rank: 15 },
        { symbol: "ICP", name: "Internet Computer", price: 8.95, change24h: -2.45, marketCap: 4100000000, rank: 16 },
        { symbol: "UNI", name: "Uniswap", price: 7.20, change24h: 1.89, marketCap: 4300000000, rank: 17 },
        { symbol: "LTC", name: "Litecoin", price: 68.45, change24h: 0.75, marketCap: 5100000000, rank: 18 },
        { symbol: "BCH", name: "Bitcoin Cash", price: 385.67, change24h: 1.45, marketCap: 7600000000, rank: 19 },
        { symbol: "NEAR", name: "NEAR Protocol", price: 4.85, change24h: 3.21, marketCap: 5300000000, rank: 20 },
        { symbol: "DOT", name: "Polkadot", price: 6.78, change24h: -1.34, marketCap: 8900000000, rank: 21 },
        { symbol: "ATOM", name: "Cosmos", price: 9.12, change24h: 2.56, marketCap: 3600000000, rank: 22 },
        { symbol: "FIL", name: "Filecoin", price: 4.23, change24h: -0.89, marketCap: 2400000000, rank: 23 },
        { symbol: "VET", name: "VeChain", price: 0.0234, change24h: 1.67, marketCap: 1700000000, rank: 24 },
        { symbol: "ALGO", name: "Algorand", price: 0.1876, change24h: 2.89, marketCap: 1300000000, rank: 25 }
    ];

    return cryptos.map((crypto) => ({
        id: crypto.symbol.toLowerCase(),
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
        change24h: crypto.change24h,
        marketCap: crypto.marketCap,
        volume24h: crypto.marketCap * (0.1 + Math.random() * 0.3),
        rank: crypto.rank,
        category: "crypto" as const,
        color: crypto.change24h > 0 ? "#22c55e" : "#ef4444"
    }));
};

const generateMockForexData = (): CryptoCoin[] => {
    const forexCurrencies = [
        { symbol: "EUR", name: "Euro", rate: 0.9234, change: 0.25, importance: 100, country: "EU" },
        { symbol: "GBP", name: "British Pound", rate: 0.8134, change: -0.15, importance: 85, country: "GB" },
        { symbol: "JPY", name: "Japanese Yen", rate: 148.567, change: 0.45, importance: 90, country: "JP" },
        { symbol: "CHF", name: "Swiss Franc", rate: 0.8945, change: 0.12, importance: 75, country: "CH" },
        { symbol: "CAD", name: "Canadian Dollar", rate: 1.3456, change: -0.23, importance: 70, country: "CA" },
        { symbol: "AUD", name: "Australian Dollar", rate: 0.6789, change: 0.34, importance: 65, country: "AU" },
        { symbol: "NZD", name: "New Zealand Dollar", rate: 0.6234, change: -0.18, importance: 45, country: "NZ" },
        { symbol: "SEK", name: "Swedish Krona", rate: 10.234, change: 0.28, importance: 40, country: "SE" },
        { symbol: "NOK", name: "Norwegian Krone", rate: 10.567, change: -0.35, importance: 42, country: "NO" },
        { symbol: "DKK", name: "Danish Krone", rate: 6.789, change: 0.15, importance: 35, country: "DK" },
        { symbol: "PLN", name: "Polish Zloty", rate: 4.123, change: 0.45, importance: 30, country: "PL" },
        { symbol: "CZK", name: "Czech Koruna", rate: 23.456, change: -0.28, importance: 25, country: "CZ" },
        { symbol: "HUF", name: "Hungarian Forint", rate: 365.78, change: 0.67, importance: 22, country: "HU" },
        { symbol: "TRY", name: "Turkish Lira", rate: 28.456, change: -1.23, importance: 28, country: "TR" },
        { symbol: "ZAR", name: "South African Rand", rate: 18.234, change: 0.89, importance: 32, country: "ZA" },
        { symbol: "MXN", name: "Mexican Peso", rate: 17.456, change: -0.45, importance: 35, country: "MX" },
        { symbol: "BRL", name: "Brazilian Real", rate: 5.123, change: 0.78, importance: 38, country: "BR" },
        { symbol: "CNY", name: "Chinese Yuan", rate: 7.234, change: 0.12, importance: 85, country: "CN" },
        { symbol: "KRW", name: "South Korean Won", rate: 1234.56, change: 0.34, importance: 40, country: "KR" },
        { symbol: "SGD", name: "Singapore Dollar", rate: 1.345, change: -0.18, importance: 45, country: "SG" }
    ];

    return forexCurrencies.map((forex) => ({
        id: `${forex.symbol.toLowerCase()}-forex`,
        symbol: forex.symbol,
        name: forex.name,
        change24h: forex.change,
        marketCap: forex.rate * forex.importance * 10000000, // Size based on rate and importance
        price: forex.rate,
        volume24h: forex.importance * 50000000,
        currentRate: forex.rate,
        countryCode: forex.country,
        category: forex.importance >= 70 ? "major" : forex.importance >= 40 ? "minor" : "exotic",
        color: forex.importance >= 70 ? "#10b981" : forex.importance >= 40 ? "#3b82f6" : "#8b5cf6"
    }));
};

const generateMockForexPairsData = (): CryptoCoin[] => {
    const forexPairs = [
        { base: "EUR", quote: "USD", rate: 1.0856, change: 0.18, volume: 100 },
        { base: "GBP", quote: "USD", rate: 1.2678, change: -0.24, volume: 85 },
        { base: "USD", quote: "JPY", rate: 148.567, change: 0.45, volume: 90 },
        { base: "USD", quote: "CHF", rate: 0.8945, change: 0.12, volume: 70 },
        { base: "USD", quote: "CAD", rate: 1.3456, change: -0.23, volume: 75 },
        { base: "AUD", quote: "USD", rate: 0.6789, change: 0.34, volume: 65 },
        { base: "NZD", quote: "USD", rate: 0.6234, change: -0.18, volume: 50 },
        { base: "EUR", quote: "GBP", rate: 0.8567, change: 0.28, volume: 60 },
        { base: "EUR", quote: "JPY", rate: 161.234, change: 0.56, volume: 55 },
        { base: "GBP", quote: "JPY", rate: 188.456, change: -0.32, volume: 52 },
        { base: "EUR", quote: "CHF", rate: 0.9712, change: 0.15, volume: 48 },
        { base: "GBP", quote: "CHF", rate: 1.1345, change: -0.18, volume: 45 },
        { base: "AUD", quote: "JPY", rate: 100.789, change: 0.67, volume: 40 },
        { base: "CAD", quote: "JPY", rate: 110.456, change: 0.45, volume: 38 },
        { base: "CHF", quote: "JPY", rate: 166.123, change: -0.28, volume: 35 }
    ];

    return forexPairs.map((pair) => {
        const spread = pair.rate * 0.0001;
        return {
            id: `${pair.base}${pair.quote}-pair`,
            symbol: `${pair.base}${pair.quote}`,
            name: `${pair.base}/${pair.quote}`,
            change24h: pair.change,
            marketCap: pair.rate * pair.volume * 10000000, // Size based on rate and volume
            price: pair.rate,
            volume24h: pair.volume * 80000000,
            currentRate: pair.rate,
            bid: pair.rate - spread / 2,
            ask: pair.rate + spread / 2,
            spread: spread,
            category: "forex-pair" as const,
            color: "#f59e0b"
        };
    });
};

const CryptoBubblesUI: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const simulationRef = useRef<d3.Simulation<CryptoCoin, undefined> | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string>("crypto");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width: 1400,
        height: 800,
    });
    const [selectedBubble, setSelectedBubble] = useState<CryptoCoin | null>(null);
    const [marketData, setMarketData] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch market data based on selected category
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (!isMounted) return;

                let data: CryptoCoin[];
                switch (selectedCategory) {
                    case "crypto":
                        data = generateMockCryptoData();
                        break;
                    case "forex":
                        data = generateMockForexData();
                        break;
                    case "forex-pair":
                        data = generateMockForexPairsData();
                        break;
                    default:
                        data = generateMockCryptoData();
                }

                // Filter based on search term
                const filtered = data.filter(
                    (item) =>
                        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                setMarketData(filtered);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message || "Failed to load data");
                } else {
                    setError("Failed to load data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [searchTerm, selectedCategory]);

    // Handle viewport resizing
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: Math.min(window.innerWidth - 80, 1400),
                height: Math.min(window.innerHeight - 300, 800),
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // D3 Rendering with enhanced glassy effects
    useEffect(() => {
        if (!svgRef.current) return;
        if (loading || error || marketData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        const maxValue = d3.max(marketData, (d) => d.marketCap) ?? 1;
        const minValue = d3.min(marketData, (d) => d.marketCap) ?? 0;

        // Enhanced radius scale for better size distribution based on rate/value
        const radiusScale = d3.scalePow()
            .exponent(0.6) // Makes the size differences more pronounced
            .domain([minValue, maxValue])
            .range([30, Math.min(width, height) * 0.12]);

        const bubbleData: CryptoCoin[] = marketData.map((d) => ({
            ...d,
            radius: radiusScale(d.marketCap),
            x: width / 2 + (Math.random() - 0.5) * width * 0.7,
            y: height / 2 + (Math.random() - 0.5) * height * 0.7,
            fx: null,
            fy: null,
        }));

        const simulation = d3
            .forceSimulation<CryptoCoin>(bubbleData)
            .force("charge", d3.forceManyBody().strength(-40))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide<CryptoCoin>().radius((d) => d.radius! + 8).strength(0.9))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05))
            .alphaDecay(0.005)
            .velocityDecay(0.3);

        simulationRef.current = simulation;

        // Enhanced gradients and filters for ultra-glassy effect
        const defs = svg.append("defs");

        // Create multiple gradients for different categories with enhanced glass effect
        const createGlassGradient = (id: string, primaryColor: string, secondaryColor: string) => {
            const gradient = defs.append("radialGradient")
                .attr("id", id)
                .attr("cx", "25%")
                .attr("cy", "20%")
                .attr("r", "80%");

            gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255, 255, 255, 0.9)").attr("stop-opacity", 0.6);
            gradient.append("stop").attr("offset", "15%").attr("stop-color", "rgba(255, 255, 255, 0.7)").attr("stop-opacity", 0.4);
            gradient.append("stop").attr("offset", "40%").attr("stop-color", primaryColor).attr("stop-opacity", 0.7);
            gradient.append("stop").attr("offset", "70%").attr("stop-color", secondaryColor).attr("stop-opacity", 0.6);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", secondaryColor).attr("stop-opacity", 0.8);
        };

        // Create gradients for different states
        createGlassGradient("glass-positive", "rgba(34, 197, 94, 0.8)", "rgba(16, 185, 129, 0.9)");
        createGlassGradient("glass-negative", "rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.9)");
        createGlassGradient("glass-forex-major", "rgba(16, 185, 129, 0.8)", "rgba(5, 150, 105, 0.9)");
        createGlassGradient("glass-forex-minor", "rgba(59, 130, 246, 0.8)", "rgba(37, 99, 235, 0.9)");
        createGlassGradient("glass-forex-exotic", "rgba(147, 51, 234, 0.8)", "rgba(126, 34, 206, 0.9)");
        createGlassGradient("glass-forex-pair", "rgba(245, 158, 11, 0.8)", "rgba(217, 119, 6, 0.9)");

        // Enhanced glow filter
        const glowFilter = defs.append("filter")
            .attr("id", "enhanced-glow")
            .attr("x", "-100%")
            .attr("y", "-100%")
            .attr("width", "300%")
            .attr("height", "300%");

        glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
        glowFilter.append("feColorMatrix")
            .attr("type", "matrix")
            .attr("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0")
            .attr("result", "glowColor");

        const feMerge = glowFilter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "glowColor");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Glass reflection filter
        const reflectionFilter = defs.append("filter")
            .attr("id", "glass-reflection")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        reflectionFilter.append("feGaussianBlur").attr("stdDeviation", "1.5").attr("result", "blur");
        reflectionFilter.append("feSpecularLighting")
            .attr("result", "specOut")
            .attr("in", "blur")
            .attr("specularConstant", "1.5")
            .attr("specularExponent", "20")
            .attr("lighting-color", "#ffffff")
            .append("fePointLight")
            .attr("x", "-50")
            .attr("y", "-50")
            .attr("z", "200");

        // Create bubble groups with enhanced layering
        const bubbleGroups = svg
            .selectAll<SVGGElement, CryptoCoin>(".bubble-group")
            .data(bubbleData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .style("cursor", "grab");

        // Outer atmospheric glow
        bubbleGroups
            .append("circle")
            .attr("class", "atmospheric-glow")
            .attr("r", (d) => d.radius! + 15)
            .attr("fill", "none")
            .attr("stroke", (d) => {
                if (selectedCategory === "crypto") return d.change24h > 0 ? "#22c55e" : "#ef4444";
                if (d.category === "major") return "#10b981";
                if (d.category === "minor") return "#3b82f6";
                if (d.category === "forex-pair") return "#f59e0b";
                return "#8b5cf6";
            })
            .attr("stroke-width", 2)
            .style("opacity", 0.1)
            .style("filter", "blur(8px)")
            .style("animation", "pulse 3s ease-in-out infinite alternate");

        // Mid-layer glow
        bubbleGroups
            .append("circle")
            .attr("class", "mid-glow")
            .attr("r", (d) => d.radius! + 8)
            .attr("fill", "none")
            .attr("stroke", (d) => {
                if (selectedCategory === "crypto") return d.change24h > 0 ? "#22c55e" : "#ef4444";
                if (d.category === "major") return "#10b981";
                if (d.category === "minor") return "#3b82f6";
                if (d.category === "forex-pair") return "#f59e0b";
                return "#8b5cf6";
            })
            .attr("stroke-width", 3)
            .style("opacity", 0.3)
            .style("filter", "blur(6px)");

        // Main glass bubble with enhanced effects
        bubbleGroups
            .append("circle")
            .attr("class", "main-bubble")
            .attr("r", (d) => d.radius!)
            .attr("fill", (d) => {
                if (selectedCategory === "crypto") {
                    return d.change24h > 0 ? "url(#glass-positive)" : "url(#glass-negative)";
                }
                if (d.category === "major") return "url(#glass-forex-major)";
                if (d.category === "minor") return "url(#glass-forex-minor)";
                if (d.category === "forex-pair") return "url(#glass-forex-pair)";
                return "url(#glass-forex-exotic)";
            })
            .attr("stroke", (d) => {
                if (selectedCategory === "crypto") return d.change24h > 0 ? "#22c55e" : "#ef4444";
                if (d.category === "major") return "#10b981";
                if (d.category === "minor") return "#3b82f6";
                if (d.category === "forex-pair") return "#f59e0b";
                return "#8b5cf6";
            })
            .attr("stroke-width", 2.5)
            .style("opacity", 0.85)
            .style("filter", "url(#enhanced-glow)")
            .style("backdrop-filter", "blur(10px)");

        // Primary glass highlight (large)
        bubbleGroups
            .append("ellipse")
            .attr("class", "primary-highlight")
            .attr("cx", (d) => -d.radius! * 0.25)
            .attr("cy", (d) => -d.radius! * 0.35)
            .attr("rx", (d) => d.radius! * 0.45)
            .attr("ry", (d) => d.radius! * 0.25)
            .attr("fill", "rgba(255, 255, 255, 0.7)")
            .style("opacity", 0.9)
            .style("filter", "blur(2px)");

        // Secondary highlight (medium)
        bubbleGroups
            .append("circle")
            .attr("class", "secondary-highlight")
            .attr("cx", (d) => d.radius! * 0.3)
            .attr("cy", (d) => -d.radius! * 0.2)
            .attr("r", (d) => d.radius! * 0.18)
            .attr("fill", "rgba(255, 255, 255, 0.5)")
            .style("opacity", 0.8)
            .style("filter", "blur(1.5px)");

        // Tertiary highlight (small sparkle)
        bubbleGroups
            .append("circle")
            .attr("class", "sparkle-highlight")
            .attr("cx", (d) => -d.radius! * 0.4)
            .attr("cy", (d) => d.radius! * 0.3)
            .attr("r", (d) => d.radius! * 0.08)
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .style("opacity", 0.7)
            .style("filter", "blur(0.5px)");

        // Inner rim reflection
        bubbleGroups
            .append("circle")
            .attr("class", "inner-rim")
            .attr("r", (d) => d.radius! - 4)
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.3)")
            .attr("stroke-width", 1.5)
            .style("opacity", 0.6);

        // Symbol text with enhanced readability
        bubbleGroups
            .append("text")
            .attr("class", "symbol-text")
            .attr("text-anchor", "middle")
            .attr("dy", selectedCategory === 'forex-pair' ? "-0.5em" : "-0.2em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "900")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.32, 22)}px`)
            .style("fill", "#ffffff")
            .style("text-shadow", `
                0 0 10px rgba(0,0,0,0.9),
                0 0 20px rgba(0,0,0,0.8),
                0 2px 4px rgba(0,0,0,0.7),
                0 0 3px rgba(255,255,255,0.3)
            `)
            .style("pointer-events", "none")
            .style("letter-spacing", "0.05em")
            .text((d) => {
                if (selectedCategory === 'forex-pair' && d.symbol.length >= 6) {
                    const base = d.symbol.substring(0, 3);
                    const quote = d.symbol.substring(3, 6);
                    return `${base}/${quote}`;
                }
                return d.symbol;
            });

        // Current rate text for forex with enhanced styling
        if (selectedCategory === 'forex' || selectedCategory === 'forex-pair') {
            bubbleGroups
                .append("text")
                .attr("class", "rate-text")
                .attr("text-anchor", "middle")
                .attr("dy", selectedCategory === 'forex-pair' ? "0.3em" : "0.5em")
                .style("font-family", "JetBrains Mono, Monaco, Consolas, monospace")
                .style("font-weight", "700")
                .style("font-size", (d) => `${Math.min(d.radius! * 0.16, 12)}px`)
                .style("fill", "#f8fafc")
                .style("text-shadow", `
                    0 0 8px rgba(0,0,0,0.9),
                    0 1px 2px rgba(0,0,0,0.8),
                    0 0 2px rgba(255,255,255,0.2)
                `)
                .style("pointer-events", "none")
                .text((d) => {
                    if (d.currentRate) {
                        if (d.currentRate < 1) return d.currentRate.toFixed(4);
                        if (d.currentRate < 10) return d.currentRate.toFixed(3);
                        if (d.currentRate < 100) return d.currentRate.toFixed(2);
                        return d.currentRate.toFixed(1);
                    }
                    return "";
                });
        }

        // Enhanced change percentage text
        bubbleGroups
            .append("text")
            .attr("class", "change-text")
            .attr("text-anchor", "middle")
            .attr("dy", (selectedCategory === 'forex' || selectedCategory === 'forex-pair') ? "1.2em" : "0.8em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "800")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.20, 13)}px`)
            .style("fill", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .style("text-shadow", `
                0 0 8px rgba(0,0,0,0.9),
                0 1px 3px rgba(0,0,0,0.7),
                0 0 15px ${(d: CryptoCoin) => d.change24h > 0 ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
            `)
            .style("pointer-events", "none")
            .text((d) => `${d.change24h > 0 ? "+" : ""}${d.change24h.toFixed(2)}%`);

        // Enhanced drag behavior with visual feedback
        const drag = d3
            .drag<SVGGElement, CryptoCoin>()
            .on("start", (event, d) => {
                if (!event.active && simulationRef.current) {
                    simulationRef.current.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
                const group = d3.select(event.sourceEvent.target.parentNode);
                group.style("cursor", "grabbing");

                // Enhanced drag feedback
                group.select(".main-bubble")
                    .transition()
                    .duration(150)
                    .attr("r", d.radius! * 1.1)
                    .style("opacity", 1)
                    .attr("stroke-width", 4);

                group.select(".atmospheric-glow")
                    .transition()
                    .duration(150)
                    .attr("r", d.radius! + 25)
                    .style("opacity", 0.3);
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active && simulationRef.current) {
                    simulationRef.current.alphaTarget(0);
                }
                d.fx = null;
                d.fy = null;
                const group = d3.select(event.sourceEvent.target.parentNode);
                group.style("cursor", "grab");

                // Reset drag feedback
                group.select(".main-bubble")
                    .transition()
                    .duration(300)
                    .attr("r", d.radius!)
                    .style("opacity", 0.85)
                    .attr("stroke-width", 2.5);

                group.select(".atmospheric-glow")
                    .transition()
                    .duration(300)
                    .attr("r", d.radius! + 15)
                    .style("opacity", 0.1);
            });

        bubbleGroups.call(drag);

        // Enhanced mouse interactions
        bubbleGroups
            .on("mouseenter", function (event, d) {
                const group = d3.select(this);

                // Enhanced hover effects
                group.select(".main-bubble")
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 4)
                    .style("opacity", 1)
                    .style("filter", "url(#enhanced-glow) brightness(1.2)");

                group.select(".mid-glow")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5)
                    .attr("r", d.radius! + 12)
                    .attr("stroke-width", 4);

                group.select(".atmospheric-glow")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.2)
                    .attr("r", d.radius! + 20);

                group.select(".primary-highlight")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr("rx", d.radius! * 0.5)
                    .attr("ry", d.radius! * 0.3);

                // Text glow on hover
                group.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("filter", "drop-shadow(0 0 8px currentColor)");
            })
            .on("mouseleave", function (event, d) {
                const group = d3.select(this);

                // Reset hover effects
                group.select(".main-bubble")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", 2.5)
                    .style("opacity", 0.85)
                    .style("filter", "url(#enhanced-glow)");

                group.select(".mid-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.3)
                    .attr("r", d.radius! + 8)
                    .attr("stroke-width", 3);

                group.select(".atmospheric-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.1)
                    .attr("r", d.radius! + 15);

                group.select(".primary-highlight")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.9)
                    .attr("rx", d.radius! * 0.45)
                    .attr("ry", d.radius! * 0.25);

                group.selectAll("text")
                    .transition()
                    .duration(300)
                    .style("filter", "none");
            })
            .on("click", function (event, d) {
                setSelectedBubble(d);

                // Enhanced click ripple effect
                const group = d3.select(this);
                const clickRipple = group
                    .append("circle")
                    .attr("r", 0)
                    .attr("fill", "none")
                    .attr("stroke", d.color || "#22c55e")
                    .attr("stroke-width", 4)
                    .style("opacity", 1);

                clickRipple
                    .transition()
                    .duration(800)
                    .ease(d3.easeCircleOut)
                    .attr("r", d.radius! + 40)
                    .style("opacity", 0)
                    .style("stroke-width", 1)
                    .remove();

                // Flash effect
                group.select(".main-bubble")
                    .transition()
                    .duration(150)
                    .style("opacity", 1)
                    .transition()
                    .duration(150)
                    .style("opacity", 0.85);
            });

        // Update positions on tick
        simulation.on("tick", () => {
            bubbleGroups.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [marketData, dimensions, loading, error, selectedCategory]);

    const restartSimulation = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.alpha(1).restart();
        }
    }, []);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedBubble(null);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Get current UTC time in the requested format
    const getCurrentTimeUTC = () => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Add CSS for bubble animations */}
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.1; transform: scale(1); }
                    100% { opacity: 0.2; transform: scale(1.05); }
                }
                
                .bubble-group {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bubble-group:hover {
                    transform-origin: center;
                }
            `}</style>

            {/* Dynamic Header */}
            <Header
                title="CRYPTO BUBBLES"
                subtitle="Live Market Visualization"
                onCategoryChange={handleCategoryChange}
                onSearchChange={handleSearchChange}
                onRestartAnimation={restartSimulation}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                showCategories={true}
                showSearch={true}
                showControls={true}
            />

            {/* Main Content */}
            <div className="p-6">
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500 mx-auto mb-6"></div>
                                <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border border-blue-400 opacity-20 mx-auto"></div>
                            </div>
                            <p className="text-white font-medium text-lg">
                                Loading {selectedCategory === 'crypto' ? 'cryptocurrency' : selectedCategory === 'forex' ? 'forex currency' : 'forex pair'} bubbles...
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Current Time (UTC): {getCurrentTimeUTC()}
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md backdrop-blur-sm">
                            <p className="text-red-400 font-medium text-lg mb-2">Error Loading Data</p>
                            <p className="text-gray-400 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && marketData.length === 0 && searchTerm && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 max-w-md backdrop-blur-sm">
                            <p className="text-yellow-400 font-medium text-lg mb-2">No Results Found</p>
                            <p className="text-gray-400 mb-4">
                                No {selectedCategory === 'crypto' ? 'cryptocurrencies' : selectedCategory === 'forex' ? 'currencies' : 'forex pairs'} match your search term {searchTerm}
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && marketData.length > 0 && (
                    <div className="relative">
                        <svg
                            ref={svgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="w-full rounded-2xl bg-gradient-to-br from-gray-900/70 to-gray-800/70 border border-gray-700/30 shadow-2xl backdrop-blur-sm"
                            style={{
                                background: `
                                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%),
                                    linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)
                                `
                            }}
                        />

                        {/* Enhanced Instructions */}
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-gray-300 text-sm px-6 py-4 rounded-2xl border border-gray-700/50 max-w-xs shadow-2xl">
                            <p className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                ✨ Interactive Glass Bubbles
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Drag to move around
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                Click to view details
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Hover for glass effects
                            </p>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-gray-300 text-sm px-6 py-4 rounded-2xl border border-gray-700/50 shadow-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${selectedCategory === 'crypto' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                                    selectedCategory === 'forex' ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                    }`}></div>
                                <span className="font-bold text-white">
                                    {selectedCategory === 'crypto' ? 'Cryptocurrencies' :
                                        selectedCategory === 'forex' ? 'Forex Currencies' : 'Forex Pairs'}
                                </span>
                            </div>
                            <p className="text-gray-400 mb-1">Showing <span className="text-white font-semibold">{marketData.length}</span> bubbles</p>
                            <p className="text-xs text-gray-500">Size based on {selectedCategory === 'crypto' ? 'market cap' : 'rate & volume'}</p>
                            <p className="text-xs text-blue-400 mt-2 font-mono">User: tayyabayasmine</p>
                        </div>

                        {/* Enhanced Time Display */}
                        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-gray-300 text-sm px-6 py-4 rounded-2xl border border-gray-700/50 shadow-2xl">
                            <p className="font-bold text-white mb-1 flex items-center gap-2">
                                🌍 Current Time (UTC)
                            </p>
                            <p className="font-mono text-lg text-blue-400 mb-2">{getCurrentTimeUTC()}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-400 font-medium">Live Data</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {selectedCategory === 'crypto' ? 'Market' : selectedCategory === 'forex' ? 'FX' : 'Pairs'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Selected Bubble Details */}
            {selectedBubble && (
                <div className="fixed bottom-6 right-6 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl max-w-sm z-50 transform transition-all duration-300 animate-in slide-in-from-right">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full animate-pulse shadow-lg ${selectedBubble.change24h > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                                }`}></div>
                            <div>
                                <h3 className="text-white text-xl font-bold">{selectedBubble.name}</h3>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <span className="font-mono">{selectedBubble.symbol}</span>
                                    {selectedBubble.category && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedBubble.category === 'crypto' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                            selectedBubble.category === 'major' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                selectedBubble.category === 'minor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    selectedBubble.category === 'forex-pair' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            }`}>
                                            {selectedBubble.category.toUpperCase()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedBubble(null)}
                            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        {selectedCategory === 'crypto' ? (
                            // Enhanced Crypto details
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <span className="text-gray-400 font-medium">Price:</span>
                                    <span className="text-white font-bold text-lg font-mono">
                                        ${selectedBubble.price >= 1
                                            ? selectedBubble.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                            : selectedBubble.price.toFixed(6)
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <span className="text-gray-400 font-medium">Market Cap:</span>
                                    <span className="text-white font-bold text-lg">
                                        ${(selectedBubble.marketCap / 1e9).toFixed(1)}B
                                    </span>
                                </div>
                                {selectedBubble.rank && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                        <span className="text-gray-400 font-medium">Rank:</span>
                                        <span className="text-white font-bold text-lg">#{selectedBubble.rank}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Enhanced Forex details
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <span className="text-gray-400 font-medium">Current Rate:</span>
                                    <span className="text-white font-bold text-lg font-mono">
                                        {selectedBubble.currentRate?.toFixed(4) || "N/A"}
                                    </span>
                                </div>
                                {selectedBubble.bid && selectedBubble.ask && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                                <span className="text-green-400 text-xs font-medium block">BID</span>
                                                <span className="text-green-400 font-bold text-sm font-mono">{selectedBubble.bid.toFixed(4)}</span>
                                            </div>
                                            <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                                <span className="text-red-400 text-xs font-medium block">ASK</span>
                                                <span className="text-red-400 font-bold text-sm font-mono">{selectedBubble.ask.toFixed(4)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                            <span className="text-gray-400 font-medium">Spread:</span>
                                            <span className="text-white font-bold">
                                                {selectedBubble.spread !== undefined
                                                    ? `${(selectedBubble.spread * 10000).toFixed(1)} pips`
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <span className="text-gray-400 font-medium">Volume 24h:</span>
                                    <span className="text-white font-bold text-lg">
                                        {selectedBubble.volume24h !== undefined
                                            ? `$${(selectedBubble.volume24h / 1e9).toFixed(1)}B`
                                            : "N/A"}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                            <span className="text-gray-400 font-medium">24h Change:</span>
                            <span className={`font-bold text-lg flex items-center gap-2 ${selectedBubble.change24h >= 0 ? "text-green-400" : "text-red-400"
                                }`}>
                                <span className="text-xl">{selectedBubble.change24h >= 0 ? "📈" : "📉"}</span>
                                {selectedBubble.change24h >= 0 ? "+" : ""}
                                {selectedBubble.change24h.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-700/50 text-xs text-gray-500 bg-gray-800/30 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span>Last Updated:</span>
                            <span className="font-mono text-blue-400">{getCurrentTimeUTC()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CryptoBubblesUI;