# Crypto Forex Bubbles

A beautiful, interactive real-time market visualization tool built with Next.js and D3.js. View cryptocurrencies, forex currencies, forex pairs, and stock markets as animated bubbles with live data.

## Features

- 🔵 **Cryptocurrency Bubbles** - Top cryptocurrencies with live market data from CoinGecko
- 💱 **Forex Currencies** - Major, minor, and exotic currency pairs with exchange rates
- 📊 **Forex Pairs** - Interactive forex pair visualization with bid/ask spreads
- 📈 **Stock Market** - Real-time stock data powered by AlphaVantage API
- ⚡ **Live Updates** - Real-time market data with smooth animations
- 🎨 **Beautiful UI** - Glassmorphism design with neon glow effects
- 📱 **Responsive** - Works on desktop and mobile devices
- 🔍 **Search & Filter** - Find specific assets quickly

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hmzi67/crypto-bubble.git
cd crypto-bubble
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- **AlphaVantage API Key** (Required for stock data): Get a free key from [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
- **CoinGecko API Key** (Optional): For higher rate limits on crypto data

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Information

### Data Sources

- **Cryptocurrency Data**: [CoinGecko API](https://www.coingecko.com/en/api)
  - Free tier: 10-30 calls/minute
  - Demo mode available without API key
  
- **Forex Data**: [ExchangeRate API](https://www.exchangerate-api.com/)
  - Free tier: 1,500 requests/month
  - No API key required for basic access
  
- **Stock Market Data**: [AlphaVantage API](https://www.alphavantage.co/)
  - Free tier: 25 requests/day
  - API key required (get yours free at the link above)
  - Falls back to demo data if rate limit is exceeded

### API Rate Limits

The free tier of AlphaVantage has a limit of 25 API calls per day. If you exceed this limit, the app will automatically use fallback demo data. For production use, consider:
- Implementing a caching layer
- Upgrading to a paid API plan
- Using multiple API keys with load balancing

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Visualization**: D3.js for bubble chart animations
- **Styling**: Tailwind CSS with custom animations
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
