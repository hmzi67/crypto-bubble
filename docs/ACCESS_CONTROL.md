# Access Control Implementation

This document describes the access control system implemented for the crypto-bubble platform with tiered subscription plans.

## Overview

The platform now has a comprehensive access control system that restricts features based on user subscription plans:

- **FREE Plan**: Limited access to basic crypto features
- **PRO Plan**: Full access to all features
- **ENTERPRISE Plan**: Full access plus API and white-label options

## Feature Restrictions

### FREE Plan Restrictions

1. **Data Access**
   - Limited to top 50 cryptocurrencies only
   - No access to stocks
   - No access to forex/forex pairs
   - Manual refresh only (no auto-refresh)

2. **Features**
   - No historical price charts
   - No data export capabilities
   - No custom alerts
   - No advanced analytics
   - Single timeframe view only

3. **Visual Indicators**
   - Lock icons (🔒) on restricted categories
   - Premium feature banners for historical charts
   - Top banner showing plan limitations with upgrade CTA

### PRO Plan Features

1. **Full Data Access**
   - Unlimited cryptocurrencies
   - Full stock market access
   - Full forex market access
   - Auto-refresh every 30 seconds

2. **Advanced Features**
   - Historical price charts (5 years)
   - Data export (CSV, JSON, Excel)
   - Custom alerts
   - Advanced analytics
   - Multiple timeframes
   - Detailed statistics

### ENTERPRISE Plan Features

All PRO features plus:

- API access
- White-label options
- Real-time data streaming
- Unlimited historical data
- XML export format
- Priority support

## Implementation Files

### 1. Subscription Configuration

**File**: `src/lib/subscription.ts`

Enhanced `PlanFeatures` interface with detailed restrictions:

- Data access limits (crypto, stocks, forex)
- Feature flags (historical data, export, alerts, etc.)
- Update intervals and refresh settings

### 2. Feature Access Hook

**File**: `src/hooks/useFeatureAccess.ts`

Client-side hook for checking feature access:

```typescript
const { hasFeature, getFeatureLimit, isPro, isFree } = useFeatureAccess();

// Check if user has a feature
if (hasFeature("historicalDataAccess")) {
  // Show historical chart
}

// Get numeric limits
const maxCrypto = getFeatureLimit("maxCryptocurrencies");
```

### 3. API Access Control

**File**: `src/lib/access-control.ts`

Server-side utilities for protecting API routes:

```typescript
// Check feature access
const { authorized, response, userId } = await checkFeatureAccess(
  req,
  "exportData",
);

// Or use as middleware wrapper
export const POST = withFeatureAccess("exportData", async (req, { userId }) => {
  // Handler code
});
```

### 4. Component Integration

**File**: `src/components/features/landing/crypto-bubble.tsx`

Main bubble component with integrated restrictions:

- Category access control
- Data limit enforcement
- Historical chart gating
- Auto-refresh for Pro users only
- Visual premium indicators

### 5. Protected API Route Example

**File**: `src/app/api/export/route.ts`

Example of a protected API endpoint that requires Pro subscription to access.

## Usage Examples

### Client-Side Feature Gating

```typescript
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function MyComponent() {
  const { hasFeature, isPro } = useFeatureAccess();

  return (
    <div>
      {hasFeature('historicalDataAccess') ? (
        <HistoricalChart />
      ) : (
        <UpgradePrompt feature="Historical Charts" />
      )}
    </div>
  );
}
```

### Server-Side Route Protection

```typescript
import { checkFeatureAccess } from "@/lib/access-control";

export async function GET(req: NextRequest) {
  const { authorized, response, userId } = await checkFeatureAccess(
    req,
    "advancedCharts",
  );

  if (!authorized) return response!;

  // Protected logic here
}
```

### Using the FeatureGate Component

```typescript
import { FeatureGate } from '@/components/subscription/feature-gate';

<FeatureGate
  requiredPlan="PRO"
  feature="Advanced Analytics"
>
  <AdvancedAnalytics />
</FeatureGate>
```

## Visual Indicators

### 1. Category Locks

Restricted categories show with a lock emoji (🔒) in the header tabs.

### 2. Premium Feature Banners

When free users click on a locked feature (e.g., historical chart), they see an upgrade prompt:

- Purple gradient banner
- Lock icon
- Clear description
- "Upgrade to Pro" button linking to /pricing

### 3. Top Banner for Free Users

Free users see a persistent top banner showing:

- Current plan status
- Key limitations (top 50 cryptos, no historical charts, etc.)
- Quick upgrade button

## Testing the Implementation

### As a Free User:

1. Sign up for a free account
2. Navigate to the main page
3. Observe:
   - Top banner showing free plan limitations
   - Only "Crypto" category is accessible
   - "Stocks", "Forex", and "Forex Pairs" show 🔒 icons
   - Clicking on a bubble shows no historical chart, instead shows upgrade prompt
   - Limited to top 50 cryptocurrencies
   - No auto-refresh (manual refresh only)

### As a Pro User:

1. Upgrade to Pro plan (or start Pro trial)
2. Navigate to the main page
3. Observe:
   - No top banner
   - All categories accessible
   - Historical charts visible when clicking bubbles
   - All cryptocurrencies, stocks, and forex available
   - Auto-refresh active

## Future Enhancements

The client will specify which features should be in each tier. The current implementation provides a foundation that can be easily adjusted:

1. **Modify feature limits** in `src/lib/subscription.ts`
2. **Add new feature flags** to `PlanFeatures` interface
3. **Integrate new restrictions** using `useFeatureAccess()` hook
4. **Protect new API routes** with `checkFeatureAccess()`

## API Route Protection Pattern

All premium API endpoints should follow this pattern:

```typescript
import { checkFeatureAccess } from "@/lib/access-control";

export async function POST(req: NextRequest) {
  const { authorized, response, userId } = await checkFeatureAccess(
    req,
    "requiredFeature", // Feature name from PlanFeatures
  );

  if (!authorized || !userId) {
    return response!; // Returns 401 or 403 with error message
  }

  // Protected logic here
}
```

## Key Benefits

1. **Centralized Configuration**: All plan features defined in one place
2. **Reusable Utilities**: Easy-to-use hooks and functions
3. **Type Safety**: TypeScript interfaces ensure consistency
4. **Server-Side Security**: API routes protected with middleware
5. **Client-Side UX**: Clear visual indicators and upgrade prompts
6. **Flexible**: Easy to adjust feature limits per client requirements
7. **Scalable**: Simple to add new features and restrictions

## Notes

- All restrictions are enforced both client-side (UX) and server-side (security)
- Free users automatically get a FREE subscription on first login
- Plan limits are checked in real-time using the subscription status
- Expired trials automatically downgrade to FREE plan
- The system respects trial periods and grace periods
