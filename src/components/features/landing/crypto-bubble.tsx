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
    const [cryptoData, setCryptoData] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Mock crypto data - replace this with your API call
    const generateMockCryptoData = useCallback((): CryptoCoin[] => {
        const cryptos = [
            { symbol: "BTC", name: "Bitcoin", price: 64250, change24h: 2.45, marketCap: 1265000000000, rank: 1 },
            { symbol: "ETH", name: "Ethereum", price: 3420, change24h: -1.23, marketCap: 411000000000, rank: 2 },
            { symbol: "BNB", name: "BNB", price: 580, change24h: 3.67, marketCap: 84500000000, rank: 3 },
            { symbol: "SOL", name: "Solana", price: 145, change24h: 5.23, marketCap: 67800000000, rank: 4 },
            { symbol: "XRP", name: "XRP", price: 0.52, change24h: -2.18, marketCap: 29400000000, rank: 5 },
            { symbol: "USDC", name: "USD Coin", price: 1.00, change24h: 0.01, marketCap: 28100000000, rank: 6 },
            { symbol: "STETH", name: "Staked Ether", price: 3415, change24h: -1.19, marketCap: 27600000000, rank: 7 },
            { symbol: "ADA", name: "Cardano", price: 0.45, change24h: 1.85, marketCap: 15800000000, rank: 8 },
            { symbol: "AVAX", name: "Avalanche", price: 28.50, change24h: 4.12, marketCap: 11200000000, rank: 9 },
            { symbol: "DOGE", name: "Dogecoin", price: 0.12, change24h: -0.95, marketCap: 17600000000, rank: 10 },
            { symbol: "TRX", name: "TRON", price: 0.16, change24h: 2.73, marketCap: 14100000000, rank: 11 },
            { symbol: "LINK", name: "Chainlink", price: 11.85, change24h: 3.45, marketCap: 7200000000, rank: 12 },
            { symbol: "TON", name: "Toncoin", price: 5.42, change24h: -1.67, marketCap: 13800000000, rank: 13 },
            { symbol: "MATIC", name: "Polygon", price: 0.58, change24h: 2.34, marketCap: 5400000000, rank: 14 },
            { symbol: "SHIB", name: "Shiba Inu", price: 0.000018, change24h: 1.23, marketCap: 10600000000, rank: 15 },
            { symbol: "ICP", name: "Internet Computer", price: 8.95, change24h: -2.45, marketCap: 4100000000, rank: 16 },
            { symbol: "UNI", name: "Uniswap", price: 7.20, change24h: 1.89, marketCap: 4300000000, rank: 17 },
            { symbol: "LTC", name: "Litecoin", price: 68, change24h: 0.75, marketCap: 5100000000, rank: 18 },
            { symbol: "BCH", name: "Bitcoin Cash", price: 385, change24h: 1.45, marketCap: 7600000000, rank: 19 },
            { symbol: "NEAR", name: "NEAR Protocol", price: 4.85, change24h: 3.21, marketCap: 5300000000, rank: 20 }
        ];

        return cryptos.map((crypto, index) => ({
            id: crypto.symbol.toLowerCase(),
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.price,
            change24h: crypto.change24h,
            marketCap: crypto.marketCap,
            volume24h: crypto.marketCap * (0.1 + Math.random() * 0.3),
            rank: crypto.rank
        }));
    }, []);

    // Fetch crypto data
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (!isMounted) return;

                const mockData = generateMockCryptoData();

                // Filter based on search term
                const filtered = mockData.filter(
                    (c) =>
                        c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                setCryptoData(filtered);
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

        if (selectedCategory === 'crypto') {
            fetchData();
        } else {
            // For forex and forex-pair categories, show empty state for now
            setCryptoData([]);
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [searchTerm, selectedCategory, generateMockCryptoData]);

    // Handle viewport resizing
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: Math.min(window.innerWidth - 40, 1400),
                height: Math.min(window.innerHeight - 300, 800),
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // D3 Rendering with live data
    useEffect(() => {
        if (!svgRef.current || selectedCategory !== 'crypto') return;
        if (loading || error || cryptoData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        const maxMarketCap = d3.max(cryptoData, (d) => d.marketCap) ?? 1;
        const minMarketCap = d3.min(cryptoData, (d) => d.marketCap) ?? 0;

        const radiusScale = d3.scaleSqrt()
            .domain([minMarketCap, maxMarketCap])
            .range([30, Math.min(width, height) * 0.1]);

        const bubbleData: CryptoCoin[] = cryptoData.map((d) => ({
            ...d,
            radius: radiusScale(d.marketCap),
            x: width / 2 + (Math.random() - 0.5) * width * 0.8,
            y: height / 2 + (Math.random() - 0.5) * height * 0.8,
            fx: null,
            fy: null,
        }));

        const simulation = d3
            .forceSimulation<CryptoCoin>(bubbleData)
            .force("charge", d3.forceManyBody().strength(-30))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide<CryptoCoin>().radius((d) => d.radius! + 5).strength(0.8))
            .force("x", d3.forceX(width / 2).strength(0.03))
            .force("y", d3.forceY(height / 2).strength(0.03))
            .alphaDecay(0.005)
            .velocityDecay(0.3);

        simulationRef.current = simulation;

        // Define gradients and filters for glass effect
        const defs = svg.append("defs");

        // Positive gradient (green)
        const positiveGradient = defs
            .append("radialGradient")
            .attr("id", "glass-positive")
            .attr("cx", "30%")
            .attr("cy", "25%");

        positiveGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255, 0.8)")
            .attr("stop-opacity", 0.4);
        positiveGradient.append("stop")
            .attr("offset", "30%")
            .attr("stop-color", "rgba(34, 197, 94, 0.6)")
            .attr("stop-opacity", 0.5);
        positiveGradient.append("stop")
            .attr("offset", "70%")
            .attr("stop-color", "rgba(34, 197, 94, 0.3)")
            .attr("stop-opacity", 0.4);
        positiveGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(0, 100, 40, 0.9)")
            .attr("stop-opacity", 0.7);

        // Negative gradient (red)
        const negativeGradient = defs
            .append("radialGradient")
            .attr("id", "glass-negative")
            .attr("cx", "30%")
            .attr("cy", "25%");

        negativeGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255, 0.8)")
            .attr("stop-opacity", 0.4);
        negativeGradient.append("stop")
            .attr("offset", "30%")
            .attr("stop-color", "rgba(239, 68, 68, 0.6)")
            .attr("stop-opacity", 0.5);
        negativeGradient.append("stop")
            .attr("offset", "70%")
            .attr("stop-color", "rgba(239, 68, 68, 0.3)")
            .attr("stop-opacity", 0.4);
        negativeGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(120, 20, 20, 0.9)")
            .attr("stop-opacity", 0.7);

        // Glow filter
        const glowFilter = defs
            .append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        glowFilter.append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "coloredBlur");

        const feMerge = glowFilter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Create bubble groups
        const bubbleGroups = svg
            .selectAll<SVGGElement, CryptoCoin>(".bubble-group")
            .data(bubbleData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .style("cursor", "grab");

        // Outer glow
        bubbleGroups
            .append("circle")
            .attr("class", "outer-glow")
            .attr("r", (d) => d.radius! + 6)
            .attr("fill", "none")
            .attr("stroke", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .attr("stroke-width", 1)
            .style("opacity", 0.3)
            .style("filter", "blur(4px)");

        // Main bubble
        bubbleGroups
            .append("circle")
            .attr("class", "glass-bubble")
            .attr("r", (d) => d.radius!)
            .attr("fill", (d) => (d.change24h > 0 ? "url(#glass-positive)" : "url(#glass-negative)"))
            .attr("stroke", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .attr("stroke-width", 2)
            .style("opacity", 0.9)
            .style("filter", "url(#glow)");

        // Glass highlight
        bubbleGroups
            .append("ellipse")
            .attr("class", "glass-highlight")
            .attr("cx", (d) => -d.radius! * 0.3)
            .attr("cy", (d) => -d.radius! * 0.4)
            .attr("rx", (d) => d.radius! * 0.4)
            .attr("ry", (d) => d.radius! * 0.2)
            .attr("fill", "rgba(255, 255, 255, 0.5)")
            .style("opacity", 0.8)
            .style("filter", "blur(1px)");

        // Symbol text
        bubbleGroups
            .append("text")
            .attr("class", "symbol-text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.1em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "900")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.4, 24)}px`)
            .style("fill", "white")
            .style("text-shadow", "0 0 6px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)")
            .style("pointer-events", "none")
            .text((d) => d.symbol);

        // Change percentage text
        bubbleGroups
            .append("text")
            .attr("class", "change-text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "700")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.25, 14)}px`)
            .style("fill", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)")
            .style("pointer-events", "none")
            .text((d) => `${d.change24h > 0 ? "+" : ""}${d.change24h.toFixed(2)}%`);

        // Drag behavior
        const drag = d3
            .drag<SVGGElement, CryptoCoin>()
            .on("start", (event, d) => {
                if (!event.active && simulationRef.current) {
                    simulationRef.current.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
                d3.select(event.sourceEvent.target.parentNode).style("cursor", "grabbing");
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
                d3.select(event.sourceEvent.target.parentNode).style("cursor", "grab");
            });

        bubbleGroups.call(drag);

        // Mouse interactions
        bubbleGroups
            .on("mouseenter", function (event, d) {
                const group = d3.select(this);
                group.select(".glass-bubble")
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 3)
                    .style("opacity", 1);

                group.select(".outer-glow")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.6)
                    .attr("r", d.radius! + 10);
            })
            .on("mouseleave", function (event, d) {
                const group = d3.select(this);
                group.select(".glass-bubble")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", 2)
                    .style("opacity", 0.9);

                group.select(".outer-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.3)
                    .attr("r", d.radius! + 6);
            })
            .on("click", function (event, d) {
                setSelectedBubble(d);
            });

        // Update positions on tick
        simulation.on("tick", () => {
            bubbleGroups.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [cryptoData, dimensions, loading, error, selectedCategory]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Dynamic Header */}
            <Header
                title="CRYPTO BUBBLES"
                subtitle="Live Cryptocurrency Visualization"
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
                {loading && selectedCategory === 'crypto' && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-white font-medium">Loading crypto bubbles...</p>
                        </div>
                    </div>
                )}

                {error && selectedCategory === 'crypto' && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg p-8">
                            <p className="text-red-400 font-medium text-lg mb-2">Error Loading Data</p>
                            <p className="text-gray-400">{error}</p>
                        </div>
                    </div>
                )}

                {selectedCategory !== 'crypto' && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded-lg p-8">
                            <p className="text-blue-400 font-medium text-lg mb-2">Coming Soon</p>
                            <p className="text-gray-400">
                                {selectedCategory === 'forex' ? 'Forex currencies' : 'Forex pairs'} visualization will be available soon!
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && selectedCategory === 'crypto' && cryptoData.length === 0 && searchTerm && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8">
                            <p className="text-yellow-400 font-medium text-lg mb-2">No Results Found</p>
                            <p className="text-gray-400">No cryptocurrencies match your search term "{searchTerm}"</p>
                        </div>
                    </div>
                )}

                {!loading && !error && selectedCategory === 'crypto' && cryptoData.length > 0 && (
                    <div className="relative">
                        <svg
                            ref={svgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="w-full rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50"
                        />

                        {/* Instructions */}
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-gray-300 text-sm px-4 py-2 rounded-lg border border-gray-700/50">
                            💡 Drag bubbles to move them around • Click to view details
                        </div>

                        {/* Stats */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-gray-300 text-sm px-4 py-2 rounded-lg border border-gray-700/50">
                            Showing {cryptoData.length} cryptocurrencies
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Bubble Details */}
            {selectedBubble && (
                <div className="fixed bottom-6 right-6 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 shadow-2xl max-w-sm z-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${selectedBubble.change24h > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <h3 className="text-white text-lg font-bold">{selectedBubble.name}</h3>
                                <p className="text-gray-400 text-sm">{selectedBubble.symbol}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedBubble(null)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white font-semibold">
                                ${selectedBubble.price >= 1
                                    ? selectedBubble.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : selectedBubble.price.toFixed(6)
                                }
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">24h Change:</span>
                            <span className={`font-semibold ${selectedBubble.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {selectedBubble.change24h >= 0 ? "+" : ""}
                                {selectedBubble.change24h.toFixed(2)}%
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Market Cap:</span>
                            <span className="text-white font-semibold">
                                ${(selectedBubble.marketCap / 1e9).toFixed(1)}B
                            </span>
                        </div>

                        {selectedBubble.rank && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Rank:</span>
                                <span className="text-white font-semibold">#{selectedBubble.rank}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CryptoBubblesUI;