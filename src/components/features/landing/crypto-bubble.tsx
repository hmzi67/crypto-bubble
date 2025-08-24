"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { Search, Settings, Menu } from "lucide-react";
import { fetchTopCryptos } from "@/services/coinApiService";

type CryptoCoin = {
    id: string;
    symbol: string;
    name: string;
    change24h: number;
    marketCap: number;
    price: number;
    radius?: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
};

const CryptoBubblesUI: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const simulationRef = useRef<d3.Simulation<CryptoCoin, undefined> | null>(null);

    const [selectedPeriod, setSelectedPeriod] = useState<string>("Hour");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width: 1400,
        height: 800,
    });
    const [selectedBubble, setSelectedBubble] = useState<CryptoCoin | null>(null);
    const [cryptoData, setCryptoData] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch live crypto data using your API service
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const liveData = await fetchTopCryptos(30);

                if (!isMounted) return;

                // Map API shape to CryptoCoin
                // Assuming your API returns price field or else default 0
                // Define the expected API coin type
                type ApiCoin = {
                    id: string;
                    symbol: string;
                    name: string;
                    priceChange24h: number;
                    marketCap: number;
                    price?: number;
                };
                const mappedData: CryptoCoin[] = (liveData as ApiCoin[]).map((coin) => ({
                    id: coin.id,
                    symbol: coin.symbol,
                    name: coin.name,
                    change24h: coin.priceChange24h,
                    marketCap: coin.marketCap,
                    price: coin.price ?? 0,
                }));

                // Search filtering
                const filtered = mappedData.filter(
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

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [searchTerm]);

    // Handle viewport resizing
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: Math.min(window.innerWidth - 40, 1400),
                height: Math.min(window.innerHeight - 250, 800),
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // D3 Rendering with live data
    useEffect(() => {
        if (!svgRef.current) return;
        if (loading || error) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        const maxMarketCap = d3.max(cryptoData, (d) => d.marketCap) ?? 1;

        const radiusScale = d3.scaleSqrt().domain([0, maxMarketCap]).range([35, 130]);

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
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide<CryptoCoin>().radius((d) => d.radius! + 8).strength(0.7))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05))
            .alphaDecay(0.008)
            .velocityDecay(0.4);

        simulationRef.current = simulation;

        // Define gradients and filters for glass effect
        const defs = svg.append("defs");

        const positiveGradient = defs
            .append("radialGradient")
            .attr("id", "glass-positive")
            .attr("cx", "30%")
            .attr("cy", "25%");

        positiveGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255, 0.8)")
            .attr("stop-opacity", 0.3);

        positiveGradient
            .append("stop")
            .attr("offset", "30%")
            .attr("stop-color", "rgba(34, 197, 94, 0.4)")
            .attr("stop-opacity", 0.4);

        positiveGradient
            .append("stop")
            .attr("offset", "70%")
            .attr("stop-color", "rgba(34, 197, 94, 0.2)")
            .attr("stop-opacity", 0.3);

        positiveGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(0, 100, 40, 0.8)")
            .attr("stop-opacity", 0.6);

        const negativeGradient = defs
            .append("radialGradient")
            .attr("id", "glass-negative")
            .attr("cx", "30%")
            .attr("cy", "25%");

        negativeGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255, 0.8)")
            .attr("stop-opacity", 0.3);

        negativeGradient
            .append("stop")
            .attr("offset", "30%")
            .attr("stop-color", "rgba(239, 68, 68, 0.4)")
            .attr("stop-opacity", 0.4);

        negativeGradient
            .append("stop")
            .attr("offset", "70%")
            .attr("stop-color", "rgba(239, 68, 68, 0.2)")
            .attr("stop-opacity", 0.3);

        negativeGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(120, 20, 20, 0.8)")
            .attr("stop-opacity", 0.6);

        const glowFilter = defs
            .append("filter")
            .attr("id", "advanced-glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");

        const feMerge = glowFilter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        const innerGlow = defs
            .append("filter")
            .attr("id", "inner-glow")
            .attr("x", "-20%")
            .attr("y", "-20%")
            .attr("width", "140%")
            .attr("height", "140%");

        innerGlow.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");

        // Create bubble groups
        const bubbleGroups = svg
            .selectAll<SVGGElement, CryptoCoin>(".bubble-group")
            .data(bubbleData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .style("cursor", "grab");

        bubbleGroups
            .append("circle")
            .attr("class", "outer-glow")
            .attr("r", (d) => d.radius! + 8)
            .attr("fill", "none")
            .attr("stroke", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .attr("stroke-width", 1)
            .style("opacity", 0.3)
            .style("filter", "blur(6px)");

        bubbleGroups
            .append("circle")
            .attr("class", "glass-bubble")
            .attr("r", (d) => d.radius!)
            .attr("fill", (d) => (d.change24h > 0 ? "url(#glass-positive)" : "url(#glass-negative)"))
            .attr("stroke", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .attr("stroke-width", 2.5)
            .style("opacity", 0.85)
            .style("backdrop-filter", "blur(10px)")
            .style("filter", "url(#advanced-glow)");

        bubbleGroups
            .append("ellipse")
            .attr("class", "glass-highlight")
            .attr("cx", (d) => -d.radius! * 0.3)
            .attr("cy", (d) => -d.radius! * 0.4)
            .attr("rx", (d) => d.radius! * 0.4)
            .attr("ry", (d) => d.radius! * 0.2)
            .attr("fill", "rgba(255, 255, 255, 0.6)")
            .style("opacity", 0.8)
            .style("filter", "blur(2px)");

        bubbleGroups
            .append("circle")
            .attr("class", "small-highlight")
            .attr("cx", (d) => d.radius! * 0.2)
            .attr("cy", (d) => -d.radius! * 0.2)
            .attr("r", (d) => d.radius! * 0.15)
            .attr("fill", "rgba(255, 255, 255, 0.4)")
            .style("opacity", 0.7)
            .style("filter", "blur(1px)");

        bubbleGroups
            .append("circle")
            .attr("class", "inner-reflection")
            .attr("r", (d) => d.radius! - 8)
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.2)")
            .attr("stroke-width", 1)
            .style("opacity", 0.6);

        bubbleGroups
            .append("text")
            .attr("class", "symbol-text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.2em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "900")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.35, 32)}px`)
            .style("fill", "white")
            .style("text-shadow", "0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)")
            .style("pointer-events", "none")
            .text((d) => d.symbol);

        bubbleGroups
            .append("text")
            .attr("class", "change-text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.4em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "700")
            .style("font-size", (d) => `${Math.min(d.radius! * 0.22, 16)}px`)
            .style("fill", (d) => (d.change24h > 0 ? "#22c55e" : "#ef4444"))
            .style("text-shadow", "0 0 6px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)")
            .style("pointer-events", "none")
            .text((d) => `${d.change24h > 0 ? "+" : ""}${d.change24h.toFixed(1)}%`);

        const drag = d3
            .drag<SVGGElement, CryptoCoin>()
            .on("start", (event: d3.D3DragEvent<SVGGElement, CryptoCoin, unknown>, d: CryptoCoin) => {
                if (!event.active && simulationRef.current) {
                    simulationRef.current.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement).style("cursor", "grabbing");

                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement)
                    .select(".glass-bubble")
                    .transition()
                    .duration(150)
                    .attr("r", d.radius! * 1.1)
                    .style("opacity", 1)
                    .attr("stroke-width", 4);
            })
            .on("drag", (event: d3.D3DragEvent<SVGGElement, CryptoCoin, unknown>, d: CryptoCoin) => {
                d.fx = event.x;
                d.fy = event.y;

                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement).select(".outer-glow").style("opacity", 0.6).attr("r", d.radius! + 15);
            })
            .on("end", (event: d3.D3DragEvent<SVGGElement, CryptoCoin, unknown>, d: CryptoCoin) => {
                if (!event.active && simulationRef.current) {
                    simulationRef.current.alphaTarget(0);
                }
                d.fx = null;
                d.fy = null;

                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement).style("cursor", "grab");

                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement)
                    .select(".glass-bubble")
                    .transition()
                    .duration(300)
                    .attr("r", d.radius!)
                    .style("opacity", 0.85)
                    .attr("stroke-width", 2.5);

                d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement)
                    .select(".outer-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.3)
                    .attr("r", d.radius! + 8);
            });

        bubbleGroups.call(drag);

        bubbleGroups
            .on("mouseenter", (event: React.MouseEvent<SVGGElement>, d: CryptoCoin) => {
                if ((event as unknown as { defaultPrevented: boolean }).defaultPrevented) return;

                const group = d3.select(event.currentTarget as SVGGElement);

                group
                    .select(".glass-bubble")
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 4)
                    .style("opacity", 1)
                    .style("filter", "url(#advanced-glow) brightness(1.2)");

                group
                    .select(".glass-highlight")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr("rx", d.radius! * 0.5)
                    .attr("ry", d.radius! * 0.25);

                group
                    .select(".outer-glow")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.7)
                    .attr("r", d.radius! + 12)
                    .attr("stroke-width", 2);

                group.selectAll("text").transition().duration(200).style("filter", "drop-shadow(0 0 8px currentColor)");
            })
            .on("mouseleave", (event: React.MouseEvent<SVGGElement>, d: CryptoCoin) => {
                const group = d3.select(event.currentTarget as SVGGElement);

                group
                    .select(".glass-bubble")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", 2.5)
                    .style("opacity", 0.85)
                    .style("filter", "url(#advanced-glow)");

                group
                    .select(".glass-highlight")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.8)
                    .attr("rx", d.radius! * 0.4)
                    .attr("ry", d.radius! * 0.2);

                group
                    .select(".outer-glow")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.3)
                    .attr("r", d.radius! + 8)
                    .attr("stroke-width", 1);

                group.selectAll("text").transition().duration(300).style("filter", "none");
            })
            .on("click", (event: React.MouseEvent<SVGGElement>, d: CryptoCoin) => {
                if ((event as unknown as { defaultPrevented: boolean }).defaultPrevented) return;

                setSelectedBubble(d);

                const group = d3.select(event.currentTarget as SVGGElement);
                const clickRipple = group
                    .append("circle")
                    .attr("r", 0)
                    .attr("fill", "none")
                    .attr("stroke", d.change24h > 0 ? "#22c55e" : "#ef4444")
                    .attr("stroke-width", 3)
                    .style("opacity", 1);

                clickRipple
                    .transition()
                    .duration(600)
                    .attr("r", d.radius! + 30)
                    .style("opacity", 0)
                    .remove();
            });

        simulation.on("tick", () => {
            bubbleGroups.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [cryptoData, dimensions, loading, error]);

    const restartSimulation = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.alpha(1).restart();
        }
    }, []);

    const timePeriods = ["Hour", "Day", "Week", "Month", "Year", "Market Cap & Day"];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#1a1a1a" }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">CB</span>
                        </div>
                        <h1 className="text-white text-xl font-bold tracking-wider">CRYPTO BUBBLES</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search cryptocurrency"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none w-64"
                        />
                    </div>

                    {/* Display Options */}
                    <div className="flex items-center gap-2">
                        <span className="text-white">1 - 100</span>
                        <select className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none">
                            <option>1 - 100</option>
                            <option>1 - 200</option>
                            <option>1 - 500</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-white">$ USD</span>
                        <select className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none">
                            <option>$ USD</option>
                            <option>€ EUR</option>
                            <option>₿ BTC</option>
                        </select>
                    </div>

                    <button
                        onClick={restartSimulation}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Restart Animation"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Time Period Tabs */}
            <div className="flex items-center gap-1 p-4 border-b border-gray-800">
                {timePeriods.map((period) => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedPeriod === period
                            ? "bg-red-600 text-white shadow-lg"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        {period}
                    </button>
                ))}

                <button className="p-2 ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">✏️</button>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">➕</button>
            </div>

            {/* Loading and error display */}
            {loading && <div className="p-4 text-white font-medium">Loading live crypto data...</div>}
            {error && <div className="p-4 text-red-500 font-medium">{error}</div>}

            {/* Main Visualization Area */}
            <div className="p-4 relative">
                <svg
                    ref={svgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="w-full rounded-lg"
                    style={{ backgroundColor: "#1a1a1a" }}
                />

                {/* Instruction text */}
                <div className="absolute bottom-4 left-4 text-gray-400 text-sm bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                    💡 Drag bubbles to move them around
                </div>

                {/* Left sidebar additional bubbles could be added here as needed */}
            </div>

            {/* Selected Bubble Details */}
            {selectedBubble && (
                <div className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-lg p-6 shadow-2xl max-w-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white text-lg font-bold">{selectedBubble.name}</h3>
                            <p className="text-gray-400">{selectedBubble.symbol}</p>
                        </div>
                        <button onClick={() => setSelectedBubble(null)} className="text-gray-400 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white font-semibold">
                                ${selectedBubble.price >= 1 ? selectedBubble.price.toLocaleString() : selectedBubble.price.toFixed(6)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">24h Change:</span>
                            <span className={`font-semibold ${selectedBubble.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {selectedBubble.change24h >= 0 ? "+" : ""}
                                {selectedBubble.change24h.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Market Cap:</span>
                            <span className="text-white font-semibold">${(selectedBubble.marketCap / 1e9).toFixed(1)}B</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CryptoBubblesUI;
