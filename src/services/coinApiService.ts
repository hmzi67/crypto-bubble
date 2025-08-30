// API service to han

import { CryptoBubbleData } from "@/types";
import { fetchForexCurrencies, fetchForexPairs } from "./forexApiService";

const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
const BASE_URL = "https://api.coingecko.com/api/v3";

// Headers for API requests - only include API key if it exists
const headers: HeadersInit = API_KEY ? { "x-cg-demo-api-key": API_KEY } : {};

/**
 * Fetch top cryptocurrencies data
 * @param limit Number of coins to fetch∏
 * @returns Promise with crypto data
 */
export async function fetchTopCryptos(
  limit: number = 20
): Promise<CryptoBubbleData[]> {
  try {
    // Increase the limit to ensure we get more coins to work with
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${
        limit * 2
      }&page=1&sparkline=false`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crypto data");
    }

    const data = await response.json();

    // Include specific stablecoins if they exist in the data
    const stablecoins = [
      "usdt",
      "usdc",
      "busd",
      "dai",
      "tusd",
      "lusd",
      "frax",
      "gusd",
      "usdp",
      "ust",
    ];
    type CoinApiResponse = {
      id: string;
      symbol: string;
      name: string;
      market_cap: number;
      price_change_percentage_24h?: number;
      total_volume: number;
    };
    const stablecoinData = (data as CoinApiResponse[]).filter((coin) =>
      stablecoins.includes(coin.symbol.toLowerCase())
    );

    // Include non-stablecoins to reach the limit
    const nonStablecoins = (data as CoinApiResponse[])
      .filter((coin) => !stablecoins.includes(coin.symbol.toLowerCase()))
      .slice(0, limit - stablecoinData.length);

    // Combine both arrays
    const combinedData = [...stablecoinData, ...nonStablecoins];

    // Add fake forex pairs to demonstrate your platform concept
    // In a real implementation, these would come from your platform's data
    const forexPairs = createMockForexPairs();

    // Transform API data to match your CryptoBubbleData structure
    const transformedData = (combinedData as CoinApiResponse[]).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      marketCap: coin.market_cap,
      priceChange24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume,
      category: determineRealCoinCategory(coin.symbol),
      color: getCoinColor(determineRealCoinCategory(coin.symbol)),
      size: determineSize(
        coin.market_cap,
        (data as CoinApiResponse[])[0].market_cap
      ),
    }));

    // Combine real data with mock forex pairs
    return [...transformedData, ...forexPairs];
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return createFallbackData(); // Return mock data if API fails
  }
}

/**
 * Create mock forex pairs for demonstration
 */
function createMockForexPairs(): CryptoBubbleData[] {
  const forexPairs: CryptoBubbleData[] = [
    {
      id: "usdeur-fx",
      symbol: "USDEURfx",
      name: "USD-EUR Forex Pair",
      marketCap: 25000000,
      priceChange24h: 0.25,
      volume24h: 3200000,
      category: "forex-pair", // now typed correctly
      color: "#8b5cf6",
      size: 55,
    },
    {
      id: "jpygbp-fx",
      symbol: "JPYGBPfx",
      name: "JPY-GBP Forex Pair",
      marketCap: 15000000,
      priceChange24h: -0.32,
      volume24h: 1800000,
      category: "forex-pair",
      color: "#8b5cf6",
      size: 38,
    },
    {
      id: "usdjpy-fx",
      symbol: "USDJPYfx",
      name: "USD-JPY Forex Pair",
      marketCap: 22000000,
      priceChange24h: 0.18,
      volume24h: 2800000,
      category: "forex-pair",
      color: "#8b5cf6",
      size: 50,
    },
    {
      id: "eurgbp-fx",
      symbol: "EURGBPfx",
      name: "EUR-GBP Forex Pair",
      marketCap: 18000000,
      priceChange24h: -0.15,
      volume24h: 2100000,
      category: "forex-pair",
      color: "#8b5cf6",
      size: 42,
    },
  ];

  return forexPairs;
}

/**
 * Create fallback data if API fails
 */
function createFallbackData(): CryptoBubbleData[] {
  return [
    {
      id: "1",
      symbol: "USDfx",
      name: "USD Stablecoin",
      marketCap: 50000000,
      priceChange24h: 0.05,
      volume24h: 2500000,
      category: "stablecoin",
      color: "#3b82f6",
      size: 80,
    },
    {
      id: "2",
      symbol: "EURfx",
      name: "EUR Stablecoin",
      marketCap: 35000000,
      priceChange24h: -0.12,
      volume24h: 1800000,
      category: "stablecoin",
      color: "#3b82f6",
      size: 65,
    },
    // Add more mock data here as needed (copy from your original mockBubbleData)
  ];
}

/**
 * Determine the category of a real coin based on its symbol
 */
function determineRealCoinCategory(
  symbol: string
): "stablecoin" | "forex-pair" {
  const stablecoins = [
    "usdt",
    "usdc",
    "busd",
    "dai",
    "tusd",
    "lusd",
    "frax",
    "gusd",
    "usdp",
    "ust",
  ];
  return stablecoins.includes(symbol.toLowerCase())
    ? "stablecoin"
    : "forex-pair";
}

/**
 * Get color based on category
 */
function getCoinColor(category: "stablecoin" | "forex-pair"): string {
  return category === "stablecoin" ? "#3b82f6" : "#8b5cf6";
}

/**
 * Calculate bubble size relative to largest coin
 */
function determineSize(marketCap: number, largestMarketCap: number): number {
  // Create a size between 25 and 80 based on market cap relative to largest
  const minSize = 25;
  const maxSize = 80;
  const ratio = marketCap / largestMarketCap;
  return Math.max(minSize, Math.min(maxSize, Math.round(ratio * 100)));
}

/**
 * Get market overview stats
 */
export async function getMarketOverview() {
  try {
    const response = await fetch(`${BASE_URL}/global`, { headers });

    if (!response.ok) {
      throw new Error("Failed to fetch market overview");
    }

    const { data } = await response.json();

    return {
      totalMarketCap: data.total_market_cap.usd,
      totalVolume: data.total_volume.usd,
      marketCapPercentage: data.market_cap_percentage,
    };
  } catch (error) {
    console.error("Error fetching market overview:", error);
    return {
      totalMarketCap: 2390000000000, // Default fallback value
      totalVolume: 129260000000, // Default fallback value
      marketCapPercentage: {},
    };
  }
}

/**
 * Fetch data based on selected category
 */
export async function fetchMarketData(
  category: "crypto" | "forex" | "forex-pair",
  limit: number = 20
): Promise<CryptoBubbleData[]> {
  switch (category) {
    case "crypto":
      return fetchTopCryptos(limit);
    case "forex":
      const forexData = await fetchForexCurrencies(limit);
      return forexData.map(item => ({
        ...item,
        category: item.category 
      }));
    case "forex-pair":
      const pairData = await fetchForexPairs(limit);
      return pairData.map(item => ({
        ...item,
        category: item.category 
      }));
    default:
      return fetchTopCryptos(limit);
  }
}