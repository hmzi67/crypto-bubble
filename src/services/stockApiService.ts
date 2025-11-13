import { StockBubbleData } from "@/types";

// AlphaVantage API Configuration
// Get your free API key from: https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Popular stock symbols to track
const POPULAR_STOCKS = [
  // Tech Giants
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Entertainment" },
  
  // Financial
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financial" },
  { symbol: "BAC", name: "Bank of America", sector: "Financial" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Financial" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financial" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financial" },
  
  // Healthcare
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  
  // Consumer
  { symbol: "WMT", name: "Walmart Inc.", sector: "Retail" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Goods" },
  { symbol: "KO", name: "Coca-Cola Company", sector: "Beverages" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Beverages" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Apparel" },
  { symbol: "MCD", name: "McDonald's Corp.", sector: "Food Service" },
  
  // Energy
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },
  
  // Industrial
  { symbol: "BA", name: "Boeing Company", sector: "Aerospace" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial" },
  { symbol: "GE", name: "General Electric", sector: "Industrial" },
  
  // Communication
  { symbol: "DIS", name: "Walt Disney Company", sector: "Entertainment" },
  { symbol: "VZ", name: "Verizon Communications", sector: "Telecom" },
  { symbol: "T", name: "AT&T Inc.", sector: "Telecom" },
];

/**
 * Fetch stock market data from AlphaVantage API
 * Note: Free tier has 25 requests per day limit
 */
export async function fetchStockData(limit: number = 20): Promise<StockBubbleData[]> {
  try {
    // Due to API rate limits, we'll fetch a batch of stocks
    const stocksToFetch = POPULAR_STOCKS.slice(0, Math.min(limit, 20));
    
    // For demo purposes, we'll use GLOBAL_QUOTE for real-time data
    // In production, you might want to cache this data
    const stockPromises = stocksToFetch.map(async (stock) => {
      try {
        const response = await fetch(
          `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
          console.warn(`Failed to fetch data for ${stock.symbol}`);
          return createFallbackStockData(stock);
        }

        const data = await response.json();
        
        // Check if we hit rate limit or got invalid response
        if (data.Note || data["Error Message"] || !data["Global Quote"]) {
          console.warn(`API limit or error for ${stock.symbol}, using fallback data`);
          return createFallbackStockData(stock);
        }

        const quote = data["Global Quote"];
        
        return {
          id: `${stock.symbol.toLowerCase()}-stock`,
          symbol: stock.symbol,
          name: stock.name,
          marketCap: parseFloat(quote["06. volume"] || "0") * parseFloat(quote["05. price"] || "0"),
          priceChange24h: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
          volume24h: parseFloat(quote["06. volume"] || "0"),
          price: parseFloat(quote["05. price"] || "0"),
          category: "stock" as const,
          sector: stock.sector,
          color: getStockColor(parseFloat(quote["10. change percent"]?.replace("%", "") || "0")),
          size: 50, // Will be calculated based on volume or market cap
          open: parseFloat(quote["02. open"] || "0"),
          high: parseFloat(quote["03. high"] || "0"),
          low: parseFloat(quote["04. low"] || "0"),
          previousClose: parseFloat(quote["08. previous close"] || "0"),
        };
      } catch (error) {
        console.error(`Error fetching ${stock.symbol}:`, error);
        return createFallbackStockData(stock);
      }
    });

    const results = await Promise.all(stockPromises);
    return results;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return createFallbackStockDataSet();
  }
}

/**
 * Create fallback data for a single stock (for demo/testing purposes)
 */
function createFallbackStockData(stock: { symbol: string; name: string; sector: string }): StockBubbleData {
  const basePrice = Math.random() * 300 + 50;
  const change = (Math.random() - 0.5) * 10;
  const volume = Math.floor(Math.random() * 100000000) + 1000000;
  
  return {
    id: `${stock.symbol.toLowerCase()}-stock`,
    symbol: stock.symbol,
    name: stock.name,
    marketCap: basePrice * volume,
    priceChange24h: change,
    volume24h: volume,
    price: basePrice,
    category: "stock" as const,
    sector: stock.sector,
    color: getStockColor(change),
    size: 50,
    open: basePrice * 0.98,
    high: basePrice * 1.02,
    low: basePrice * 0.97,
    previousClose: basePrice - (basePrice * change / 100),
  };
}

/**
 * Create fallback dataset when API fails
 */
function createFallbackStockDataSet(): StockBubbleData[] {
  return POPULAR_STOCKS.slice(0, 20).map(stock => createFallbackStockData(stock));
}

/**
 * Get stock color based on price change
 */
function getStockColor(change: number): string {
  const absChange = Math.abs(change);
  
  if (absChange < 0.5) {
    return "#9ca3af"; // gray-400 - neutral/sideways
  } else if (absChange >= 3) {
    return change >= 0 ? "#10b981" : "#f87171"; // emerald-500 / red-400 - strong movement
  } else if (absChange >= 1.5) {
    return change >= 0 ? "#34d399" : "#fca5a5"; // emerald-400 / red-300 - moderate movement
  } else {
    return change >= 0 ? "#6ee7b7" : "#fecaca"; // emerald-300 / red-200 - weak movement
  }
}

/**
 * Fetch historical stock data for charting
 */
export async function fetchStockHistoricalData(
  symbol: string
): Promise<{ time: number; price: number }[] | null> {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.Note || data["Error Message"] || !data["Time Series (Daily)"]) {
      console.warn("API limit reached or error, cannot fetch historical data");
      return null;
    }

    const timeSeries = data["Time Series (Daily)"];
    const historicalData: { time: number; price: number }[] = [];

    // Get last 30 days of data
    const dates = Object.keys(timeSeries).slice(0, 30).reverse();
    
    dates.forEach(date => {
      const timestamp = new Date(date).getTime();
      const closePrice = parseFloat(timeSeries[date]["4. close"]);
      historicalData.push({ time: timestamp, price: closePrice });
    });

    return historicalData;
  } catch (error) {
    console.error("Error fetching historical stock data:", error);
    return null;
  }
}

/**
 * Get sector category color
 */
export function getSectorColor(sector: string): string {
  const sectorColors: { [key: string]: string } = {
    "Technology": "#3b82f6",
    "Financial": "#10b981",
    "Healthcare": "#ef4444",
    "Consumer Goods": "#f59e0b",
    "Energy": "#8b5cf6",
    "Industrial": "#6366f1",
    "Entertainment": "#ec4899",
    "Retail": "#14b8a6",
    "Automotive": "#f97316",
    "Beverages": "#06b6d4",
    "Food Service": "#84cc16",
    "Apparel": "#a855f7",
    "Aerospace": "#0ea5e9",
    "Telecom": "#22c55e",
  };
  
  return sectorColors[sector] || "#64748b";
}
