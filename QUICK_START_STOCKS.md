# Quick Start Guide - Stock Market Feature

## Setup (First Time Only)

1. **Get your FREE API key** from AlphaVantage:
   - Visit: https://www.alphavantage.co/support/#api-key
   - Enter your email
   - Check your email for the API key
   - It's completely free!

2. **Add the API key to your project**:
   ```bash
   # Create .env.local file in the root directory
   echo "NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here" > .env.local
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Navigate to http://localhost:3000
   - Click on the "Stocks" tab
   - Enjoy real-time stock market data!

## How to Use

### Viewing Stocks
1. Click the **"Stocks"** tab in the header (icon: 📈)
2. Watch as bubbles appear representing different stocks
3. Bubble size = trading volume
4. Bubble color = price change (green = up, red = down, gray = neutral)

### Getting Stock Details
1. **Click** on any stock bubble
2. A detail panel will appear showing:
   - Current price
   - 24-hour price change
   - Company sector
   - Open/Close/High/Low prices
   - Trading volume
   - 30-day price chart

### Searching for Stocks
1. Use the search bar at the top
2. Type a company name (e.g., "Apple") or symbol (e.g., "AAPL")
3. Matching stocks will be filtered in real-time

### Available Stocks
The app shows 30+ popular stocks including:
- **Tech**: Apple, Microsoft, Google, Amazon, Meta, NVIDIA, Tesla
- **Finance**: JPMorgan, Bank of America, Visa, Mastercard
- **Healthcare**: Johnson & Johnson, Pfizer, UnitedHealth
- **Consumer**: Walmart, Coca-Cola, Nike, McDonald's
- And many more!

## Understanding the Bubbles

### Bubble Size
- Larger bubbles = Higher trading volume
- Smaller bubbles = Lower trading volume

### Bubble Colors
- **Bright Green**: Strong price increase (≥3%)
- **Light Green**: Moderate price increase (1.5-3%)
- **Pale Green**: Slight price increase (0.5-1.5%)
- **Gray**: Minimal change (<0.5%)
- **Pale Red**: Slight price decrease (0.5-1.5%)
- **Light Red**: Moderate price decrease (1.5-3%)
- **Bright Red**: Strong price decrease (≥3%)

### Sector Badges
Each stock displays its sector category:
- 💙 **Technology** (Blue)
- 💚 **Financial** (Green)
- ❤️ **Healthcare** (Red)
- 🧡 **Consumer** (Orange)
- And more...

## API Usage Notes

### Free Tier Limits
- **25 API calls per day**
- Resets every 24 hours
- Each stock load counts as 1 call

### When Rate Limit is Reached
- App automatically switches to demo data
- Demo data is realistic and updates regularly
- No error messages or disruption
- Try again after 24 hours for real data

### Tips to Conserve API Calls
1. **Don't refresh too often** - Data is cached in your session
2. **Use demo mode for testing** - Set API key to "demo" in .env.local
3. **Consider upgrading** - Paid plans available for unlimited calls

## Troubleshooting

### "No data showing"
- ✅ Check your API key in `.env.local`
- ✅ Verify you haven't exceeded the 25 calls/day limit
- ✅ Try using "demo" as the API key for testing

### "Bubbles not moving"
- ✅ Wait a few seconds for data to load
- ✅ Check browser console for errors (F12)
- ✅ Refresh the page

### "Chart not loading"
- ✅ This uses an additional API call
- ✅ Check if you've hit the rate limit
- ✅ Wait 24 hours and try again

## Advanced Features

### Comparing with Other Markets
- Switch between **Crypto**, **Forex**, **Forex Pairs**, and **Stocks** tabs
- Each tab maintains its own data
- Compare market volatility across different asset types

### Interactive Bubbles
- **Click**: View detailed information
- **Drag**: Move bubbles around (they'll bounce back)
- **Hover**: See bubble glow effect
- **Search**: Filter by name or symbol

## Support & Resources

### Documentation
- Full implementation details: `STOCK_FEATURE_IMPLEMENTATION.md`
- Project README: `README.md`

### API Documentation
- AlphaVantage Docs: https://www.alphavantage.co/documentation/
- Free API Key: https://www.alphavantage.co/support/#api-key

### Need Help?
1. Check the browser console (F12) for error messages
2. Review the environment variables in `.env.local`
3. Ensure you're using a valid API key
4. Check if you've exceeded the rate limit

## What's Next?

### Explore Other Features
- Try the **Crypto** tab for cryptocurrency data
- Check out **Forex** for currency exchange rates
- View **Forex Pairs** for trading pairs

### Customize Your View
- Use search to find specific stocks
- Click bubbles to compare performance
- Watch the 30-day charts for trends

Enjoy your new stock market visualization! 🚀📈
