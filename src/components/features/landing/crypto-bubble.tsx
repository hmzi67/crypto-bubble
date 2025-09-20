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
    vx?: number;
    vy?: number;
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
type CoinGeckoCoin = {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number | null;
    market_cap: number;
    total_volume: number;
    market_cap_rank: number;
};
type ExchangeRateResponse = {
    base: string;
    rates: { [key: string]: number };
};
// --- Real Data Fetching Functions ---
const fetchRealCryptoData = async (): Promise<CryptoCoin[]> => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en'
        );
        if (!response.ok) {
            console.error(`Crypto API error: ${response.status} ${response.statusText}`);
            return [];
        }
        const data: CoinGeckoCoin[] = await response.json();
        if (!data || !Array.isArray(data)) {
            console.error('Invalid crypto data format received');
            return [];
        }
        return data.map((coin) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h ?? 0,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume,
            rank: coin.market_cap_rank,
            category: "crypto",
            color: (coin.price_change_percentage_24h ?? 0) > 0 ? "#22c55e" : "#ef4444"
        }));
    } catch (err) {
        console.error("Error fetching real crypto ", err);
        return [];
    }
};
const fetchRealForexData = async (): Promise<CryptoCoin[]> => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
            console.error(`Forex API error: ${response.status} ${response.statusText}`);
            return [];
        }
        const data: ExchangeRateResponse = await response.json();
        if (!data || !data.rates) {
            console.error('Invalid forex data format received');
            return [];
        }
        const rates = data.rates;
        const currenciesToShow = [
            { symbol: "EUR", name: "Euro", country: "EU", importance: 100 },
            { symbol: "GBP", name: "British Pound", country: "GB", importance: 85 },
            { symbol: "JPY", name: "Japanese Yen", country: "JP", importance: 90 },
            { symbol: "CHF", name: "Swiss Franc", country: "CH", importance: 75 },
            { symbol: "CAD", name: "Canadian Dollar", country: "CA", importance: 70 },
            { symbol: "AUD", name: "Australian Dollar", country: "AU", importance: 65 },
            { symbol: "NZD", name: "New Zealand Dollar", country: "NZ", importance: 45 },
            { symbol: "SEK", name: "Swedish Krona", country: "SE", importance: 40 },
            { symbol: "NOK", name: "Norwegian Krone", country: "NO", importance: 42 },
            { symbol: "DKK", name: "Danish Krone", country: "DK", importance: 35 },
            { symbol: "PLN", name: "Polish Zloty", country: "PL", importance: 30 },
            { symbol: "CZK", name: "Czech Koruna", country: "CZ", importance: 25 },
            { symbol: "HUF", name: "Hungarian Forint", country: "HU", importance: 22 },
            { symbol: "TRY", name: "Turkish Lira", country: "TR", importance: 28 },
            { symbol: "ZAR", name: "South African Rand", country: "ZA", importance: 32 },
            { symbol: "MXN", name: "Mexican Peso", country: "MX", importance: 35 },
            { symbol: "BRL", name: "Brazilian Real", country: "BR", importance: 38 },
            { symbol: "CNY", name: "Chinese Yuan", country: "CN", importance: 85 },
            { symbol: "KRW", name: "South Korean Won", country: "KR", importance: 40 },
            { symbol: "SGD", name: "Singapore Dollar", country: "SG", importance: 45 },
        ];
        return currenciesToShow.map((currency): CryptoCoin | null => {
            const rate = rates[currency.symbol];
            if (rate === undefined) {
                console.warn(`Rate for ${currency.symbol} not found in API response.`);
                return null;
            }
            const change = (Math.random() * 2 - 1);
            return {
                id: `${currency.symbol.toLowerCase()}-forex`,
                symbol: currency.symbol,
                name: currency.name,
                change24h: parseFloat(change.toFixed(2)),
                marketCap: rate * currency.importance * 10000000,
                price: rate,
                volume24h: currency.importance * 50000000,
                currentRate: rate,
                countryCode: currency.country,
                category: currency.importance >= 70 ? "major" : currency.importance >= 40 ? "minor" : "exotic",
                color: currency.importance >= 70 ? "#10b981" : currency.importance >= 40 ? "#3b82f6" : "#8b5cf6"
            };
        }).filter((item): item is CryptoCoin => item !== null);
    } catch (err) {
        console.error("Error fetching real forex ", err);
        return [];
    }
};
const fetchRealForexPairsData = async (): Promise<CryptoCoin[]> => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
            console.error(`Forex Pairs API error: ${response.status} ${response.statusText}`);
            return [];
        }
        const data: ExchangeRateResponse = await response.json();
        if (!data || !data.rates) {
            console.error('Invalid forex pairs data format received');
            return [];
        }
        const rates = data.rates;
        const pairsToShow = [
            { base: "EUR", quote: "USD" },
            { base: "GBP", quote: "USD" },
            { base: "USD", quote: "JPY" },
            { base: "USD", quote: "CHF" },
            { base: "USD", quote: "CAD" },
            { base: "AUD", quote: "USD" },
            { base: "NZD", quote: "USD" },
            { base: "EUR", quote: "GBP" },
            { base: "EUR", quote: "JPY" },
            { base: "GBP", quote: "JPY" },
            { base: "EUR", quote: "CHF" },
            { base: "GBP", quote: "CHF" },
            { base: "AUD", quote: "JPY" },
            { base: "CAD", quote: "JPY" },
            { base: "CHF", quote: "JPY" },
        ];
        const pairData: CryptoCoin[] = [];
        for (const pair of pairsToShow) {
            const baseRate = rates[pair.base];
            const quoteRate = rates[pair.quote];
            if (baseRate !== undefined && quoteRate !== undefined) {
                let pairRate: number;
                if (pair.base === "USD") {
                    pairRate = quoteRate;
                } else if (pair.quote === "USD") {
                    pairRate = baseRate;
                } else {
                    pairRate = baseRate / quoteRate;
                }
                const change = (Math.random() * 2 - 1);
                const volume = Math.floor(Math.random() * 100) + 1;
                const spread = pairRate * 0.0001;
                pairData.push({
                    id: `${pair.base}${pair.quote}-pair`.toLowerCase(),
                    symbol: `${pair.base}${pair.quote}`,
                    name: `${pair.base}/${pair.quote}`,
                    change24h: parseFloat(change.toFixed(2)),
                    marketCap: pairRate * volume * 10000000,
                    price: pairRate,
                    volume24h: volume * 80000000,
                    currentRate: pairRate,
                    bid: pairRate - spread / 2,
                    ask: pairRate + spread / 2,
                    spread: spread,
                    category: "forex-pair",
                    color: "#f59e0b"
                });
            } else {
                console.warn(`Rate for pair ${pair.base}/${pair.quote} not found.`);
            }
        }
        return pairData;
    } catch (err) {
        console.error("Error fetching real forex pairs data:", err);
        return [];
    }
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
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let data: CryptoCoin[];
                switch (selectedCategory) {
                    case "crypto":
                        data = await fetchRealCryptoData();
                        break;
                    case "forex":
                        data = await fetchRealForexData();
                        break;
                    case "forex-pair":
                        data = await fetchRealForexPairsData();
                        break;
                    default:
                        data = await fetchRealCryptoData();
                }
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
        void fetchData();
    }, [searchTerm, selectedCategory]);
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: Math.min(window.innerWidth - 80, 1400),
                height: Math.min(window.innerHeight - 250, 800),
            });
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    // D3 Rendering with enhanced glassy effects and smoother physics
    useEffect(() => {
        if (!svgRef.current) return;
        if (loading || error || marketData.length === 0) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const { width, height } = dimensions;
        const maxValue = d3.max(marketData, (d) => d.marketCap) ?? 1;
        const minValue = d3.min(marketData, (d) => d.marketCap) ?? 0;
        const radiusScale = d3.scalePow()
            .exponent(0.6)
            .domain([minValue, maxValue])
            .range([30, Math.min(width, height) * 0.12]);
        // --- MODIFIED: Ensure initial positions are safely within bounds ---
        const bubbleData: CryptoCoin[] = marketData.map((d) => {
            const radius = radiusScale(d.marketCap);
            // Add a safety margin, e.g., 1.5 times the radius or a fixed amount, whichever is larger
            const margin = Math.max(radius * 1.5, 20);

            return {
                ...d,
                radius: radius,
                // Ensure x is between margin and (width - margin)
                x: Math.max(margin, Math.min(width - margin, Math.random() * width)),
                // Ensure y is between margin and (height - margin)
                y: Math.max(margin, Math.min(height - margin, Math.random() * height)),
                vx: 0,
                vy: 0,
                fx: null,
                fy: null,
            };
        });
        // --- MODIFIED Simulation Setup ---
        const simulation = d3
            .forceSimulation<CryptoCoin>(bubbleData)
            // Standard charge force for repulsion
            .force("charge", d3.forceManyBody().strength(10))
            // Standard collision detection
            .force("collision", d3.forceCollide<CryptoCoin>()
                .radius((d) => (d.radius ?? 0) + 10) // Keep padding
                .strength(0.9) // Keep strength
                .iterations(3) // Keep iterations
            )
            // Centering force - Adjust strength if needed, 0.02 is usually fine
            .force("center", d3.forceCenter(width / 1.5, height / 2).strength(0.02))
            // Custom force for subtle continuous movement
            .force("autoMove", autoMoveForce(0.1)) // Keep reduced strength
            // Custom force for boundary repulsion - Adjust padding and strength if needed
            .force("boundary", boundaryForce(width, height, 20, 0.05)); // Keep these values for now

        // Fine-tune simulation parameters for smoothness
        simulation
            .alphaDecay(0.02) // Slower decay for longer animation
            .velocityDecay(0.2) // Lower velocity decay for smoother motion
            .alphaMin(0.001);

        simulationRef.current = simulation;
        // --- Gradients and Filters (Enhanced) ---
        const defs = svg.append("defs");
        // --- Enhanced Glass Gradients ---
        const createGlassGradient = (id: string, primaryColor: string, secondaryColor: string) => {
            const gradient = defs.append("radialGradient")
                .attr("id", id)
                .attr("cx", "25%")
                .attr("cy", "20%")
                .attr("r", "80%");
            // More complex gradient stops for richer refraction
            gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255, 255, 255, 0.95)").attr("stop-opacity", 0.7);
            gradient.append("stop").attr("offset", "10%").attr("stop-color", "rgba(255, 255, 255, 0.85)").attr("stop-opacity", 0.5);
            gradient.append("stop").attr("offset", "25%").attr("stop-color", "rgba(255, 255, 255, 0.75)").attr("stop-opacity", 0.3);
            gradient.append("stop").attr("offset", "45%").attr("stop-color", primaryColor).attr("stop-opacity", 0.6);
            gradient.append("stop").attr("offset", "65%").attr("stop-color", secondaryColor).attr("stop-opacity", 0.5);
            gradient.append("stop").attr("offset", "85%").attr("stop-color", secondaryColor).attr("stop-opacity", 0.7);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0, 0, 0, 0.1)").attr("stop-opacity", 0.9);
        };
        createGlassGradient("glass-positive", "rgba(34, 197, 94, 0.85)", "rgba(16, 185, 129, 0.95)");
        createGlassGradient("glass-negative", "rgba(239, 68, 68, 0.85)", "rgba(220, 38, 38, 0.95)");
        createGlassGradient("glass-forex-major", "rgba(16, 185, 129, 0.85)", "rgba(5, 150, 105, 0.95)");
        createGlassGradient("glass-forex-minor", "rgba(59, 130, 246, 0.85)", "rgba(37, 99, 235, 0.95)");
        createGlassGradient("glass-forex-exotic", "rgba(147, 51, 234, 0.85)", "rgba(126, 34, 206, 0.95)");
        createGlassGradient("glass-forex-pair", "rgba(245, 158, 11, 0.85)", "rgba(217, 119, 6, 0.95)");
        // --- Enhanced Glow Filter ---
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
        // --- Reflection Filter (Remains the same) ---
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
        // --- New Drop Shadow Filter ---
        const dropShadowFilter = defs.append("filter")
            .attr("id", "bubble-drop-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        dropShadowFilter.append("feDropShadow")
            .attr("dx", "0")
            .attr("dy", "2")
            .attr("stdDeviation", "4")
            .attr("flood-color", "rgba(0, 0, 0, 0.4)");
        // --- Bubble Elements (Enhanced) ---
        const bubbleGroups = svg
            .selectAll<SVGGElement, CryptoCoin>(".bubble-group")
            .data(bubbleData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .style("cursor", "grab")
            .style("filter", "url(#bubble-drop-shadow)"); // Apply drop shadow to group
        // --- Atmospheric Glow ---
        bubbleGroups
            .append("circle")
            .attr("class", "atmospheric-glow")
            .attr("r", (d) => (d.radius ?? 0) + 15)
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
            .style("animation", "pulse 3s ease-in-out infinite alternate");
        // --- Mid Glow ---
        bubbleGroups
            .append("circle")
            .attr("class", "mid-glow")
            .attr("r", (d) => (d.radius ?? 0) + 8)
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
        // --- Inner Glow (New) ---
        bubbleGroups
            .append("circle")
            .attr("class", "inner-glow")
            .attr("r", (d) => (d.radius ?? 0) - 2)
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.1)")
            .attr("stroke-width", 2)
            .style("opacity", 0.2)
            .style("filter", "blur(1px)");
        // --- Main Bubble ---
        bubbleGroups
            .append("circle")
            .attr("class", "main-bubble")
            .attr("r", (d) => d.radius ?? 0)
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
        // --- Highlights with Dynamic Positions ---
        bubbleGroups
            .append("ellipse")
            .attr("class", "primary-highlight")
            .attr("cx", (d) => {
                const baseOffset = -(d.radius ?? 0) * 0.25;
                const jitter = (Math.random() - 0.5) * (d.radius ?? 0) * 0.1; // Add slight randomness
                return baseOffset + jitter;
            })
            .attr("cy", (d) => {
                const baseOffset = -(d.radius ?? 0) * 0.35;
                const jitter = (Math.random() - 0.5) * (d.radius ?? 0) * 0.1;
                return baseOffset + jitter;
            })
            .attr("rx", (d) => (d.radius ?? 0) * 0.45)
            .attr("ry", (d) => (d.radius ?? 0) * 0.25)
            .attr("fill", "rgba(255, 255, 255, 0.7)")
            .style("opacity", 0.9)
            .style("filter", "blur(2px)");
        bubbleGroups
            .append("circle")
            .attr("class", "secondary-highlight")
            .attr("cx", (d) => {
                const baseOffset = (d.radius ?? 0) * 0.3;
                const jitter = (Math.random() - 0.5) * (d.radius ?? 0) * 0.1;
                return baseOffset + jitter;
            })
            .attr("cy", (d) => {
                const baseOffset = -(d.radius ?? 0) * 0.2;
                const jitter = (Math.random() - 0.5) * (d.radius ?? 0) * 0.1;
                return baseOffset + jitter;
            })
            .attr("r", (d) => (d.radius ?? 0) * 0.18)
            .attr("fill", "rgba(255, 255, 255, 0.5)")
            .style("opacity", 0.8)
            .style("filter", "blur(1.5px)");
        bubbleGroups
            .append("circle")
            .attr("class", "sparkle-highlight")
            .attr("cx", (d) => -(d.radius ?? 0) * 0.4)
            .attr("cy", (d) => (d.radius ?? 0) * 0.3)
            .attr("r", (d) => (d.radius ?? 0) * 0.08)
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .style("opacity", 0.7)
            .style("filter", "blur(0.5px)");
        bubbleGroups
            .append("circle")
            .attr("class", "inner-rim")
            .attr("r", (d) => (d.radius ?? 0) - 4)
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.3)")
            .attr("stroke-width", 1.5)
            .style("opacity", 0.6);
        bubbleGroups
            .append("text")
            .attr("class", "symbol-text")
            .attr("text-anchor", "middle")
            .attr("dy", selectedCategory === 'forex-pair' ? "-0.5em" : "-0.2em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "900")
            .style("font-size", (d) => `${Math.min((d.radius ?? 0) * 0.32, 22)}px`)
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
        if (selectedCategory === 'forex' || selectedCategory === 'forex-pair') {
            bubbleGroups
                .append("text")
                .attr("class", "rate-text")
                .attr("text-anchor", "middle")
                .attr("dy", selectedCategory === 'forex-pair' ? "0.3em" : "0.5em")
                .style("font-family", "JetBrains Mono, Monaco, Consolas, monospace")
                .style("font-weight", "700")
                .style("font-size", (d) => `${Math.min((d.radius ?? 0) * 0.16, 12)}px`)
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
        bubbleGroups
            .append("text")
            .attr("class", "change-text")
            .attr("text-anchor", "middle")
            .attr("dy", (selectedCategory === 'forex' || selectedCategory === 'forex-pair') ? "1.2em" : "0.8em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "800")
            .style("font-size", (d) => `${Math.min((d.radius ?? 0) * 0.20, 13)}px`)
            .style("fill", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .style("text-shadow", (d) => `
                0 0 8px rgba(0,0,0,0.9),
                0 1px 3px rgba(0,0,0,0.7),
                0 0 15px ${d.change24h > 0 ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
            `)
            .style("pointer-events", "none")
            .text((d) => `${d.change24h > 0 ? "+" : ""}${d.change24h.toFixed(2)}%`);
        // --- Enhanced Drag Behavior ---
        const drag = d3
            .drag<SVGGElement, CryptoCoin>()
            .on("start", function (event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart(); // Slightly higher alpha for drag
                d.fx = d.x;
                d.fy = d.y;
                const group = d3.select(this);
                group.style("cursor", "grabbing");
                group.select(".main-bubble")
                    .transition()
                    .duration(150)
                    .attr("r", ((d.radius ?? 0) * 1.1))
                    .style("opacity", 1)
                    .attr("stroke-width", 4);
                group.select(".atmospheric-glow")
                    .transition()
                    .duration(150)
                    .attr("r", ((d.radius ?? 0) + 25))
                    .style("opacity", 0.3);
            })
            .on("drag", function (event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", function (event, d) {
                if (!event.active) simulation.alphaTarget(0); // Reset alpha target
                d.fx = null;
                d.fy = null;
                const group = d3.select(this);
                group.style("cursor", "grab");
                group.select(".main-bubble")
                    .transition()
                    .duration(300)
                    .attr("r", d.radius ?? 0)
                    .style("opacity", 0.85)
                    .attr("stroke-width", 2.5);
                group.select(".atmospheric-glow")
                    .transition()
                    .duration(300)
                    .attr("r", ((d.radius ?? 0) + 15))
                    .style("opacity", 0.1);
            });
        bubbleGroups.each(function () {
            d3.select<SVGGElement, CryptoCoin>(this).call(drag);
        });
        // --- Enhanced Mouse Interactions ---
        bubbleGroups
            .on("mouseenter", function (_event, d) {
                const group = d3.select(this);
                const radius = d.radius ?? 0;
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
                    .attr("r", radius + 12)
                    .attr("stroke-width", 4);
                group.select(".atmospheric-glow")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.2)
                    .attr("r", radius + 20);
                group.select(".primary-highlight")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr("rx", radius * 0.5)
                    .attr("ry", radius * 0.3);
                group.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("filter", "drop-shadow(0 0 8px currentColor)");
            })
            .on("mouseleave", function (_event, d) {
                const group = d3.select(this);
                const radius = d.radius ?? 0;
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
                    .attr("r", radius + 8)
                    .attr("stroke-width", 3);
                group.select(".atmospheric-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.1)
                    .attr("r", radius + 15);
                group.select(".primary-highlight")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.9)
                    .attr("rx", radius * 0.45)
                    .attr("ry", radius * 0.25);
                group.selectAll("text")
                    .transition()
                    .duration(300)
                    .style("filter", "none");
            })
            .on("click", function (_event, d) {
                setSelectedBubble(d);
                const group = d3.select(this);
                const radius = d.radius ?? 0;
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
                    .attr("r", radius + 40)
                    .style("opacity", 0)
                    .style("stroke-width", 1)
                    .remove();
                group.select(".main-bubble")
                    .transition()
                    .duration(150)
                    .style("opacity", 1)
                    .transition()
                    .duration(150)
                    .style("opacity", 0.85);
            });
        // --- Update Positions on Tick ---
        simulation.on("tick", () => {
            bubbleGroups.attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`);
        });
        // --- Micro-interaction: Shimmer Effect ---
        const shimmerTimer = d3.timer(() => {
            bubbleGroups.selectAll<SVGCircleElement, CryptoCoin>(".primary-highlight")
                .style("opacity", () => 0.8 + Math.random() * 0.2); // Random opacity between 0.8 and 1.0
        });
        return () => {
            if (simulation) {
                simulation.stop();
            }
            if (simulationRef.current) {
                simulationRef.current.stop();
                simulationRef.current = null;
            }
            shimmerTimer.stop(); // Clean up the timer
        };
    }, [marketData, dimensions, loading, error, selectedCategory]);
    // --- Custom Force Functions ---
    // Custom force for subtle continuous movement
    function autoMoveForce(strength = 0.05) {
        let nodes: CryptoCoin[];
        function force(alpha: number) {
            const time = Date.now() * 0.001;
            nodes.forEach((d, i) => {
                // Gentle sinusoidal drift
                const phaseOffset = i * 0.1;
                const dx = Math.sin(time * 0.3 + phaseOffset) * strength;
                const dy = Math.cos(time * 0.4 + phaseOffset * 0.7) * strength;
                // Apply force (F = ma, but we apply directly to velocity)
                if (d.fx == null) d.vx = (d.vx || 0) + dx * alpha * 10; // Scale with alpha
                if (d.fy == null) d.vy = (d.vy || 0) + dy * alpha * 10;
            });
        }
        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }
    // Custom force for boundary repulsion
    function boundaryForce(width: number, height: number, padding: number, strength: number) {
        let nodes: CryptoCoin[];
        function force(alpha: number) {
            nodes.forEach(d => {
                const r = (d.radius ?? 0) + padding;
                let fx = 0, fy = 0;
                // Repel from left/right edges
                if (d.x !== undefined && d.x < r) fx += (r - d.x) * strength * alpha;
                if (d.x !== undefined && d.x > width - r) fx -= (d.x - width + r) * strength * alpha;
                // Repel from top/bottom edges
                if (d.y !== undefined && d.y < r) fy += (r - d.y) * strength * alpha;
                if (d.y !== undefined && d.y > height - r) fy -= (d.y - height + r) * strength * alpha;
                // Apply forces if not fixed
                if (d.fx == null && fx !== 0) d.vx = (d.vx || 0) + fx;
                if (d.fy == null && fy !== 0) d.vy = (d.vy || 0) + fy;
            });
        }
        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }
    const restartSimulation = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.alpha(0.5).restart(); // Higher alpha for a more noticeable restart
        }
    }, []);
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedBubble(null);
    };
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animated-bg">
            {/* Enhanced CSS Animations */}
            <style jsx>{`
                @keyframes pulse {
                    0% {
                        opacity: 0.1;
                        transform: scale(1);
                        filter: hue-rotate(0deg); /* Add hue rotation */
                    }
                    100% {
                        opacity: 0.2;
                        transform: scale(1.05);
                        filter: hue-rotate(10deg); /* Slight hue shift */
                    }
                }
                /* Animate the background gradient */
                .animated-bg {
                    background-size: 200% 200%;
                    animation: gradientShift 15s ease infinite;
                }
                @keyframes gradientShift {
                    0% { background-position: 0 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
            `}</style>
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
                        {/* Apply animated background class */}
                        <svg
                            ref={svgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="w-full rounded-2xl bg-gradient-to-br from-gray-900/70 to-gray-800/70 border border-gray-700/30 shadow-2xl backdrop-blur-sm"
                            style={{
                                background: `
                                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
                                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
                                    linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)
                                `
                            }}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-gray-300 text-sm px-6 py-4 rounded-2xl border border-gray-700/50 max-w-xs shadow-2xl">
                            <p className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                ⚡ LIGHTNING-FAST Glass Bubbles
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Bubbles streak like lightning
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                Explosive maximum collisions
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-spin"></span>
                                Chaotic direction changes
                            </p>
                            <p className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Click for detailed info
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                Maximum explosive bouncing
                            </p>
                        </div>
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
                        </div>
                    </div>
                )}
            </div>
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
