"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Search, Settings, Menu } from 'lucide-react';

const CryptoBubblesUI = () => {
    const svgRef = useRef(null);
    const simulationRef = useRef(null);
    const [selectedPeriod, setSelectedPeriod] = useState('Hour');
    const [searchTerm, setSearchTerm] = useState('');
    const [dimensions, setDimensions] = useState({ width: 1400, height: 800 });
    const [selectedBubble, setSelectedBubble] = useState(null);

    // Extended crypto data to match the screenshot
    const cryptoData = [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', change24h: -2.2, marketCap: 850000000000, price: 43250 },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', change24h: 0.6, marketCap: 280000000000, price: 2580 },
        { id: 'tether', symbol: 'USDT', name: 'Tether', change24h: 0.1, marketCap: 95000000000, price: 1.00 },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB', change24h: -1.4, marketCap: 45000000000, price: 315 },
        { id: 'xrp', symbol: 'XRP', name: 'XRP', change24h: -1.8, marketCap: 35000000000, price: 0.52 },
        { id: 'solana', symbol: 'SOL', name: 'Solana', change24h: 2.1, marketCap: 42000000000, price: 98 },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', change24h: -0.5, marketCap: 18000000000, price: 0.48 },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', change24h: 1.3, marketCap: 12000000000, price: 0.078 },
        { id: 'polygon', symbol: 'MATIC', name: 'Polygon', change24h: 3.1, marketCap: 9000000000, price: 0.87 },
        { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', change24h: -0.7, marketCap: 14000000000, price: 36 },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', change24h: -0.5, marketCap: 8000000000, price: 14.2 },
        { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', change24h: -3.3, marketCap: 5000000000, price: 6.8 },
        { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', change24h: -1.6, marketCap: 5500000000, price: 72 },
        { id: 'monero', symbol: 'XMR', name: 'Monero', change24h: 4.2, marketCap: 3000000000, price: 158 },
        { id: 'stellar', symbol: 'XLM', name: 'Stellar', change24h: -1.4, marketCap: 2800000000, price: 0.12 },
        { id: 'algorand', symbol: 'ALGO', name: 'Algorand', change24h: 3.3, marketCap: 1200000000, price: 0.19 },
        { id: 'vechain', symbol: 'VET', name: 'VeChain', change24h: 2.2, marketCap: 2400000000, price: 0.025 },
        { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', change24h: -3.3, marketCap: 2100000000, price: 4.8 },
        { id: 'tron', symbol: 'TRX', name: 'TRON', change24h: -0.1, marketCap: 6800000000, price: 0.078 },
        { id: 'maker', symbol: 'MKR', name: 'Maker', change24h: -7.4, marketCap: 1800000000, price: 1250 },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', change24h: -2.0, marketCap: 8900000000, price: 6.2 },
        { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', change24h: -2.4, marketCap: 3100000000, price: 7.8 },
        { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', change24h: -0.7, marketCap: 2200000000, price: 2.1 },
        { id: 'iota', symbol: 'IOTA', name: 'IOTA', change24h: -0.9, marketCap: 1100000000, price: 0.18 },
        { id: 'eos', symbol: 'EOS', name: 'EOS', change24h: -2.5, marketCap: 1400000000, price: 0.65 },
        { id: 'shiba', symbol: 'SHIB', name: 'Shiba Inu', change24h: -1.5, marketCap: 5800000000, price: 0.0000098 },
        { id: 'sandbox', symbol: 'SAND', name: 'The Sandbox', change24h: 1.8, marketCap: 1300000000, price: 0.34 },
        { id: 'theta', symbol: 'THETA', name: 'Theta Network', change24h: -0.7, marketCap: 1600000000, price: 1.2 },
        { id: 'hedera', symbol: 'HBAR', name: 'Hedera', change24h: -1.7, marketCap: 2000000000, price: 0.058 },
        { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer', change24h: -2.3, marketCap: 3200000000, price: 8.9 },
        { id: 'fantom', symbol: 'FTM', name: 'Fantom', change24h: -1.7, marketCap: 1700000000, price: 0.42 }
    ];

    const timePeriods = ['Hour', 'Day', 'Week', 'Month', 'Year', 'Market Cap & Day'];

    // Filter data based on search term
    const filteredData = cryptoData.filter(coin =>
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: Math.min(window.innerWidth - 40, 1400),
                height: Math.min(window.innerHeight - 250, 800)
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        // Set up scales
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(filteredData, d => d.marketCap)])
            .range([35, 130]);

        // Prepare data with calculated radius
        const bubbleData = filteredData.map((d, i) => ({
            ...d,
            radius: radiusScale(d.marketCap),
            x: width / 2 + (Math.random() - 0.5) * width * 0.8,
            y: height / 2 + (Math.random() - 0.5) * height * 0.8,
            fx: null,
            fy: null
        }));

        // Create force simulation
        const simulation = d3.forceSimulation(bubbleData)
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => d.radius + 8).strength(0.7))
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05))
            .alphaDecay(0.008)
            .velocityDecay(0.4);

        simulationRef.current = simulation;

        // Create advanced defs for glass effects
        const defs = svg.append('defs');

        // Glass bubble gradient for positive coins
        const positiveGradient = defs.append('radialGradient')
            .attr('id', 'glass-positive')
            .attr('cx', '30%')
            .attr('cy', '25%');

        positiveGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(255, 255, 255, 0.8)')
            .attr('stop-opacity', 0.3);

        positiveGradient.append('stop')
            .attr('offset', '30%')
            .attr('stop-color', 'rgba(34, 197, 94, 0.4)')
            .attr('stop-opacity', 0.4);

        positiveGradient.append('stop')
            .attr('offset', '70%')
            .attr('stop-color', 'rgba(34, 197, 94, 0.2)')
            .attr('stop-opacity', 0.3);

        positiveGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(0, 100, 40, 0.8)')
            .attr('stop-opacity', 0.6);

        // Glass bubble gradient for negative coins
        const negativeGradient = defs.append('radialGradient')
            .attr('id', 'glass-negative')
            .attr('cx', '30%')
            .attr('cy', '25%');

        negativeGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(255, 255, 255, 0.8)')
            .attr('stop-opacity', 0.3);

        negativeGradient.append('stop')
            .attr('offset', '30%')
            .attr('stop-color', 'rgba(239, 68, 68, 0.4)')
            .attr('stop-opacity', 0.4);

        negativeGradient.append('stop')
            .attr('offset', '70%')
            .attr('stop-color', 'rgba(239, 68, 68, 0.2)')
            .attr('stop-opacity', 0.3);

        negativeGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(120, 20, 20, 0.8)')
            .attr('stop-opacity', 0.6);

        // Advanced glow filter
        const glowFilter = defs.append('filter')
            .attr('id', 'advanced-glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'coloredBlur');

        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Inner light reflection filter
        const innerGlow = defs.append('filter')
            .attr('id', 'inner-glow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        innerGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        // Create bubble groups
        const bubbleGroups = svg.selectAll('.bubble-group')
            .data(bubbleData)
            .enter()
            .append('g')
            .attr('class', 'bubble-group')
            .style('cursor', 'grab');

        // Outer glow ring
        bubbleGroups.append('circle')
            .attr('class', 'outer-glow')
            .attr('r', d => d.radius + 8)
            .attr('fill', 'none')
            .attr('stroke', d => d.change24h > 0 ? '#22c55e' : '#ef4444')
            .attr('stroke-width', 1)
            .style('opacity', 0.3)
            .style('filter', 'blur(6px)');

        // Main glass bubble
        bubbleGroups.append('circle')
            .attr('class', 'glass-bubble')
            .attr('r', d => d.radius)
            .attr('fill', d => d.change24h > 0 ? 'url(#glass-positive)' : 'url(#glass-negative)')
            .attr('stroke', d => d.change24h > 0 ? '#22c55e' : '#ef4444')
            .attr('stroke-width', 2.5)
            .style('opacity', 0.85)
            .style('backdrop-filter', 'blur(10px)')
            .style('filter', 'url(#advanced-glow)');

        // Inner highlight for glass effect
        bubbleGroups.append('ellipse')
            .attr('class', 'glass-highlight')
            .attr('cx', d => -d.radius * 0.3)
            .attr('cy', d => -d.radius * 0.4)
            .attr('rx', d => d.radius * 0.4)
            .attr('ry', d => d.radius * 0.2)
            .attr('fill', 'rgba(255, 255, 255, 0.6)')
            .style('opacity', 0.8)
            .style('filter', 'blur(2px)');

        // Secondary smaller highlight
        bubbleGroups.append('circle')
            .attr('class', 'small-highlight')
            .attr('cx', d => d.radius * 0.2)
            .attr('cy', d => -d.radius * 0.2)
            .attr('r', d => d.radius * 0.15)
            .attr('fill', 'rgba(255, 255, 255, 0.4)')
            .style('opacity', 0.7)
            .style('filter', 'blur(1px)');

        // Inner reflection
        bubbleGroups.append('circle')
            .attr('class', 'inner-reflection')
            .attr('r', d => d.radius - 8)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.2)')
            .attr('stroke-width', 1)
            .style('opacity', 0.6);

        // Symbol text with glass effect
        bubbleGroups.append('text')
            .attr('class', 'symbol-text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif')
            .style('font-weight', '900')
            .style('font-size', d => `${Math.min(d.radius * 0.35, 32)}px`)
            .style('fill', 'white')
            .style('text-shadow', '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)')
            .style('pointer-events', 'none')
            .text(d => d.symbol);

        // Percentage change with enhanced styling
        bubbleGroups.append('text')
            .attr('class', 'change-text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.4em')
            .style('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif')
            .style('font-weight', '700')
            .style('font-size', d => `${Math.min(d.radius * 0.22, 16)}px`)
            .style('fill', d => d.change24h > 0 ? '#22c55e' : '#ef4444')
            .style('text-shadow', '0 0 6px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)')
            .style('pointer-events', 'none')
            .text(d => `${d.change24h > 0 ? '+' : ''}${d.change24h.toFixed(1)}%`);

        // Drag behavior
        const drag = d3.drag()
            .on('start', function (event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
                d3.select(this).style('cursor', 'grabbing');

                // Enhanced drag start effect
                d3.select(this).select('.glass-bubble')
                    .transition()
                    .duration(150)
                    .attr('r', d.radius * 1.1)
                    .style('opacity', 1)
                    .attr('stroke-width', 4);
            })
            .on('drag', function (event, d) {
                d.fx = event.x;
                d.fy = event.y;

                // Add subtle trail effect during drag
                d3.select(this).select('.outer-glow')
                    .style('opacity', 0.6)
                    .attr('r', d.radius + 15);
            })
            .on('end', function (event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
                d3.select(this).style('cursor', 'grab');

                // Reset effects
                d3.select(this).select('.glass-bubble')
                    .transition()
                    .duration(300)
                    .attr('r', d.radius)
                    .style('opacity', 0.85)
                    .attr('stroke-width', 2.5);

                d3.select(this).select('.outer-glow')
                    .transition()
                    .duration(300)
                    .style('opacity', 0.3)
                    .attr('r', d.radius + 8);
            });

        // Apply drag behavior
        bubbleGroups.call(drag);

        // Enhanced hover effects
        bubbleGroups
            .on('mouseenter', function (event, d) {
                if (event.defaultPrevented) return; // Don't interfere with drag

                const group = d3.select(this);

                // Glass bubble enhancement
                group.select('.glass-bubble')
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 4)
                    .style('opacity', 1)
                    .style('filter', 'url(#advanced-glow) brightness(1.2)');

                // Enhance highlights
                group.select('.glass-highlight')
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .attr('rx', d => d.radius * 0.5)
                    .attr('ry', d => d.radius * 0.25);

                // Outer glow enhancement
                group.select('.outer-glow')
                    .transition()
                    .duration(200)
                    .style('opacity', 0.7)
                    .attr('r', d.radius + 12)
                    .attr('stroke-width', 2);

                // Text enhancement
                group.selectAll('text')
                    .transition()
                    .duration(200)
                    .style('filter', 'drop-shadow(0 0 8px currentColor)');
            })
            .on('mouseleave', function (event, d) {
                const group = d3.select(this);

                // Reset all effects
                group.select('.glass-bubble')
                    .transition()
                    .duration(300)
                    .attr('stroke-width', 2.5)
                    .style('opacity', 0.85)
                    .style('filter', 'url(#advanced-glow)');

                group.select('.glass-highlight')
                    .transition()
                    .duration(300)
                    .style('opacity', 0.8)
                    .attr('rx', d => d.radius * 0.4)
                    .attr('ry', d => d.radius * 0.2);

                group.select('.outer-glow')
                    .transition()
                    .duration(300)
                    .style('opacity', 0.3)
                    .attr('r', d.radius + 8)
                    .attr('stroke-width', 1);

                group.selectAll('text')
                    .transition()
                    .duration(300)
                    .style('filter', 'none');
            })
            .on('click', function (event, d) {
                if (event.defaultPrevented) return; // Don't interfere with drag

                setSelectedBubble(d);

                // Click ripple effect
                const group = d3.select(this);
                const clickRipple = group.append('circle')
                    .attr('r', 0)
                    .attr('fill', 'none')
                    .attr('stroke', d.change24h > 0 ? '#22c55e' : '#ef4444')
                    .attr('stroke-width', 3)
                    .style('opacity', 1);

                clickRipple
                    .transition()
                    .duration(600)
                    .attr('r', d.radius + 30)
                    .style('opacity', 0)
                    .remove();
            });

        // Update positions on simulation tick
        simulation.on('tick', () => {
            bubbleGroups
                .attr('transform', d => `translate(${d.x}, ${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [dimensions, filteredData]);

    const restartSimulation = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.alpha(1).restart();
        }
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
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
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {period}
                    </button>
                ))}

                <button className="p-2 ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    ✏️
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    ➕
                </button>
            </div>

            {/* Main Visualization Area */}
            <div className="p-4">
                <div className="relative">
                    <svg
                        ref={svgRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        className="w-full rounded-lg"
                        style={{ backgroundColor: '#1a1a1a' }}
                    />

                    {/* Instruction text */}
                    <div className="absolute bottom-4 left-4 text-gray-400 text-sm bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                        💡 Drag bubbles to move them around
                    </div>

                    {/* Small left sidebar with additional bubbles */}
                    <div className="absolute left-0 top-0 flex flex-col gap-2 p-2">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/30 transition-colors cursor-pointer backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-white text-xs font-bold">HYPE</div>
                                <div className="text-green-400 text-xs">+0.6%</div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors cursor-pointer backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-white text-xs font-bold">FART</div>
                                <div className="text-red-400 text-xs">-0.8%</div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors cursor-pointer backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-white text-xs">BGB</div>
                                <div className="text-red-400 text-xs">-0.5%</div>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors cursor-pointer backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-white text-sm font-bold">KAIA</div>
                                <div className="text-red-400 text-sm">-1.8%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Bubble Details */}
            {selectedBubble && (
                <div className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-lg p-6 shadow-2xl max-w-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white text-lg font-bold">{selectedBubble.name}</h3>
                            <p className="text-gray-400">{selectedBubble.symbol}</p>
                        </div>
                        <button
                            onClick={() => setSelectedBubble(null)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
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
                            <span className={`font-semibold ${selectedBubble.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedBubble.change24h >= 0 ? '+' : ''}{selectedBubble.change24h.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Market Cap:</span>
                            <span className="text-white font-semibold">
                                ${(selectedBubble.marketCap / 1e9).toFixed(1)}B
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CryptoBubblesUI;