# Software Requirements Specification (SRS)

## Project Title: Crypto Forex Bubble

## 1. Introduction

Crypto Forex Bubble is a modern web application for real-time visualization of cryptocurrency and forex market data. It provides interactive bubble charts, live updates, and category-based analysis for traders, analysts, and enthusiasts.

## 2. Purpose

The purpose of this project is to offer an engaging, intuitive, and visually rich interface for monitoring and analyzing crypto and forex markets. It aims to simplify complex market data into interactive visual bubbles, making trends and changes easy to understand at a glance.

## 3. Scope

- Real-time visualization of crypto and forex assets
- Interactive bubble chart UI with drag, hover, and click actions
- Category switching: Crypto, Forex, Forex Pairs
- Search and filter functionality
- Detailed asset info popups
- Responsive design for desktop and mobile
- API integration for live data

## 4. System Overview

- **Frontend:** Next.js (React), Tailwind CSS, D3.js for visualization
- **Backend/API:** Uses public APIs (CoinGecko, ExchangeRate-API)
- **Deployment:** Node.js environment, supports .env for API keys

## 5. Functional Requirements

### 5.1 Data Fetching

- Fetch top cryptocurrencies from CoinGecko API
- Fetch major forex currencies and pairs from ExchangeRate-API
- Periodically refresh data (every 30 seconds)
- Use environment variables for API keys and endpoints

### 5.2 Visualization

- Render assets as interactive bubbles sized by market cap or volume
- Use D3.js for physics simulation and smooth animations
- Bubbles can be dragged, hovered, and clicked for details
- Color coding for positive/negative change, categories

### 5.3 User Interaction

- Category tabs for switching between Crypto, Forex, and Forex Pairs
- Search bar for filtering assets by name or symbol
- Detailed info popup on bubble click
- Responsive resizing and layout

### 5.4 UI Components

- Header with branding, category tabs, search
- Bubble chart area (SVG)
- Info popups and error/loading states
- Dashboard page for analytics (placeholder)
- Prelaunch page with countdown (for marketing)

## 6. Non-Functional Requirements

- **Performance:** Fast rendering, smooth animations
- **Reliability:** Handles API errors gracefully, fallback data
- **Security:** API keys stored in .env, not exposed in code
- **Scalability:** Can be deployed on any Node.js-compatible VPS
- **Maintainability:** Modular code, TypeScript for type safety

## 7. Architecture

- **Next.js App Router** for routing and layout
- **D3.js** for bubble chart physics and rendering
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **API Services** in `/src/services/` for data fetching
- **Reusable UI components** in `/src/components/ui/`
- **Types** in `/src/types/`

## 8. Data Model

- `CryptoBubbleData`, `ForexBubbleData`, `ForexPairBubbleData` interfaces define asset structure
- Each bubble contains: id, symbol, name, marketCap, priceChange24h, volume24h, category, color, size, currentRate, etc.

## 9. API Integration

- CoinGecko API for crypto data
- ExchangeRate-API for forex data
- API endpoints and keys set via `.env.local`

## 10. Deployment

- Node.js environment (VPS, Vercel, Hostinger, etc.)
- Environment variables for API keys
- `npm run build` and `npm start` for production

## 11. Error Handling

- Loading spinners for async data
- Error popups for failed API calls
- Fallback mock data if APIs are unavailable

## 12. Security

- Sensitive keys in `.env.local`, not committed to git
- `.gitignore` includes `.env*`

## 13. Future Enhancements

- User authentication and profiles
- Customizable dashboards
- Historical data and charting
- Alerts and notifications
- Mobile app version

## 14. File Structure Overview

```
components.json
.eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
SRS.md
public/
  ...assets
src/
  app/
    layout.tsx
    page.tsx
    prelaunch/page.tsx
    globals.css
  components/
    features/landing/crypto-bubble.tsx
    features/landing/dashboard.tsx
    layout/header.tsx
    ui/button.tsx
    ui/input.tsx
  lib/utils.ts
  services/coinApiService.ts
  services/forexApiService.ts
  types/index.ts
```

## 15. References

- [Next.js Documentation](https://nextjs.org/docs)
- [D3.js Documentation](https://d3js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [CoinGecko API](https://coingecko.com/en/api)
- [ExchangeRate-API](https://www.exchangerate-api.com/)

---

This SRS covers all major aspects of the Crypto Forex Bubble project, including architecture, features, data flow, and deployment. For further details, see the codebase and README.
