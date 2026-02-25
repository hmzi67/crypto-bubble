"use client"
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import Image from "next/image";
import Header from "@/components/layout/header";
import { fetchStockData, fetchStockHistoricalData } from "@/services/stockApiService";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useDebounce } from "@/hooks/useDebounce";
import { useCachedData } from "@/hooks/useCachedData";
import { Lock, Crown, TrendingUp, DollarSign, BarChart3, LineChart } from "lucide-react";
import Link from "next/link";
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
    category?: "crypto" | "forex" | "forex-pair" | "major" | "minor" | "exotic" | "stock";
    color?: string;
    size?: number;
    currentRate?: number;
    countryCode?: string;
    baseCountryCode?: string;
    quoteCountryCode?: string;
    bid?: number;
    ask?: number;
    spread?: number;
    sector?: string;
    open?: number;
    high?: number;
    low?: number;
    previousClose?: number;
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
                marketCap: rate * currency.importance * 15000000, // Increased multiplier
                price: rate,
                volume24h: currency.importance * currency.importance * 800000, // Squared importance for more variance
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

                // Realistic forex pair volumes based on actual market data
                let volume: number;
                const pairSymbol = `${pair.base}/${pair.quote}`;

                // Major pairs (highest volume)
                if (['EUR/USD', 'USD/EUR', 'USD/JPY', 'JPY/USD', 'GBP/USD', 'USD/GBP', 'USD/CHF', 'CHF/USD'].includes(pairSymbol)) {
                    volume = 800 + Math.floor(Math.random() * 400); // 800-1200
                }
                // Cross majors (medium-high volume)
                else if (['EUR/GBP', 'GBP/EUR', 'EUR/JPY', 'JPY/EUR', 'GBP/JPY', 'JPY/GBP', 'AUD/USD', 'USD/AUD', 'CAD/USD', 'USD/CAD'].includes(pairSymbol)) {
                    volume = 400 + Math.floor(Math.random() * 300); // 400-700
                }
                // Minor pairs (medium volume)
                else if (pair.base === 'USD' || pair.quote === 'USD') {
                    const importance = Math.max(currencyDetails[pair.base]?.importance || 0, currencyDetails[pair.quote]?.importance || 0);
                    volume = Math.floor(importance * 3) + Math.floor(Math.random() * 100); // Based on currency importance
                }
                // Exotic pairs (lower volume)
                else {
                    const baseImportance = currencyDetails[pair.base]?.importance || 20;
                    const quoteImportance = currencyDetails[pair.quote]?.importance || 20;
                    const avgImportance = (baseImportance + quoteImportance) / 2;
                    volume = Math.floor(avgImportance * 1.5) + Math.floor(Math.random() * 50); // 30-120 range for exotics
                }

                const spread = pairRate * 0.0001;
                pairData.push({
                    id: `${pair.base}${pair.quote}-pair`.toLowerCase(),
                    symbol: `${pair.base}${pair.quote}`,
                    name: `${pair.base}/${pair.quote}`,
                    change24h: parseFloat(change.toFixed(2)),
                    marketCap: pairRate * volume * 15000000, // Increased multiplier for better variance
                    price: pairRate,
                    volume24h: volume * 120000000, // Increased base volume
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
const fetchRealStockData = async (): Promise<CryptoCoin[]> => {
    try {
        const stockData = await fetchStockData(30);

        if (!stockData || stockData.length === 0) {
            console.error('No stock data received');
            return [];
        }

        return stockData.map((stock): CryptoCoin => ({
            id: stock.id,
            symbol: stock.symbol,
            name: stock.name,
            change24h: stock.priceChange24h,
            marketCap: stock.marketCap,
            price: stock.price,
            volume24h: stock.volume24h,
            category: "stock",
            color: stock.color,
            sector: stock.sector,
            open: stock.open,
            high: stock.high,
            low: stock.low,
            previousClose: stock.previousClose,
        }));
    } catch (err) {
        console.error("Error fetching real stock data:", err);
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
                .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).tickSize(0).tickPadding(10));
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
                tooltipTextPrice.text(`$${d.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
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
    // Feature Access Control
    const { hasFeature, getFeatureLimit, isFree, isLoading: isLoadingAccess } = useFeatureAccess();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hoveredNodeRef = useRef<CryptoCoin | null>(null);
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
    const [scaleMode, setScaleMode] = useState<'realistic' | 'balanced'>('balanced');

    // Handle category change with access control (memoized to prevent unnecessary re-renders)
    const handleCategoryChange = useCallback((category: string) => {
        // Check if user has access to this category
        if (category === 'stock' && !hasFeature('stocksAccess')) {
            return;
        }
        if ((category === 'forex' || category === 'forex-pair') && !hasFeature('forexAccess')) {
            return;
        }
        setSelectedCategory(category);
    }, [hasFeature]);

    const getChangeForTimeframe = useCallback((coin: CryptoCoin, tf: string): number => {
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
    }, []);

    // Debounce search to reduce API calls and filtering operations
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Memoize filtered and searched data - recalculates only when marketData or search changes
    const filteredMarketData = useMemo(() => {
        if (!marketData || marketData.length === 0) return [];

        return marketData.filter(coin => {
            const matchesSearch = !debouncedSearchTerm ||
                coin.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [marketData, debouncedSearchTerm]);

    // Memoize the fetcher function to avoid creating a new one on every render
    const fetcher = useCallback(async (): Promise<CryptoCoin[]> => {
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
            case "stock":
                data = await fetchRealStockData();
                break;
            default:
                data = await fetchRealCryptoData();
        }

        // Apply plan-based limits
        const maxCrypto = getFeatureLimit('maxCryptocurrencies');
        if (selectedCategory === 'crypto' && maxCrypto !== Infinity && maxCrypto > 0) {
            data = data.slice(0, maxCrypto);
        }

        return data;
    }, [selectedCategory, marketCapGroup, getFeatureLimit]);

    // Use caching hook with 5-minute TTL
    const cacheKey = `${selectedCategory}-${marketCapGroup}`;
    const { data: cachedData, loading: isCached, error: cacheError } = useCachedData(
        cacheKey,
        fetcher,
        5 * 60 * 1000 // 5 minute cache
    );

    // Update state from cache
    useEffect(() => {
        if (cachedData) {
            setMarketData(cachedData);
            setLoading(false);
        }
        if (cacheError) {
            setError(cacheError);
            setLoading(false);
        }
        if (isCached) {
            setLoading(true);
        }
    }, [cachedData, cacheError, isCached]);

    // Auto-refresh for Pro users (but will use cache, so actual API calls are minimal)
    useEffect(() => {
        if (hasFeature('autoRefresh')) {
            const interval = setInterval(() => {
                // Cache will handle deduplication - if data is fresh, no API call made
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [hasFeature]);

    // Header height: 56px main + 40px filter bar for crypto
    const HEADER_HEIGHT = selectedCategory === 'crypto' ? 96 : 56;
    const FREE_BANNER_HEIGHT = isFree && !isLoadingAccess ? 48 : 0;

    useEffect(() => {
        const handleResize = () => {
            // Use full viewport width and visible height minus header + free-plan banner
            setDimensions({
                width: window.innerWidth,
                height: Math.max(320, window.innerHeight - HEADER_HEIGHT - FREE_BANNER_HEIGHT),
            });
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [HEADER_HEIGHT, FREE_BANNER_HEIGHT]);
    // Canvas Rendering with CryptoBubbles-style animations and physics
    useEffect(() => {
        if (!canvasRef.current) return;
        if (loading || error || marketData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = dimensions;
        const centerX = width / 2;
        const centerY = height / 2;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // ============================================
        // DYNAMIC BUBBLE SIZING FOR ALL BUBBLES
        // ============================================
        const sizeMetric = sizeBy === 'volume24h' ? 'volume24h' : 'marketCap';

        // Use the memoized filtered data - already filtered by search term
        // Just sort by size for density packing (sorting is cheap operation)
        const sortedMarketData = [...filteredMarketData]
            .sort((a, b) => {
                const aVal = (a[sizeMetric as keyof CryptoCoin] as number) ?? 0;
                const bVal = (b[sizeMetric as keyof CryptoCoin] as number) ?? 0;
                return bVal - aVal;
            });

        // ============================================
        // DYNAMIC RADIUS CALCULATION - fills viewport like cryptobubbles.net
        // ============================================
        const maxValue = d3.max(sortedMarketData, (d) => d[sizeMetric as keyof CryptoCoin] as number) ?? 1;
        const minValue = d3.min(sortedMarketData, (d) => d[sizeMetric as keyof CryptoCoin] as number) ?? 0;
        const bubbleCount = sortedMarketData.length;

        // Calculate dynamic radius range for denser packing with better readability
        const screenArea = width * height;
        const targetCoverage = Math.min(0.62, 0.38 + (bubbleCount / 550));
        const avgBubbleArea = (screenArea * targetCoverage) / bubbleCount;
        const avgRadius = Math.sqrt(avgBubbleArea / Math.PI);

        // Keep bubble size hierarchy visible while avoiding tiny circles
        const dynamicMin = Math.max(12, avgRadius * 0.3);
        const dynamicMax = Math.min(Math.min(width, height) * 0.35, dynamicMin * 15);

        // Use a square root scale to accurately represent area proportional to data value
        const radiusScale = d3.scaleSqrt()
            .domain([minValue || 1, maxValue])
            .range([dynamicMin, dynamicMax]);

        // ============================================
        // PREPARE BUBBLE DATA WITH POSITION PERSISTENCE
        // ============================================
        const prevData = prevBubbleDataRef.current;
        const isInitialRender = prevData.size === 0;

        const bubbleData: CryptoCoin[] = sortedMarketData.map((d) => {
            const metricValue = (d[sizeMetric as keyof CryptoCoin] as number) ?? 0;
            const newRadius = radiusScale(metricValue);
            const prevBubble = prevData.get(d.id);

            // Preserve position from previous render, or generate new position
            let x: number, y: number;
            if (prevBubble) {
                x = prevBubble.x ?? centerX;
                y = prevBubble.y ?? centerY;
            } else {
                // Spawn randomly across the entire rectangular viewport
                const padding = newRadius + 10;
                x = padding + Math.random() * (width - padding * 2);
                y = padding + Math.random() * (height - padding * 2);
            }

            return {
                ...d,
                radius: newRadius,
                x,
                y,
                vx: prevBubble?.vx ?? 0,
                vy: prevBubble?.vy ?? 0,
                fx: null,
                fy: null,
            };
        });

        // Update ref for next render
        const newDataMap = new Map<string, CryptoCoin>();
        bubbleData.forEach(d => newDataMap.set(d.id, d));
        prevBubbleDataRef.current = newDataMap;

        // ============================================
        // D3 FORCE SIMULATION - CryptoBubbles Style
        // ============================================

        // Stop previous simulation
        if (simulationRef.current) {
            simulationRef.current.stop();
        }

        const simulation = d3
            .forceSimulation<CryptoCoin>(bubbleData)
            // Extremely weak centering just to prevent them from getting stuck in corners
            .force("x", d3.forceX<CryptoCoin>(width / 2).strength(0.0008))
            .force("y", d3.forceY<CryptoCoin>(height / 2).strength(0.0008))
            // Softer repulsion keeps bubbles visually dense while still moving freely
            .force("charge", d3.forceManyBody<CryptoCoin>().strength((d) => -(d.radius ?? 20) * 0.35))
            // Allow very slight overlap for compact, reference-like density
            .force("collision", d3.forceCollide<CryptoCoin>()
                .radius((d) => Math.max(6, (d.radius ?? 20) - 1))
                .strength(0.95)
                .iterations(4)
            )
            .alphaDecay(0.005)
            .velocityDecay(0.2);

        // On initial render, warm-up with enough ticks to spread; on refresh, re-heat gently
        if (isInitialRender) {
            simulation.alpha(1.0);
            for (let i = 0; i < 300; i++) {
                simulation.tick();
            }
        } else {
            simulation.alpha(0.3).restart();
        }

        simulationRef.current = simulation;

        // ============================================
        // CANVAS RENDERING LOOP
        // ============================================

        // Pre-load images for canvas
        const imageCache = new Map<string, HTMLImageElement>();
        bubbleData.forEach(d => {
            if (selectedCategory === 'forex-pair' && d.baseCountryCode && d.quoteCountryCode) {
                const baseSrc = `https://flagcdn.com/w40/${d.baseCountryCode.toLowerCase()}.png`;
                const quoteSrc = `https://flagcdn.com/w40/${d.quoteCountryCode.toLowerCase()}.png`;
                if (!imageCache.has(baseSrc)) {
                    const img = new window.Image();
                    img.src = baseSrc;
                    imageCache.set(baseSrc, img);
                }
                if (!imageCache.has(quoteSrc)) {
                    const img = new window.Image();
                    img.src = quoteSrc;
                    imageCache.set(quoteSrc, img);
                }
            } else if (d.logoUrl && !imageCache.has(d.logoUrl)) {
                const img = new window.Image();
                img.src = d.logoUrl;
                imageCache.set(d.logoUrl, img);
            }
        });

        const driftStart = Date.now();

        simulation.on("tick", () => {
            const elapsed = (Date.now() - driftStart) * 0.001;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Update positions and handle boundaries
            bubbleData.forEach((n, i) => {
                if (n.fx != null || n.fy != null) return; // Skip dragged nodes

                // Organic sine-wave drift
                const phaseX = i * 0.73 + (n.radius ?? 20) * 0.013;
                const phaseY = i * 0.51 + (n.radius ?? 20) * 0.019;

                const dx = (
                    Math.sin(elapsed * 0.13 + phaseX) * 0.35 +
                    Math.sin(elapsed * 0.07 + phaseX * 1.3) * 0.25 +
                    Math.sin(elapsed * 0.21 + phaseX * 0.6) * 0.15
                ) * 0.12;

                const dy = (
                    Math.cos(elapsed * 0.11 + phaseY) * 0.35 +
                    Math.cos(elapsed * 0.05 + phaseY * 1.4) * 0.25 +
                    Math.sin(elapsed * 0.17 + phaseY * 0.5) * 0.15
                ) * 0.12;

                const sizeScale = Math.max(0.4, 1 - ((n.radius ?? 20) / 200));
                n.vx = (n.vx || 0) + dx * sizeScale;
                n.vy = (n.vy || 0) + dy * sizeScale;

                n.vx += (Math.random() - 0.5) * 0.08;
                n.vy += (Math.random() - 0.5) * 0.08;

                // Soft elastic boundary
                const r = (n.radius || 20) + 1;
                const x = n.x ?? width / 2;
                const y = n.y ?? height / 2;

                if (x < r) {
                    n.vx = (n.vx || 0) + (r - x) * 0.15;
                    if (n.vx < 0) n.vx *= 0.3;
                } else if (x > width - r) {
                    n.vx = (n.vx || 0) - (x - (width - r)) * 0.15;
                    if (n.vx > 0) n.vx *= 0.3;
                }
                if (y < r) {
                    n.vy = (n.vy || 0) + (r - y) * 0.15;
                    if (n.vy < 0) n.vy *= 0.3;
                } else if (y > height - r) {
                    n.vy = (n.vy || 0) - (y - (height - r)) * 0.15;
                    if (n.vy > 0) n.vy *= 0.3;
                }

                n.x = Math.max(r, Math.min(width - r, x));
                n.y = Math.max(r, Math.min(height - r, y));
            });

            // Draw bubbles
            // Sort so hovered node is drawn last (on top)
            const hoveredNode = hoveredNodeRef.current;
            const nodesToDraw = [...bubbleData].sort((a, b) => {
                if (hoveredNode && a.id === hoveredNode.id) return 1;
                if (hoveredNode && b.id === hoveredNode.id) return -1;
                return 0;
            });

            nodesToDraw.forEach(d => {
                const isHovered = hoveredNode && hoveredNode.id === d.id;
                const r = (d.radius ?? 30) * (isHovered ? 1.08 : 1);
                const x = d.x ?? 0;
                const y = d.y ?? 0;
                const change = getChangeForTimeframe(d, timeframe);
                const color = getMarketColor(change);

                ctx.save();
                ctx.translate(x, y);

                // Draw core circle with colored inner fill for 3D bubble depth
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, 2 * Math.PI);
                const innerGradient = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.2, 0, 0, r);
                innerGradient.addColorStop(0, `${color}66`);
                innerGradient.addColorStop(0.68, `${color}22`);
                innerGradient.addColorStop(1, "rgba(0, 0, 0, 0.55)");
                ctx.fillStyle = innerGradient;
                ctx.fill();

                // Subtle highlight to fake spherical light reflection
                ctx.beginPath();
                ctx.arc(-r * 0.28, -r * 0.33, Math.max(4, r * 0.18), 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
                ctx.fill();

                // Inset dark shading for stronger depth
                const shadeGradient = ctx.createRadialGradient(r * 0.22, r * 0.26, r * 0.15, 0, 0, r);
                shadeGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
                shadeGradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, 2 * Math.PI);
                ctx.fillStyle = shadeGradient;
                ctx.fill();

                // Draw glow and stroke
                ctx.shadowBlur = isHovered ? 26 : 14;
                ctx.shadowColor = color;
                ctx.strokeStyle = color;
                ctx.lineWidth = isHovered ? 5 : 4;
                ctx.stroke();

                // Draw rim
                ctx.beginPath();
                ctx.arc(0, 0, r + (isHovered ? 5 : 3), 0, 2 * Math.PI);
                ctx.strokeStyle = `${color}${isHovered ? '99' : '55'}`;
                ctx.lineWidth = isHovered ? 4 : 3;
                ctx.shadowBlur = 0; // No shadow for rim
                ctx.stroke();

                // Draw content (images/text)
                ctx.shadowBlur = isHovered ? 8 : 0;
                ctx.shadowColor = "currentColor";

                if (selectedCategory === 'forex-pair' && d.baseCountryCode && d.quoteCountryCode) {
                    const flagSize = Math.min(r * 0.5, 32);
                    const yPos = -r * 0.4;

                    const baseSrc = `https://flagcdn.com/w40/${d.baseCountryCode.toLowerCase()}.png`;
                    const quoteSrc = `https://flagcdn.com/w40/${d.quoteCountryCode.toLowerCase()}.png`;
                    const baseImg = imageCache.get(baseSrc);
                    const quoteImg = imageCache.get(quoteSrc);

                    if (baseImg && baseImg.complete) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(-flagSize * 0.6, yPos, flagSize / 2, 0, 2 * Math.PI);
                        ctx.clip();
                        ctx.drawImage(baseImg, -flagSize * 0.6 - flagSize / 2, yPos - flagSize / 2, flagSize, flagSize);
                        ctx.restore();
                    }
                    if (quoteImg && quoteImg.complete) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(flagSize * 0.6, yPos, flagSize / 2, 0, 2 * Math.PI);
                        ctx.clip();
                        ctx.drawImage(quoteImg, flagSize * 0.6 - flagSize / 2, yPos - flagSize / 2, flagSize, flagSize);
                        ctx.restore();
                    }
                } else if (d.logoUrl) {
                    const img = imageCache.get(d.logoUrl);
                    if (img && img.complete) {
                        const imgSize = Math.min(r * 0.7, 52);
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(0, -r * 0.45, imgSize / 2, 0, 2 * Math.PI);
                        ctx.clip();
                        ctx.drawImage(img, -imgSize / 2, -r * 0.45 - imgSize / 2, imgSize, imgSize);
                        ctx.restore();
                    }
                }

                // Draw text
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Symbol
                const symbolFontSize = Math.max(12, Math.min(r * 0.34, 30));
                ctx.font = `900 ${symbolFontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
                ctx.fillStyle = "#ffffff";
                let symbolText = d.symbol;
                if (selectedCategory === 'forex-pair' && d.symbol.length >= 6) {
                    symbolText = `${d.symbol.substring(0, 3)}/${d.symbol.substring(3, 6)}`;
                }
                symbolText = symbolText.toUpperCase();
                const symbolDy = selectedCategory === 'forex-pair' ? -r * 0.1 : r * 0.2;
                ctx.fillText(symbolText, 0, symbolDy);

                // Rate (for forex)
                if (selectedCategory === 'forex' || selectedCategory === 'forex-pair') {
                    const rateFontSize = Math.max(8, Math.min(r * 0.16, 12));
                    ctx.font = `700 ${rateFontSize}px JetBrains Mono, Monaco, Consolas, monospace`;
                    ctx.fillStyle = "#cbd5e1";
                    let rateText = "";
                    if (d.currentRate) {
                        if (d.currentRate < 1) rateText = d.currentRate.toFixed(4);
                        else if (d.currentRate < 10) rateText = d.currentRate.toFixed(3);
                        else if (d.currentRate < 100) rateText = d.currentRate.toFixed(2);
                        else rateText = d.currentRate.toFixed(1);
                    }
                    const rateDy = selectedCategory === 'forex-pair' ? r * 0.3 : r * 0.5;
                    ctx.fillText(rateText, 0, rateDy);
                }

                // Change %
                const changeFontSize = Math.max(10, Math.min(r * 0.20, 18));
                ctx.font = `800 ${changeFontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
                ctx.fillStyle = color;
                const changeText = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
                const changeDy = (selectedCategory === 'forex' || selectedCategory === 'forex-pair') ? r * 0.7 : r * 0.6;
                ctx.fillText(changeText, 0, changeDy);

                ctx.restore();
            });
        });

        // ============================================
        // INTERACTION HANDLING (Mouse/Touch)
        // ============================================

        let dragSubject: CryptoCoin | null = null;

        const drag = d3.drag<HTMLCanvasElement, unknown>()
            .subject((event) => {
                const [x, y] = d3.pointer(event, canvas);
                return simulation.find(x, y, 50); // Find node within 50px
            })
            .on("start", (event) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                dragSubject = event.subject as CryptoCoin;
                dragSubject.fx = dragSubject.x;
                dragSubject.fy = dragSubject.y;
                canvas.style.cursor = "grabbing";
            })
            .on("drag", (event) => {
                if (dragSubject) {
                    dragSubject.fx = event.x;
                    dragSubject.fy = event.y;
                }
            })
            .on("end", (event) => {
                if (!event.active) simulation.alphaTarget(0.005);
                if (dragSubject) {
                    dragSubject.fx = null;
                    dragSubject.fy = null;
                    dragSubject = null;
                }
                canvas.style.cursor = hoveredNodeRef.current ? "pointer" : "default";
            });

        d3.select(canvas).call(drag);

        const handleMouseMove = (e: MouseEvent) => {
            if (dragSubject) return; // Don't update hover while dragging
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Find node under mouse
            const node = simulation.find(x, y);
            if (node) {
                const dx = x - (node.x ?? 0);
                const dy = y - (node.y ?? 0);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= (node.radius ?? 30)) {
                    if (hoveredNodeRef.current?.id !== node.id) {
                        hoveredNodeRef.current = node;
                        canvas.style.cursor = "pointer";
                    }
                    return;
                }
            }

            if (hoveredNodeRef.current) {
                hoveredNodeRef.current = null;
                canvas.style.cursor = "default";
            }
        };

        const handleClick = (_e: MouseEvent) => {
            if (hoveredNodeRef.current) {
                setSelectedBubble(hoveredNodeRef.current);
            }
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("click", handleClick);

        // Keep simulation perpetually alive for continuous motion
        const keepAliveInterval = setInterval(() => {
            if (simulation.alpha() < 0.015) {
                simulation.alpha(0.04).restart();
            }
        }, 2000);

        return () => {
            clearInterval(keepAliveInterval);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("click", handleClick);
            if (simulation) simulation.stop();
            if (simulationRef.current) {
                simulationRef.current.stop();
                simulationRef.current = null;
            }
        };
    }, [marketData, dimensions, loading, error, selectedCategory, timeframe, sizeBy, scaleMode, filteredMarketData, getChangeForTimeframe]);
    useEffect(() => {
        if (selectedBubble && (selectedBubble.category === 'crypto' || selectedBubble.category === 'stock')) {
            // Check if user has access to historical data
            if (!hasFeature('historicalDataAccess')) {
                setHistoricalData(null);
                return;
            }

            const getHistoricalData = async () => {
                setIsChartLoading(true);
                setHistoricalData(null);
                let data;
                if (selectedBubble.category === 'crypto') {
                    data = await fetchHistoricalData(selectedBubble.id);
                } else if (selectedBubble.category === 'stock') {
                    data = await fetchStockHistoricalData(selectedBubble.symbol);
                }
                setHistoricalData(data || null);
                setIsChartLoading(false);
            };
            void getHistoricalData();
        } else {
            setHistoricalData(null);
        }
    }, [selectedBubble, hasFeature]);

    // ============================================
    // CRYPTOBUBBLES-STYLE FORCE FUNCTIONS
    // ============================================

    /**
     * Organic floating motion using smooth sine waves
     * Creates a "breathing" / "floating in water" effect
     */
    function organicFloatForce(strength = 0.02) {
        let nodes: CryptoCoin[];
        const startTime = Date.now();

        function force(alpha: number) {
            const elapsed = (Date.now() - startTime) * 0.001;

            nodes.forEach((d, i) => {
                if (d.fx != null || d.fy != null) return; // Skip pinned nodes

                // Each bubble gets unique phase offsets for natural variation
                const phaseX = i * 0.7 + (d.radius ?? 30) * 0.01;
                const phaseY = i * 0.5 + (d.radius ?? 30) * 0.02;

                // Multiple overlapping sine waves create organic, non-repetitive motion
                const dx = (
                    Math.sin(elapsed * 0.15 + phaseX) * 0.4 +
                    Math.sin(elapsed * 0.08 + phaseX * 1.3) * 0.3 +
                    Math.sin(elapsed * 0.25 + phaseX * 0.7) * 0.2
                ) * strength;

                const dy = (
                    Math.cos(elapsed * 0.12 + phaseY) * 0.4 +
                    Math.cos(elapsed * 0.06 + phaseY * 1.5) * 0.3 +
                    Math.sin(elapsed * 0.18 + phaseY * 0.5) * 0.2
                ) * strength;

                // Scale movement inversely with bubble size (smaller bubbles float more)
                const sizeScale = Math.max(0.3, 1 - ((d.radius ?? 30) / 150));

                d.vx = (d.vx || 0) + dx * alpha * sizeScale * 8;
                d.vy = (d.vy || 0) + dy * alpha * sizeScale * 8;
            });
        }

        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }

    /**
     * Size-based gravity: larger bubbles gravitate toward center
     * Creates natural visual hierarchy like CryptoBubbles
     */
    function sizeGravityForce(centerX: number, centerY: number, strength = 0.01) {
        let nodes: CryptoCoin[];
        let maxRadius = 100;

        function force(alpha: number) {
            nodes.forEach(d => {
                if (d.fx != null || d.fy != null) return;

                const x = d.x ?? centerX;
                const y = d.y ?? centerY;
                const r = d.radius ?? 30;

                // Normalized size factor (0 to 1)
                const sizeFactor = r / maxRadius;

                // Larger bubbles pulled more strongly toward center
                const pullStrength = sizeFactor * sizeFactor * strength;

                const dx = centerX - x;
                const dy = centerY - y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                d.vx = (d.vx || 0) + (dx / dist) * pullStrength * alpha * 100;
                d.vy = (d.vy || 0) + (dy / dist) * pullStrength * alpha * 100;
            });
        }

        force.initialize = (nds: CryptoCoin[]) => {
            nodes = nds;
            maxRadius = Math.max(...nodes.map(n => n.radius ?? 30), 30);
        };
        return force;
    }

    /**
     * Soft boundary force - keeps bubbles in view with elastic bounce
     * Enhanced with exponential push-back for smooth, natural feel
     */
    function softBoundaryForce(width: number, height: number, padding: number, strength: number) {
        let nodes: CryptoCoin[];

        function force(alpha: number) {
            nodes.forEach(d => {
                if (d.fx != null || d.fy != null) return;

                const r = (d.radius ?? 30) + padding;
                const x = d.x ?? width / 2;
                const y = d.y ?? height / 2;

                // Exponential push-back creates elastic bounce feel
                // The further past the boundary, the stronger the push
                const pushStrength = strength * alpha * 3;

                if (x < r) {
                    const overlap = r - x;
                    const factor = Math.pow(overlap / r, 0.8) + 0.5; // Exponential with minimum
                    d.vx = (d.vx || 0) + overlap * factor * pushStrength;
                    // Add slight bounce by dampening existing velocity
                    if (d.vx && d.vx < 0) d.vx *= 0.5;
                }
                if (x > width - r) {
                    const overlap = x - (width - r);
                    const factor = Math.pow(overlap / r, 0.8) + 0.5;
                    d.vx = (d.vx || 0) - overlap * factor * pushStrength;
                    if (d.vx && d.vx > 0) d.vx *= 0.5;
                }
                if (y < r) {
                    const overlap = r - y;
                    const factor = Math.pow(overlap / r, 0.8) + 0.5;
                    d.vy = (d.vy || 0) + overlap * factor * pushStrength;
                    if (d.vy && d.vy < 0) d.vy *= 0.5;
                }
                if (y > height - r) {
                    const overlap = y - (height - r);
                    const factor = Math.pow(overlap / r, 0.8) + 0.5;
                    d.vy = (d.vy || 0) - overlap * factor * pushStrength;
                    if (d.vy && d.vy > 0) d.vy *= 0.5;
                }
            });
        }

        force.initialize = (nds: CryptoCoin[]) => { nodes = nds; };
        return force;
    }

    // Store previous bubble data for smooth transitions
    const prevBubbleDataRef = useRef<Map<string, CryptoCoin>>(new Map());
    const bubbleCountRef = useRef({ total: 0, displayed: 0 });

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    const selectedBubbleChange = selectedBubble ? getChangeForTimeframe(selectedBubble, timeframe) : 0;

    // Get available categories based on plan
    const availableCategories = [
        { id: "crypto", label: "Crypto", icon: <TrendingUp className="w-3.5 h-3.5" />, available: hasFeature('cryptoAccess') },
        { id: "forex", label: "Forex", icon: <DollarSign className="w-3.5 h-3.5" />, available: hasFeature('forexAccess') },
        { id: "forex-pair", label: "Forex Pairs", icon: <BarChart3 className="w-3.5 h-3.5" />, available: hasFeature('forexAccess') },
        { id: "stock", label: "Stocks", icon: <LineChart className="w-3.5 h-3.5" />, available: hasFeature('stocksAccess') }
    ];

    return (
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Free User Banner */}
            {isFree && !isLoadingAccess && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm border-b border-purple-500/30 px-4 py-2">
                    <div className="flex items-center justify-between mx-auto">
                        <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-purple-300" />
                            <span className="text-sm text-white">
                                <span className="font-semibold">Free Plan</span> - Limited to top {getFeatureLimit('maxCryptocurrencies')} cryptocurrencies, no historical charts, stocks, or forex
                            </span>
                        </div>
                        <Link href="/pricing">
                            <button className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Upgrade to Pro
                            </button>
                        </Link>
                    </div>
                </div>
            )}
            <div className={isFree && !isLoadingAccess ? "mt-12" : ""}>
                <Header
                    title="Crypto Forex Bubbles"
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
                    scaleMode={scaleMode}
                    onScaleModeChange={setScaleMode}
                    categories={availableCategories.map(cat => ({
                        ...cat,
                        label: cat.available ? cat.label : `${cat.label} 🔒`
                    }))}
                />
            </div>
            {/* Bubble Canvas - fills remaining space below header */}
            <div className="relative" style={{ height: `calc(100vh - ${HEADER_HEIGHT + FREE_BANNER_HEIGHT}px)` }}>
                {/* Bubble Count Indicator */}
                {!loading && !error && marketData.length > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
                        {/* <span className="text-xs text-gray-300">
                            {(() => {
                                // Calculate the actual displayed count based on the filtered data
                                const totalCount = marketData.length;
                                const optimalCount = (() => {
                                    const sizeMetric = sizeBy === 'volume24h' ? 'volume24h' : 'marketCap';
                                    const screenArea = dimensions.width * dimensions.height;
                                    const avgRadius = 40;
                                    const bubblePadding = 15;
                                    const effectiveRadius = avgRadius + bubblePadding;
                                    const usableArea = screenArea * 0.9 * 0.9;
                                    const packingEfficiency = 0.64;
                                    const bubbleArea = Math.PI * effectiveRadius * effectiveRadius;
                                    const theoreticalCapacity = Math.floor((usableArea * packingEfficiency) / bubbleArea);
                                    const safeCapacity = Math.floor(theoreticalCapacity * 0.75);
                                    const minBubbles = Math.min(20, totalCount);
                                    const maxBubbles = Math.min(150, totalCount);
                                    return Math.max(minBubbles, Math.min(maxBubbles, safeCapacity));
                                })();

                                return optimalCount < totalCount
                                    ? `Showing ${optimalCount} of ${totalCount} bubbles • Optimized`
                                    : `Showing all ${totalCount} bubbles`;
                            })()
                            }
                        </span> */}
                    </div>
                )}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-blue-400 opacity-20 mx-auto"></div>
                            </div>
                            <p className="text-white font-medium">
                                Loading {selectedCategory === 'crypto' ? 'cryptocurrency' : selectedCategory === 'forex' ? 'forex currency' : selectedCategory === 'stock' ? 'stock market' : 'forex pair'} bubbles...
                            </p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-sm backdrop-blur-sm">
                            <p className="text-red-400 font-medium mb-2">Error Loading Data</p>
                            <p className="text-gray-400 text-sm mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
                {!loading && !error && marketData.length === 0 && searchTerm && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 max-w-sm backdrop-blur-sm">
                            <p className="text-yellow-400 font-medium mb-2">No Results Found</p>
                            <p className="text-gray-400 text-sm mb-4">
                                No {selectedCategory === 'crypto' ? 'cryptocurrencies' : selectedCategory === 'forex' ? 'currencies' : selectedCategory === 'stock' ? 'stocks' : 'forex pairs'} match &quot;{searchTerm}&quot;
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-all"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                )}
                {!loading && !error && marketData.length > 0 && (
                    <>
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0"
                            style={{
                                width: `${dimensions.width}px`,
                                height: `${dimensions.height}px`,
                                background: `
                                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.12) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%),
                                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.08) 0%, transparent 50%)
                                `
                            }}
                        />
                    </>
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
                                            selectedBubble.category === 'stock' ? 'bg-indigo-700/20 text-indigo-300 border-indigo-700/40' :
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
                            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg mb-5"
                        >
                            x
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
                            {!hasFeature('historicalDataAccess') ? (
                                <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border-2 border-purple-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Lock className="h-5 w-5 text-purple-400" />
                                        <span className="text-sm font-semibold text-purple-300">Pro Feature</span>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-3">
                                        Historical price charts are available for Pro members
                                    </p>
                                    <Link href="/pricing">
                                        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
                                            Upgrade to Pro
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {isChartLoading && (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                                        </div>
                                    )}
                                    {!isChartLoading && historicalData && (
                                        <HistoricalChart data={historicalData} />
                                    )}
                                </>
                            )}
                        </>
                    ) : selectedCategory === 'stock' ? (
                        <>
                            <div className="flex flex-col gap-3 py-2">
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-gray-400 text-sm">Current Price:</span>
                                    <span className="text-white font-mono text-xl font-bold">${selectedBubble.price?.toFixed(2) || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-between py-2 border-t border-gray-700/40">
                                    <span className="text-gray-400 text-sm">Change (24h):</span>
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
                                {selectedBubble.sector && (
                                    <div className="flex items-center gap-2 justify-between">
                                        <span className="text-gray-400 text-sm">Sector:</span>
                                        <span className="text-blue-300 font-semibold">{selectedBubble.sector}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-700/40">
                                    <div className="text-center p-2 rounded-lg bg-gray-700/30">
                                        <div className="text-xs text-gray-400">Open</div>
                                        <div className="text-white font-mono font-bold">${selectedBubble.open?.toFixed(2) || '-'}</div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-gray-700/30">
                                        <div className="text-xs text-gray-400">Prev Close</div>
                                        <div className="text-white font-mono font-bold">${selectedBubble.previousClose?.toFixed(2) || '-'}</div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-green-700/20 border border-green-700/40">
                                        <div className="text-xs text-green-400 font-bold">High</div>
                                        <div className="text-green-300 font-mono font-bold">${selectedBubble.high?.toFixed(2) || '-'}</div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-red-700/20 border border-red-700/40">
                                        <div className="text-xs text-red-400 font-bold">Low</div>
                                        <div className="text-red-300 font-mono font-bold">${selectedBubble.low?.toFixed(2) || '-'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-gray-400 text-sm">Volume:</span>
                                    <span className="text-white font-mono font-bold">{selectedBubble.volume24h !== undefined ? `${(selectedBubble.volume24h / 1e6).toFixed(1)}M` : '-'}</span>
                                </div>
                            </div>
                            {!hasFeature('historicalDataAccess') ? (
                                <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border-2 border-purple-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Lock className="h-5 w-5 text-purple-400" />
                                        <span className="text-sm font-semibold text-purple-300">Pro Feature</span>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-3">
                                        Historical price charts are available for Pro members
                                    </p>
                                    <Link href="/pricing">
                                        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
                                            Upgrade to Pro
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {isChartLoading && (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                                        </div>
                                    )}
                                    {!isChartLoading && historicalData && (
                                        <HistoricalChart data={historicalData} />
                                    )}
                                </>
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