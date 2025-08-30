// export interface CryptoBubbleData {
//   id: string;
//   symbol: string;
//   name: string;
//   marketCap: number;
//   priceChange24h: number;
//   volume24h: number;
//   category: "stablecoin" | "forex-pair" | "crypto";
//   color: string;
//   size: number; // relative size for bubble visualization
// }


export interface ForexBubbleData {
  id: string;
  symbol: string; // e.g., "EUR", "GBP", "JPY"
  name: string; // e.g., "Euro", "British Pound"
  marketCap: number; // We'll simulate this based on currency strength/volume
  priceChange24h: number; // Daily change percentage
  volume24h: number; // Trading volume
  category: "forex" | "forex-pair" | "major" | "minor" | "exotic";
  color: string;
  size: number;
  currentRate?: number; // Current exchange rate vs USD
  countryCode?: string; // For flag display
}

export interface ForexPairBubbleData {
  id: string;
  symbol: string; // e.g., "EURUSD", "GBPJPY"
  name: string; // e.g., "EUR/USD", "GBP/JPY"
  marketCap: number;
  priceChange24h: number;
  volume24h: number;
  category: "forex-pair";
  color: string;
  size: number;
  currentRate: number;
  bid: number;
  ask: number;
  spread: number;
}

export type CryptoBubbleData = {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  priceChange24h: number;
  volume24h: number;
  category:
    | "stablecoin"
    | "forex-pair"
    | "crypto"
    | "forex"
    | "major"
    | "minor"
    | "exotic";
  color: string;
  size: number;
  currentRate?: number;
  countryCode?: string;
  bid?: number;
  ask?: number;
  spread?: number;
};