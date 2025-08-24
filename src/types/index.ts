export interface CryptoBubbleData {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  priceChange24h: number;
  volume24h: number;
  category: "stablecoin" | "forex-pair" | "crypto";
  color: string;
  size: number; // relative size for bubble visualization
}
