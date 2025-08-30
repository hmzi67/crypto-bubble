import { ForexBubbleData, ForexPairBubbleData } from "@/types";

// You can use Free Forex APIs like:
// - Fixer.io (free tier)
// - ExchangeRate-API (free)
// - CurrencyAPI (free tier)
// - Alpha Vantage (free tier)

const FOREX_BASE_URL = "https://api.exchangerate-api.com/v4"; // Free API, no key needed

/**
 * Fetch major forex currencies as bubbles
 */
export async function fetchForexCurrencies(
  limit: number = 20
): Promise<ForexBubbleData[]> {
  try {
    // Get current exchange rates
    const response = await fetch(`${FOREX_BASE_URL}/latest/USD`);

    if (!response.ok) {
      throw new Error("Failed to fetch forex data");
    }

    const data = await response.json();
    const rates = data.rates;

    // Major currencies with their market importance (simulated market cap)
    const majorCurrencies = [
      { symbol: "EUR", name: "Euro", importance: 100, country: "EU" },
      { symbol: "GBP", name: "British Pound", importance: 80, country: "GB" },
      { symbol: "JPY", name: "Japanese Yen", importance: 90, country: "JP" },
      { symbol: "CHF", name: "Swiss Franc", importance: 60, country: "CH" },
      { symbol: "CAD", name: "Canadian Dollar", importance: 70, country: "CA" },
      {
        symbol: "AUD",
        name: "Australian Dollar",
        importance: 65,
        country: "AU",
      },
      {
        symbol: "NZD",
        name: "New Zealand Dollar",
        importance: 45,
        country: "NZ",
      },
      { symbol: "SEK", name: "Swedish Krona", importance: 35, country: "SE" },
      { symbol: "NOK", name: "Norwegian Krone", importance: 40, country: "NO" },
      { symbol: "DKK", name: "Danish Krone", importance: 30, country: "DK" },
      { symbol: "PLN", name: "Polish Zloty", importance: 25, country: "PL" },
      { symbol: "CZK", name: "Czech Koruna", importance: 20, country: "CZ" },
      {
        symbol: "HUF",
        name: "Hungarian Forint",
        importance: 18,
        country: "HU",
      },
      { symbol: "TRY", name: "Turkish Lira", importance: 22, country: "TR" },
      {
        symbol: "ZAR",
        name: "South African Rand",
        importance: 28,
        country: "ZA",
      },
      { symbol: "MXN", name: "Mexican Peso", importance: 32, country: "MX" },
      { symbol: "BRL", name: "Brazilian Real", importance: 35, country: "BR" },
      { symbol: "CNY", name: "Chinese Yuan", importance: 85, country: "CN" },
      {
        symbol: "KRW",
        name: "South Korean Won",
        importance: 38,
        country: "KR",
      },
      {
        symbol: "SGD",
        name: "Singapore Dollar",
        importance: 42,
        country: "SG",
      },
    ];

    const forexData: ForexBubbleData[] = majorCurrencies
      .slice(0, limit)
      .map((currency) => {
        const currentRate = rates[currency.symbol] || 1;
        const baseRate = getHistoricalRate(currency.symbol); // Simulate historical rate
        const change24h = ((currentRate - baseRate) / baseRate) * 100;

        return {
          id: `${currency.symbol.toLowerCase()}-forex`,
          symbol: `${currency.symbol}`,
          name: currency.name,
          marketCap: currency.importance * 1000000000, // Convert importance to market cap
          priceChange24h: change24h,
          volume24h: currency.importance * 50000000, // Simulate volume
          category: getForexCategory(currency.importance),
          color: getForexColor(getForexCategory(currency.importance)),
          size: Math.max(30, Math.min(100, (currency.importance / 100) * 80)),
          currentRate: currentRate,
          countryCode: currency.country,
        };
      });

    return forexData;
  } catch (error) {
    console.error("Error fetching forex data:", error);
    return createFallbackForexData();
  }
}

/**
 * Fetch forex pairs as bubbles
 */
export async function fetchForexPairs(
  limit: number = 15
): Promise<ForexPairBubbleData[]> {
  try {
    const response = await fetch(`${FOREX_BASE_URL}/latest/USD`);

    if (!response.ok) {
      throw new Error("Failed to fetch forex pairs data");
    }

    const data = await response.json();
    const rates = data.rates;

    // Major forex pairs
    const majorPairs = [
      { base: "EUR", quote: "USD", name: "Euro/US Dollar", volume: 100 },
      {
        base: "GBP",
        quote: "USD",
        name: "British Pound/US Dollar",
        volume: 80,
      },
      { base: "USD", quote: "JPY", name: "US Dollar/Japanese Yen", volume: 90 },
      { base: "USD", quote: "CHF", name: "US Dollar/Swiss Franc", volume: 60 },
      {
        base: "USD",
        quote: "CAD",
        name: "US Dollar/Canadian Dollar",
        volume: 70,
      },
      {
        base: "AUD",
        quote: "USD",
        name: "Australian Dollar/US Dollar",
        volume: 65,
      },
      {
        base: "NZD",
        quote: "USD",
        name: "New Zealand Dollar/US Dollar",
        volume: 45,
      },
      { base: "EUR", quote: "GBP", name: "Euro/British Pound", volume: 55 },
      { base: "EUR", quote: "JPY", name: "Euro/Japanese Yen", volume: 50 },
      {
        base: "GBP",
        quote: "JPY",
        name: "British Pound/Japanese Yen",
        volume: 48,
      },
      { base: "EUR", quote: "CHF", name: "Euro/Swiss Franc", volume: 42 },
      {
        base: "GBP",
        quote: "CHF",
        name: "British Pound/Swiss Franc",
        volume: 38,
      },
      {
        base: "AUD",
        quote: "JPY",
        name: "Australian Dollar/Japanese Yen",
        volume: 35,
      },
      {
        base: "CAD",
        quote: "JPY",
        name: "Canadian Dollar/Japanese Yen",
        volume: 32,
      },
      {
        base: "CHF",
        quote: "JPY",
        name: "Swiss Franc/Japanese Yen",
        volume: 30,
      },
    ];

    const forexPairData: ForexPairBubbleData[] = majorPairs
      .slice(0, limit)
      .map((pair) => {
        let currentRate: number;

        if (pair.base === "USD") {
          currentRate = rates[pair.quote] || 1;
        } else if (pair.quote === "USD") {
          currentRate = 1 / (rates[pair.base] || 1);
        } else {
          currentRate = (rates[pair.quote] || 1) / (rates[pair.base] || 1);
        }

        const baseRate = getHistoricalPairRate(pair.base, pair.quote);
        const change24h = ((currentRate - baseRate) / baseRate) * 100;
        const spread = currentRate * 0.0001; // Simulate spread

        return {
          id: `${pair.base}${pair.quote}-pair`,
          symbol: `${pair.base}${pair.quote}`,
          name: `${pair.base}/${pair.quote}`,
          marketCap: pair.volume * 1000000000,
          priceChange24h: change24h,
          volume24h: pair.volume * 80000000,
          category: "forex-pair" as const,
          color: "#f59e0b", // Amber color for forex pairs
          size: Math.max(35, Math.min(90, (pair.volume / 100) * 80)),
          currentRate: currentRate,
          bid: currentRate - spread / 2,
          ask: currentRate + spread / 2,
          spread: spread,
        };
      });

    return forexPairData;
  } catch (error) {
    console.error("Error fetching forex pairs data:", error);
    return createFallbackForexPairsData();
  }
}

/**
 * Simulate historical rates (in real app, you'd fetch actual historical data)
 */
function getHistoricalRate(currency: string): number {
  // Simulate some rate changes for demo
  const variations: { [key: string]: number } = {
    EUR: 0.92 + (Math.random() - 0.5) * 0.02,
    GBP: 0.81 + (Math.random() - 0.5) * 0.02,
    JPY: 148 + (Math.random() - 0.5) * 2,
    CHF: 0.89 + (Math.random() - 0.5) * 0.02,
    CAD: 1.35 + (Math.random() - 0.5) * 0.02,
    AUD: 0.68 + (Math.random() - 0.5) * 0.02,
  };
  return variations[currency] || 1;
}

function getHistoricalPairRate(base: string, quote: string): number {
  // Simulate historical pair rates
  return Math.random() * 2 + 0.5; // Simple simulation
}

/**
 * Determine forex category based on importance
 */
function getForexCategory(importance: number): "major" | "minor" | "exotic" {
  if (importance >= 70) return "major";
  if (importance >= 40) return "minor";
  return "exotic";
}

/**
 * Get color based on forex category
 */
function getForexColor(category: "major" | "minor" | "exotic"): string {
  switch (category) {
    case "major":
      return "#10b981"; // Green
    case "minor":
      return "#3b82f6"; // Blue
    case "exotic":
      return "#8b5cf6"; // Purple
    default:
      return "#6b7280"; // Gray
  }
}

/**
 * Create fallback forex data if API fails
 */
function createFallbackForexData(): ForexBubbleData[] {
  return [
    {
      id: "eur-forex",
      symbol: "EUR",
      name: "Euro",
      marketCap: 100000000000,
      priceChange24h: 0.25,
      volume24h: 5000000000,
      category: "major",
      color: "#10b981",
      size: 80,
      currentRate: 0.92,
      countryCode: "EU",
    },
    {
      id: "gbp-forex",
      symbol: "GBP",
      name: "British Pound",
      marketCap: 80000000000,
      priceChange24h: -0.15,
      volume24h: 4000000000,
      category: "major",
      color: "#10b981",
      size: 70,
      currentRate: 0.81,
      countryCode: "GB",
    },
    // Add more fallback data...
  ];
}

function createFallbackForexPairsData(): ForexPairBubbleData[] {
  return [
    {
      id: "eurusd-pair",
      symbol: "EURUSD",
      name: "EUR/USD",
      marketCap: 100000000000,
      priceChange24h: 0.18,
      volume24h: 8000000000,
      category: "forex-pair",
      color: "#f59e0b",
      size: 80,
      currentRate: 1.085,
      bid: 1.0848,
      ask: 1.0852,
      spread: 0.0004,
    },
    // Add more fallback pair data...
  ];
}
