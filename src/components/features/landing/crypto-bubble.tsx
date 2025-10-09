"use client"
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Image from "next/image";
import Header from "@/components/layout/header";
type CryptoCoin = {
    id: string;
    symbol: string;
    name: string;
    change1h?: number;
    change24h: number;
    change7d?: number;
    change30d?: number;
    marketCap: number;
    price: number;
    volume24h?: number;
    rank?: number;
    logoUrl?: string;
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
    baseCountryCode?: string;
    quoteCountryCode?: string;
    bid?: number;
    ask?: number;
    spread?: number;
};
type CoinGeckoCoin = {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_1h_in_currency?: number | null;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d_in_currency?: number | null;
    price_change_percentage_30d_in_currency?: number | null;
    market_cap: number;
    total_volume: number;
    market_cap_rank: number;
};
type ExchangeRateResponse = {
    base: string;
    rates: { [key: string]: number };
};
const currencyDetails: { [key: string]: { name: string; country: string; importance: number } } = {
    "USD": { name: "US Dollar", country: "US", importance: 100 },
    "EUR": { name: "Euro", country: "EU", importance: 95 },
    "GBP": { name: "British Pound", country: "GB", importance: 85 },
    "JPY": { name: "Japanese Yen", country: "JP", importance: 90 },
    "CHF": { name: "Swiss Franc", country: "CH", importance: 75 },
    "CAD": { name: "Canadian Dollar", country: "CA", importance: 70 },
    "AUD": { name: "Australian Dollar", country: "AU", importance: 65 },
    "NZD": { name: "New Zealand Dollar", country: "NZ", importance: 60 },
    "SEK": { name: "Swedish Krona", country: "SE", importance: 55 },
    "NOK": { name: "Norwegian Krone", country: "NO", importance: 55 },
    "DKK": { name: "Danish Krone", country: "DK", importance: 50 },
    "PLN": { name: "Polish Zloty", country: "PL", importance: 45 },
    "CZK": { name: "Czech Koruna", country: "CZ", importance: 40 },
    "HUF": { name: "Hungarian Forint", country: "HU", importance: 38 },
    "TRY": { name: "Turkish Lira", country: "TR", importance: 42 },
    "ZAR": { name: "South African Rand", country: "ZA", importance: 48 },
    "MXN": { name: "Mexican Peso", country: "MX", importance: 50 },
    "BRL": { name: "Brazilian Real", country: "BR", importance: 52 },
    "CNY": { name: "Chinese Yuan", country: "CN", importance: 88 },
    "KRW": { name: "South Korean Won", country: "KR", importance: 50 },
    "SGD": { name: "Singapore Dollar", country: "SG", importance: 58 },
    "INR": { name: "Indian Rupee", country: "IN", importance: 62 },
    "RUB": { name: "Russian Ruble", country: "RU", importance: 55 },
    "HKD": { name: "Hong Kong Dollar", country: "HK", importance: 57 },
    "ILS": { name: "Israeli Shekel", country: "IL", importance: 45 },
    "PHP": { name: "Philippine Peso", country: "PH", importance: 35 },
    "MYR": { name: "Malaysian Ringgit", country: "MY", importance: 40 },
    "THB": { name: "Thai Baht", country: "TH", importance: 42 },
    "IDR": { name: "Indonesian Rupiah", country: "ID", importance: 38 },
    "VND": { name: "Vietnamese Dong", country: "VN", importance: 30 },
    "AED": { name: "UAE Dirham", country: "AE", importance: 60 },
    "SAR": { name: "Saudi Riyal", country: "SA", importance: 58 },
    "QAR": { name: "Qatari Riyal", country: "QA", importance: 55 },
    "KWD": { name: "Kuwaiti Dinar", country: "KW", importance: 57 },
    "BHD": { name: "Bahraini Dinar", country: "BH", importance: 54 },
    "OMR": { name: "Omani Rial", country: "OM", importance: 53 },
    "EGP": { name: "Egyptian Pound", country: "EG", importance: 30 },
    "CLP": { name: "Chilean Peso", country: "CL", importance: 32 },
    "COP": { name: "Colombian Peso", country: "CO", importance: 34 },
    "PEN": { name: "Peruvian Sol", country: "PE", importance: 31 },
    "ARS": { name: "Argentine Peso", country: "AR", importance: 25 },
    "UYU": { name: "Uruguayan Peso", country: "UY", importance: 22 },
    "PYG": { name: "Paraguayan Guarani", country: "PY", importance: 20 },
    "DOP": { name: "Dominican Peso", country: "DO", importance: 24 },
    "GTQ": { name: "Guatemalan Quetzal", country: "GT", importance: 26 },
    "CRC": { name: "Costa Rican Colon", country: "CR", importance: 28 },
    "PAB": { name: "Panamanian Balboa", country: "PA", importance: 29 },
    "SVC": { name: "Salvadoran Colon", country: "SV", importance: 21 },
    "HNL": { name: "Honduran Lempira", country: "HN", importance: 19 },
    "NIO": { name: "Nicaraguan Cordoba", country: "NI", importance: 18 },
    "JMD": { name: "Jamaican Dollar", country: "JM", importance: 23 },
    "TTD": { name: "Trinidad & Tobago Dollar", country: "TT", importance: 27 },
    "XCD": { name: "East Caribbean Dollar", country: "XC", importance: 20 },
    "BBD": { name: "Barbadian Dollar", country: "BB", importance: 22 },
    "BSD": { name: "Bahamian Dollar", country: "BS", importance: 25 },
    "BZD": { name: "Belize Dollar", country: "BZ", importance: 19 },
    "CUP": { name: "Cuban Peso", country: "CU", importance: 15 },
    "DZD": { name: "Algerian Dinar", country: "DZ", importance: 28 },
    "MAD": { name: "Moroccan Dirham", country: "MA", importance: 32 },
    "TND": { name: "Tunisian Dinar", country: "TN", importance: 30 },
    "GHS": { name: "Ghanaian Cedi", country: "GH", importance: 26 },
    "KES": { name: "Kenyan Shilling", country: "KE", importance: 29 },
    "UGX": { name: "Ugandan Shilling", country: "UG", importance: 24 },
    "TZS": { name: "Tanzanian Shilling", country: "TZ", importance: 25 },
    "RWF": { name: "Rwandan Franc", country: "RW", importance: 22 },
    "BIF": { name: "Burundian Franc", country: "BI", importance: 18 },
    "CDF": { name: "Congolese Franc", country: "CD", importance: 19 },
    "XAF": { name: "Central African CFA Franc", country: "XA", importance: 20 },
    "XOF": { name: "West African CFA Franc", country: "XO", importance: 21 },
    "NGN": { name: "Nigerian Naira", country: "NG", importance: 35 },
    "GMD": { name: "Gambian Dalasi", country: "GM", importance: 17 },
    "SLL": { name: "Sierra Leonean Leone", country: "SL", importance: 16 },
    "LRD": { name: "Liberian Dollar", country: "LR", importance: 15 },
    "GWP": { name: "Guinea-Bissau Peso", country: "GW", importance: 14 },
    "CVE": { name: "Cape Verdean Escudo", country: "CV", importance: 19 },
    "AOA": { name: "Angolan Kwanza", country: "AO", importance: 23 },
    "ZMW": { name: "Zambian Kwacha", country: "ZM", importance: 24 },
    "MWK": { name: "Malawian Kwacha", country: "MW", importance: 20 },
    "BWP": { name: "Botswanan Pula", country: "BW", importance: 28 },
    "NAD": { name: "Namibian Dollar", country: "NA", importance: 27 },
    "LSL": { name: "Lesotho Loti", country: "LS", importance: 21 },
    "SZL": { name: "Swazi Lilangeni", country: "SZ", importance: 22 },
    "SCR": { name: "Seychellois Rupee", country: "SC", importance: 26 },
    "MVR": { name: "Maldivian Rufiyaa", country: "MV", importance: 25 },
    "LKR": { name: "Sri Lankan Rupee", country: "LK", importance: 30 },
    "PKR": { name: "Pakistani Rupee", country: "PK", importance: 33 },
    "BDT": { name: "Bangladeshi Taka", country: "BD", importance: 31 },
    "NPR": { name: "Nepalese Rupee", country: "NP", importance: 27 },
    "MNT": { name: "Mongolian Tugrik", country: "MN", importance: 24 },
    "KZT": { name: "Kazakhstani Tenge", country: "KZ", importance: 36 },
    "UZS": { name: "Uzbekistani Som", country: "UZ", importance: 32 },
    "KGS": { name: "Kyrgystani Som", country: "KG", importance: 29 },
    "TJS": { name: "Tajikistani Somoni", country: "TJ", importance: 28 },
    "GEL": { name: "Georgian Lari", country: "GE", importance: 34 },
    "AMD": { name: "Armenian Dram", country: "AM", importance: 31 },
    "AZN": { name: "Azerbaijani Manat", country: "AZ", importance: 35 },
    "BYN": { name: "Belarusian Ruble", country: "BY", importance: 30 },
    "UAH": { name: "Ukrainian Hryvnia", country: "UA", importance: 33 },
    "MDL": { name: "Moldovan Leu", country: "MD", importance: 28 },
    "BGN": { name: "Bulgarian Lev", country: "BG", importance: 37 },
    "RON": { name: "Romanian Leu", country: "RO", importance: 39 },
    "HRK": { name: "Croatian Kuna", country: "HR", importance: 41 },
    "RSD": { name: "Serbian Dinar", country: "RS", importance: 36 },
    "MKD": { name: "Macedonian Denar", country: "MK", importance: 32 },
    "ALL": { name: "Albanian Lek", country: "AL", importance: 30 },
    "BAM": { name: "Bosnia-Herzegovina Convertible Mark", country: "BA", importance: 34 },
    "ISK": { name: "Icelandic Krona", country: "IS", importance: 43 },
    "FJD": { name: "Fijian Dollar", country: "FJ", importance: 29 }
};
// --- Real Data Fetching Functions ---
const fetchRealCryptoData = async (page: number = 1): Promise<CryptoCoin[]> => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d,30d&locale=en`
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
            change1h: coin.price_change_percentage_1h_in_currency ?? 0,
            change24h: coin.price_change_percentage_24h ?? 0,
            change7d: coin.price_change_percentage_7d_in_currency ?? 0,
            change30d: coin.price_change_percentage_30d_in_currency ?? 0,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume,
            rank: coin.market_cap_rank,
            category: "crypto",
            color: getMarketColor(coin.price_change_percentage_24h ?? 0),
            logoUrl: coin.image
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
        const allCurrencies = Object.keys(currencyDetails);
        const currenciesToShow = allCurrencies.map(symbol => ({
            symbol,
            name: currencyDetails[symbol].name,
            country: currencyDetails[symbol].country,
            importance: currencyDetails[symbol].importance
        })).slice(0, 100);
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
                color: getMarketColor(change),
                logoUrl: `https://flagcdn.com/w40/${currency.country.toLowerCase()}.png`
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
        const allCurrencies = Object.keys(currencyDetails);
        const pairsToShow: { base: string; quote: string }[] = [];
        const majorCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"];
        // Generate major pairs (e.g., EUR/USD, GBP/JPY)
        for (let i = 0; i < majorCurrencies.length; i++) {
            for (let j = i + 1; j < majorCurrencies.length; j++) {
                pairsToShow.push({ base: majorCurrencies[i], quote: majorCurrencies[j] });
                pairsToShow.push({ base: majorCurrencies[j], quote: majorCurrencies[i] });
            }
        }
        // Add USD crosses with other major/minor currencies
        allCurrencies.forEach(currency => {
            if (currency !== "USD" && !majorCurrencies.includes(currency)) {
                pairsToShow.push({ base: "USD", quote: currency });
                pairsToShow.push({ base: currency, quote: "USD" });
            }
        });
        // Add EUR crosses
        allCurrencies.forEach(currency => {
            if (currency !== "EUR" && currency !== "USD" && !majorCurrencies.includes(currency)) {
                pairsToShow.push({ base: "EUR", quote: currency });
            }
        });
        // Add GBP crosses
        allCurrencies.forEach(currency => {
            if (currency !== "GBP" && currency !== "USD" && currency !== "EUR" && !majorCurrencies.includes(currency)) {
                pairsToShow.push({ base: "GBP", quote: currency });
            }
        });
        // Limit to 100 pairs to avoid overwhelming the display and API calls
        const uniquePairs = Array.from(new Set(pairsToShow.map(p => `${p.base}/${p.quote}`))).map(s => {
            const [base, quote] = s.split('/');
            return { base, quote };
        });
        const finalPairs = uniquePairs.slice(0, 100);
        const pairData: CryptoCoin[] = [];
        for (const pair of finalPairs) {
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
                    color: getMarketColor(change),
                    baseCountryCode: currencyDetails[pair.base]?.country,
                    quoteCountryCode: currencyDetails[pair.quote]?.country,
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
const fetchHistoricalData = async (coinId: string): Promise<{ time: number; price: number }[] | null> => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`
        );
        if (!response.ok) {
            console.error(`Historical data API error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (!data || !data.prices) {
            console.error('Invalid historical data format received');
            return null;
        }
        return data.prices.map((p: [number, number]) => ({ time: p[0], price: p[1] }));
    } catch (err) {
        console.error("Error fetching historical data ", err);
        return null;
    }
};
// Helper function for market action strength colors
const getMarketColor = (change: number): string => {
    const absChange = Math.abs(change);
    // Define color intensity thresholds
    if (absChange < 0.5) {
        // Sideways/low movement - neutral gray
        return "#9ca3af"; // gray-400
    } else if (absChange >= 5) {
        // Strong movement - bright colors
        return change >= 0 ? "#10b981" : "#f87171"; // emerald-500 / red-400
    } else if (absChange >= 2) {
        // Moderate movement - medium colors
        return change >= 0 ? "#34d399" : "#fca5a5"; // emerald-400 / red-300
    } else {
        // Weak movement - muted colors
        return change >= 0 ? "#6ee7b7" : "#fecaca"; // emerald-300 / red-200
    }
};
const HistoricalChart: React.FC<{ data: { time: number; price: number }[] }> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement | null>(null);
    useEffect(() => {
        if (!chartRef.current || !data || data.length === 0) return;
        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();
        const width = 320;
        const height = 120;
        const margin = { top: 10, right: 15, bottom: 25, left: 45 };
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.time)) as [Date, Date])
            .range([margin.left, width - margin.right]);
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.price) as [number, number])
            .range([height - margin.bottom, margin.top]);
        const line = d3.line<{ time: number; price: number }>()
            .x(d => x(new Date(d.time)))
            .y(d => y(d.price))
            .curve(d3.curveMonotoneX);
        const area = d3.area<{ time: number; price: number }>()
            .x(d => x(new Date(d.time)))
            .y0(height - margin.bottom)
            .y1(d => y(d.price))
            .curve(d3.curveMonotoneX);
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "price-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(d3.min(data, d => d.price) as number))
            .attr("x2", 0).attr("y2", y(d3.max(data, d => d.price) as number));
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#38bdf8").attr("stop-opacity", 0.4);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#38bdf8").attr("stop-opacity", 0);
        svg.append("path")
            .datum(data)
            .attr("fill", "url(#price-gradient)")
            .attr("d", area);
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#38bdf8")
            .attr("stroke-width", 2)
            .attr("d", line);
        const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            g.attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d") as never).tickSize(0).tickPadding(10));
            g.select(".domain").remove();
            g.selectAll("line").remove();
            g.selectAll("text").style("fill", "#9ca3af").style("font-size", "10px");
        };
        const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            g.attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${Number(d).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`).tickSize(0).tickPadding(10));
            g.select(".domain").remove();
            g.selectAll("line").remove();
            g.selectAll("text").style("fill", "#9ca3af").style("font-size", "10px");
        };
        svg.append("g").call(xAxis);
        svg.append("g").call(yAxis);
        const tooltipGroup = svg.append("g")
            .style("display", "none");
        const tooltipLine = tooltipGroup.append("line")
            .attr("class", "tooltip-line")
            .attr("stroke", "#9ca3af")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom);
        const tooltipCircle = tooltipGroup.append("circle")
            .attr("r", 4)
            .attr("fill", "#38bdf8")
            .attr("stroke", "#1e293b")
            .attr("stroke-width", 2);
        const tooltipTextGroup = tooltipGroup.append("g");
        const tooltipTextBg = tooltipTextGroup.append("rect")
            .attr("fill", "rgba(30, 41, 59, 0.8)")
            .attr("rx", 4)
            .attr("ry", 4)
            .style("backdrop-filter", "blur(4px)");
        const tooltipTextPrice = tooltipTextGroup.append("text")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
        const tooltipTextDate = tooltipTextGroup.append("text")
            .attr("fill", "#9ca3af")
            .attr("font-size", "10px");
        const overlay = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");
        overlay.on("mouseover", () => tooltipGroup.style("display", null))
            .on("mouseout", () => tooltipGroup.style("display", "none"))
            .on("mousemove", (event) => {
                const bisectDate = d3.bisector((d: { time: number; price: number }) => new Date(d.time)).left;
                const x0 = x.invert(d3.pointer(event)[0]);
                const i = bisectDate(data, x0, 1);
                const d0 = data[i - 1];
                const d1 = data[i];
                const d = (d1 && (x0.getTime() - new Date(d0.time).getTime() > new Date(d1.time).getTime() - x0.getTime())) ? d1 : d0;
                const posX = x(new Date(d.time));
                const posY = y(d.price);
                tooltipLine.attr("x1", posX).attr("x2", posX);
                tooltipCircle.attr("cx", posX).attr("cy", posY);
                tooltipTextPrice.text(`$${d.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                tooltipTextDate.text(d3.timeFormat("%b %d, %Y")(new Date(d.time)));
                const priceNode = tooltipTextPrice.node();
                const dateNode = tooltipTextDate.node();
                if (priceNode && dateNode) {
                    const priceBBox = priceNode.getBBox();
                    const dateBBox = dateNode.getBBox();
                    const textWidth = Math.max(priceBBox.width, dateBBox.width);
                    const textHeight = priceBBox.height + dateBBox.height;
                    tooltipTextBg
                        .attr("width", textWidth + 16)
                        .attr("height", textHeight + 12);
                    let textX = posX + 15;
                    if (textX + textWidth + 16 > width) {
                        textX = posX - textWidth - 31;
                    }
                    let textY = posY - (textHeight / 2);
                    if (textY < margin.top) textY = margin.top;
                    if (textY + textHeight + 12 > height - margin.bottom) textY = height - margin.bottom - textHeight - 12;
                    tooltipTextGroup.attr("transform", `translate(${textX}, ${textY})`);
                    tooltipTextBg.attr("x", 0).attr("y", 0);
                    tooltipTextPrice.attr("x", 8).attr("y", 14);
                    tooltipTextDate.attr("x", 8).attr("y", 28);
                }
            });
    }, [data]);
    return (
        <div className="mt-4 relative">
            <h3 className="text-sm font-bold text-gray-300 mb-2">Price (Last 30 Days)</h3>
            <svg ref={chartRef} viewBox={`0 0 320 120`}></svg>
        </div>
    );
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
    const [historicalData, setHistoricalData] = useState<{ time: number; price: number }[] | null>(null);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
    const [marketData, setMarketData] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<string>('24h');
    const [marketCapGroup, setMarketCapGroup] = useState<number>(1);
    const [sizeBy, setSizeBy] = useState<'marketCap' | 'volume24h'>('marketCap');
    const getChangeForTimeframe = (coin: CryptoCoin, tf: string): number => {
        switch (tf) {
            case '1h':
                return coin.change1h ?? 0;
            case '7d':
                return coin.change7d ?? 0;
            case '30d':
                return coin.change30d ?? 0;
            case '24h':
            default:
                return coin.change24h ?? 0;
        }
    };
    useEffect(() => {
        const fetchData = async (showLoading: boolean) => {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);
            try {
                let data: CryptoCoin[];
                switch (selectedCategory) {
                    case "crypto":
                        data = await fetchRealCryptoData(marketCapGroup);
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
                if (showLoading) {
                    setLoading(false);
                }
            }
        };
        void fetchData(true);
        const interval = setInterval(() => {
            void fetchData(false);
        }, 30000);
        return () => clearInterval(interval);
    }, [searchTerm, selectedCategory, marketCapGroup]);
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
        const sizeMetric = sizeBy === 'volume24h' ? 'volume24h' : 'marketCap';
        const maxValue = d3.max(marketData, (d) => d[sizeMetric as keyof CryptoCoin] as number) ?? 1;
        const minValue = d3.min(marketData, (d) => d[sizeMetric as keyof CryptoCoin] as number) ?? 0;
        const radiusScale = d3.scalePow()
            .exponent(0.85)
            .domain([minValue, maxValue])
            .range([30, Math.min(width, height) * 0.22]);
        const bubbleData: CryptoCoin[] = marketData.map((d) => {
            const radius = radiusScale((d[sizeMetric as keyof CryptoCoin] as number) ?? 0);
            const margin = Math.max(radius * 1.5, 20);
            return {
                ...d,
                radius: radius,
                x: Math.max(margin, Math.min(width - margin, Math.random() * width)),
                y: Math.max(margin, Math.min(height - margin, Math.random() * height)),
                vx: 0,
                vy: 0,
                fx: null,
                fy: null,
            };
        });
        const simulation = d3
            .forceSimulation<CryptoCoin>(bubbleData)
            .force("charge", d3.forceManyBody().strength(10))
            .force("collision", d3.forceCollide<CryptoCoin>()
                .radius((d) => (d.radius ?? 0) + 10)
                .strength(0.9)
                .iterations(3)
            )
            .force("center", d3.forceCenter(width / 1.5, height / 2).strength(0.02))
            .force("autoMove", autoMoveForce(0.1))
            .force("boundary", boundaryForce(width, height, 20, 0.05));
        simulation
            .alphaDecay(0.02)
            .velocityDecay(0.2)
            .alphaMin(0.001);
        simulationRef.current = simulation;
        const defs = svg.append("defs");
        const addNeon = (id: string, color: string) => {
            const f = defs.append("filter")
                .attr("id", id)
                .attr("x", "-150%")
                .attr("y", "-150%")
                .attr("width", "400%")
                .attr("height", "400%");
            f.append("feDropShadow")
                .attr("dx", "0")
                .attr("dy", "0")
                .attr("stdDeviation", "6")
                .attr("flood-color", color)
                .attr("flood-opacity", "0.9");
        };
        addNeon("neon-green-glow", "#22c55e");
        addNeon("neon-red-glow", "#ef4444");
        const bubbleGroups = svg
            .selectAll<SVGGElement, CryptoCoin>(".bubble-group")
            .data(bubbleData)
            .enter()
            .append("g")
            .attr("class", "bubble-group")
            .style("cursor", "grab");
        bubbleGroups
            .append("circle")
            .attr("class", "bubble-core")
            .attr("r", (d) => d.radius ?? 0)
            .attr("fill", "rgba(0, 0, 0, 0.35)")
            .attr("stroke", (d) => getMarketColor(getChangeForTimeframe(d, timeframe)))
            .attr("stroke-width", (d) => {
                const change = getChangeForTimeframe(d, timeframe);
                return change === 0 ? 3 : 3;
            })
            .style("filter", (d) => {
                const change = getChangeForTimeframe(d, timeframe);
                return change > 0 ? "url(#neon-green-glow)" : change < 0 ? "url(#neon-red-glow)" : "none";
            });
        bubbleGroups
            .append("circle")
            .attr("class", "bubble-rim")
            .attr("r", (d) => (d.radius ?? 0) + 4)
            .attr("fill", "none")
            .attr("stroke", (d) => {
                const change = getChangeForTimeframe(d, timeframe);
                const baseColor = getMarketColor(change);
                return `${baseColor}${change === 0 ? '80' : '99'}`; // Add transparency for neutral
            })
            .attr("stroke-width", (d) => {
                const change = getChangeForTimeframe(d, timeframe);
                return change === 0 ? 2 : 3;
            })
            .style("opacity", (d) => {
                const change = getChangeForTimeframe(d, timeframe);
                return change === 0 ? 0.6 : 0.9;
            });
        bubbleGroups.each(function (d) {
            const group = d3.select<SVGGElement, CryptoCoin>(this);
            const r = d.radius ?? 0;
            if (selectedCategory === 'forex-pair' && d.baseCountryCode && d.quoteCountryCode) {
                const flagSize = Math.min(r * 0.5, 32);
                const yPos = -r * 0.4;
                const baseFlagGroup = group.append("g")
                    .attr("transform", `translate(${-flagSize * 0.6}, ${yPos})`);
                const clipIdBase = `clip-base-${d.id}`;
                baseFlagGroup.append("defs").append("clipPath")
                    .attr("id", clipIdBase)
                    .append("circle")
                    .attr("r", flagSize / 2);
                baseFlagGroup.append("image")
                    .attr("href", `https://flagcdn.com/w40/${d.baseCountryCode.toLowerCase()}.png`)
                    .attr("width", flagSize)
                    .attr("height", flagSize)
                    .attr("x", -flagSize / 2)
                    .attr("y", -flagSize / 2)
                    .attr("clip-path", `url(#${clipIdBase})`)
                    .style("pointer-events", "none");
                const quoteFlagGroup = group.append("g")
                    .attr("transform", `translate(${flagSize * 0.6}, ${yPos})`);
                const clipIdQuote = `clip-quote-${d.id}`;
                quoteFlagGroup.append("defs").append("clipPath")
                    .attr("id", clipIdQuote)
                    .append("circle")
                    .attr("r", flagSize / 2);
                quoteFlagGroup.append("image")
                    .attr("href", `https://flagcdn.com/w40/${d.quoteCountryCode.toLowerCase()}.png`)
                    .attr("width", flagSize)
                    .attr("height", flagSize)
                    .attr("x", -flagSize / 2)
                    .attr("y", -flagSize / 2)
                    .attr("clip-path", `url(#${clipIdQuote})`)
                    .style("pointer-events", "none");
            } else if (d.logoUrl) {
                const imgSize = Math.min(r * 0.7, 52);
                const clipId = `clip-${d.id}`;
                group.append("defs").append("clipPath")
                    .attr("id", clipId)
                    .append("circle")
                    .attr("r", imgSize / 2)
                    .attr("cx", 0)
                    .attr("cy", -r * 0.45);
                group.append("image")
                    .attr("href", d.logoUrl)
                    .attr("width", imgSize)
                    .attr("height", imgSize)
                    .attr("x", -imgSize / 2)
                    .attr("y", -(r * 0.45) - imgSize / 2)
                    .attr("clip-path", `url(#${clipId})`)
                    .style("pointer-events", "none");
            }
        });
        bubbleGroups
            .append("text")
            .attr("class", "symbol-text")
            .attr("text-anchor", "middle")
            .attr("dy", selectedCategory === 'forex-pair' ? "-0.1em" : "0.2em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "900")
            .style("font-size", (d) => `${Math.max(10, Math.min((d.radius ?? 0) * 0.34, 28))}px`) // Ensure minimum size of 10px
            .style("fill", "#e5e7eb")
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
                .attr("dy", selectedCategory === 'forex-pair' ? "0.9em" : "1.0em")
                .style("font-family", "JetBrains Mono, Monaco, Consolas, monospace")
                .style("font-weight", "700")
                .style("font-size", (d) => `${Math.max(8, Math.min((d.radius ?? 0) * 0.16, 12))}px`) // Ensure minimum size of 8px
                .style("fill", "#cbd5e1")
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
            .attr("dy", (selectedCategory === 'forex' || selectedCategory === 'forex-pair') ? "1.8em" : "1.4em")
            .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
            .style("font-weight", "800")
            .style("font-size", (d) => `${Math.max(9, Math.min((d.radius ?? 0) * 0.20, 16))}px`) // Ensure minimum size of 9px
            .style("fill", (d) => getMarketColor(getChangeForTimeframe(d, timeframe)))
            .style("pointer-events", "none")
            .text((d) => {
                const change = getChangeForTimeframe(d, timeframe);
                return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
            });
        const drag = d3
            .drag<SVGGElement, CryptoCoin>()
            .on("start", function (event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
                const group = d3.select(this);
                group.style("cursor", "grabbing");
                group.select(".bubble-core").transition().duration(350).ease(d3.easeCubicOut).attr("r", ((d.radius ?? 0) * 1.08)).attr("stroke-width", 4);
                group.select(".bubble-rim").transition().duration(350).ease(d3.easeCubicOut).attr("r", ((d.radius ?? 0) + 8)).style("opacity", 1);
            })
            .on("drag", function (event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", function (event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
                const group = d3.select(this);
                group.style("cursor", "grab");
                group.select(".bubble-core").transition().duration(500).ease(d3.easeCubicInOut).attr("r", d.radius ?? 0).attr("stroke-width", 3);
                group.select(".bubble-rim").transition().duration(500).ease(d3.easeCubicInOut).attr("r", ((d.radius ?? 0) + 4)).style("opacity", 0.9);
            });
        bubbleGroups.each(function () {
            d3.select<SVGGElement, CryptoCoin>(this).call(drag);
        });
        bubbleGroups
            .on("mouseenter", function (_event, d) {
                const group = d3.select(this);
                const radius = d.radius ?? 0;
                const change = getChangeForTimeframe(d, timeframe);
                const filterId = change > 0 ? "url(#neon-green-glow)" : change < 0 ? "url(#neon-red-glow)" : "none";
                group.select(".bubble-core")
                    .transition().duration(200)
                    .attr("stroke-width", change === 0 ? 3 : 4)
                    .style("filter", filterId);
                group.select(".bubble-rim")
                    .transition().duration(200)
                    .style("opacity", change === 0 ? 0.7 : 1)
                    .attr("r", radius + 8)
                    .attr("stroke-width", change === 0 ? 2 : 4);
                group.selectAll("text")
                    .transition().duration(200)
                    .style("filter", change === 0 ? "none" : "drop-shadow(0 0 8px currentColor)");
            })
            .on("mouseleave", function (_event, d) {
                const group = d3.select(this);
                const radius = d.radius ?? 0;
                const change = getChangeForTimeframe(d, timeframe);
                const filterIdLeave = change > 0 ? "url(#neon-green-glow)" : change < 0 ? "url(#neon-red-glow)" : "none";
                group.select(".bubble-core")
                    .transition().duration(300)
                    .attr("stroke-width", change === 0 ? 3 : 3)
                    .style("filter", filterIdLeave);
                group.select(".bubble-rim")
                    .transition().duration(300)
                    .style("opacity", change === 0 ? 0.6 : 0.9)
                    .attr("r", radius + 4)
                    .attr("stroke-width", change === 0 ? 2 : 3);
                group.selectAll("text")
                    .transition().duration(300)
                    .style("filter", "none");
            })
            .on("click", function (_event, d) {
                setSelectedBubble(d);
                const group = d3.select(this);
                const radius = d.radius ?? 0;
                const change = getChangeForTimeframe(d, timeframe);
                const strokeColor = getMarketColor(change);
                const clickRipple = group.append("circle")
                    .attr("r", 0)
                    .attr("fill", "none")
                    .attr("stroke", strokeColor)
                    .attr("stroke-width", change === 0 ? 2 : 4)
                    .style("opacity", 1);
                clickRipple
                    .transition().duration(800).ease(d3.easeCircleOut)
                    .attr("r", radius + 40)
                    .style("opacity", 0)
                    .style("stroke-width", change === 0 ? 1 : 1)
                    .remove();
                group.select(".bubble-core")
                    .transition().duration(150)
                    .attr("stroke-width", change === 0 ? 4 : 5)
                    .transition().duration(150)
                    .attr("stroke-width", change === 0 ? 3 : 3);
            });
        simulation.on("tick", () => {
            bubbleGroups.attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`);
        });
        const shimmerTimer = d3.timer(() => { });
        return () => {
            if (simulation) simulation.stop();
            if (simulationRef.current) {
                simulationRef.current.stop();
                simulationRef.current = null;
            }
            shimmerTimer.stop();
        };
    }, [marketData, dimensions, loading, error, selectedCategory, timeframe, sizeBy]);
    useEffect(() => {
        if (selectedBubble && selectedBubble.category === 'crypto') {
            const getHistoricalData = async () => {
                setIsChartLoading(true);
                setHistoricalData(null);
                const data = await fetchHistoricalData(selectedBubble.id);
                setHistoricalData(data);
                setIsChartLoading(false);
            };
            void getHistoricalData();
        } else {
            setHistoricalData(null);
        }
    }, [selectedBubble]);
    function autoMoveForce(strength = 0.05) {
        let nodes: CryptoCoin[];
        function force(alpha: number) {
            const time = Date.now() * 0.001;
            nodes.forEach((d, i) => {
                const phaseOffset = i * 0.1;
                const dx = Math.sin(time * 0.3 + phaseOffset) * strength;
                const dy = Math.cos(time * 0.4 + phaseOffset * 0.7) * strength;
                if (d.fx == null) d.vx = (d.vx || 0) + dx * alpha * 10;
                if (d.fy == null) d.vy = (d.vy || 0) + dy * alpha * 10;
            });
        }
        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }
    function boundaryForce(width: number, height: number, padding: number, strength: number) {
        let nodes: CryptoCoin[];
        function force(alpha: number) {
            nodes.forEach(d => {
                const r = (d.radius ?? 0) + padding;
                let fx = 0, fy = 0;
                if (d.x !== undefined && d.x < r) fx += (r - d.x) * strength * alpha;
                if (d.x !== undefined && d.x > width - r) fx -= (d.x - width + r) * strength * alpha;
                if (d.y !== undefined && d.y < r) fy += (r - d.y) * strength * alpha;
                if (d.y !== undefined && d.y > height - r) fy -= (d.y - height + r) * strength * alpha;
                if (d.fx == null && fx !== 0) d.vx = (d.vx || 0) + fx;
                if (d.fy == null && fy !== 0) d.vy = (d.vy || 0) + fy;
            });
        }
        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedBubble(null);
    };
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };
    const getCurrentTimeUTC = () => {
        const now = new Date();
        return now.toUTCString();
    };
    const selectedBubbleChange = selectedBubble ? getChangeForTimeframe(selectedBubble, timeframe) : 0;
    return (
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50">
            <Header
                title="CRYPTO BUBBLES"
                subtitle="Live Market Visualization"
                onCategoryChange={handleCategoryChange}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                showCategories={true}
                showSearch={true}
                showControls={true}
                timeframe={timeframe}
                marketCapGroup={marketCapGroup}
                sizeBy={sizeBy}
                onTimeframeChange={setTimeframe}
                onMarketCapGroupChange={setMarketCapGroup}
                onSizeByChange={setSizeBy}
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
                    <div className="relative w-screen h-screen">
                        <svg
                            ref={svgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="absolute top-0 left-0 w-screen h-screen"
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
                                â  ¡ LIGHTNING-FAST Glass Bubbles
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
                    </div>
                )}
            </div>
            {selectedBubble && (
                <div className="fixed bottom-8 right-8 bg-gray-800/95 backdrop-blur-lg border border-gray-700/40 rounded-3xl shadow-2xl max-w-md z-50 p-6 flex flex-col gap-4 animate-in slide-in-from-right">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            {selectedBubble.logoUrl && (
                                <Image src={selectedBubble.logoUrl} alt={selectedBubble.symbol} width={40} height={40} className="rounded-full border border-gray-700/60 bg-gray-900/60" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    {selectedBubble.category === 'forex-pair' && selectedBubble.baseCountryCode && selectedBubble.quoteCountryCode && (
                                        <>
                                            <Image
                                                src={`https://flagcdn.com/w40/${selectedBubble.baseCountryCode.toLowerCase()}.png`}
                                                alt={selectedBubble.baseCountryCode}
                                                width={48}
                                                height={36}
                                            />
                                            <Image
                                                src={`https://flagcdn.com/w40/${selectedBubble.quoteCountryCode.toLowerCase()}.png`}
                                                alt={selectedBubble.quoteCountryCode}
                                                width={48}
                                                height={36}
                                            />
                                        </>
                                    )}
                                    <span className="text-white text-xl font-bold">{selectedBubble.name}</span>
                                    {selectedBubble.category && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${selectedBubble.category === 'crypto' ? 'bg-blue-700/20 text-blue-300 border-blue-700/40' :
                                            selectedBubble.category === 'major' ? 'bg-green-700/20 text-green-300 border-green-700/40' :
                                                selectedBubble.category === 'minor' ? 'bg-blue-700/20 text-blue-300 border-blue-700/40' :
                                                    selectedBubble.category === 'forex-pair' ? 'bg-yellow-700/20 text-yellow-300 border-yellow-700/40' :
                                                        'bg-purple-700/20 text-purple-300 border-purple-700/40'
                                        }`}>{selectedBubble.category.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="text-gray-400 text-sm font-mono">{selectedBubble.symbol}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedBubble(null)}
                            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                        >
                            â
                        </button>
                    </div>
                    {selectedCategory === 'crypto' ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 text-center py-2">
                                <div>
                                    <div className="text-xs text-gray-400">Rank</div>
                                    <div className="text-lg font-bold text-yellow-400">{selectedBubble.rank ? `#${selectedBubble.rank}` : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Market Cap</div>
                                    <div className="text-lg font-bold text-blue-300">${(selectedBubble.marketCap / 1e9).toFixed(1)}B</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">24h Volume</div>
                                    <div className="text-lg font-bold text-green-300">{selectedBubble.volume24h ? `$${(selectedBubble.volume24h / 1e9).toFixed(1)}B` : '-'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 justify-between py-2 border-t border-gray-700/40">
                                <span className="text-gray-400 text-sm">Change ({timeframe.toUpperCase()}):</span>
                                <span className={`font-bold text-lg flex items-center gap-2 ${selectedBubbleChange > 0 ? "text-emerald-400" : selectedBubbleChange < 0 ? "text-red-400" : "text-gray-400"}`}>
                                    {selectedBubbleChange > 0 ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M4 12L8.5 7.5L12 11L16 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="16" cy="6" r="2" fill="#10b981" />
                                        </svg>
                                    ) : selectedBubbleChange < 0 ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M4 8L8.5 12.5L12 9L16 14" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="16" cy="14" r="2" fill="#f87171" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <line x1="4" y1="10" x2="16" y2="10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    )}
                                    {selectedBubbleChange > 0 ? '+' : ''}{selectedBubbleChange.toFixed(2)}%
                                </span>
                            </div>
                            {isChartLoading && (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                                </div>
                            )}
                            {!isChartLoading && historicalData && (
                                <HistoricalChart data={historicalData} />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 py-2">
                            <div className="flex items-center gap-2 justify-between">
                                <span className="text-gray-400 text-sm">Current Rate:</span>
                                <span className="text-white font-mono text-lg font-bold">{selectedBubble.currentRate?.toFixed(4) || 'N/A'}</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 text-center p-2 rounded-lg border border-green-700/40 bg-green-900/20">
                                    <div className="text-xs text-green-400 font-bold">BID</div>
                                    <div className="text-green-300 font-mono text-lg font-bold">{selectedBubble.bid?.toFixed(4) || '-'}</div>
                                </div>
                                <div className="flex-1 text-center p-2 rounded-lg border border-red-700/40 bg-red-900/20">
                                    <div className="text-xs text-red-400 font-bold">ASK</div>
                                    <div className="text-red-300 font-mono text-lg font-bold">{selectedBubble.ask?.toFixed(4) || '-'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 justify-between">
                                <span className="text-gray-400 text-sm">Spread:</span>
                                <span className="text-white font-mono font-bold">{selectedBubble.spread !== undefined ? `${(selectedBubble.spread * 10000).toFixed(1)} pips` : '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-between">
                                <span className="text-gray-400 text-sm">Volume 24h:</span>
                                <span className="text-white font-mono font-bold">{selectedBubble.volume24h !== undefined ? `$${(selectedBubble.volume24h / 1e9).toFixed(1)}B` : '-'}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default CryptoBubblesUI;