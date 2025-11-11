# A2Z Sellr Subscription System

## Overview

The A2Z Sellr subscription system allows users to upgrade from Free to Premium or Business tiers using the existing payment infrastructure. It integrates seamlessly with the registration payment system.

## Features

### ✅ **Subscription Tiers**
- **Free**: R0/month - Basic features with limits
- **Premium**: R149/month - Full e-commerce + marketing tools  
- **Business**: R299/month - Enterprise features + multi-location

### ✅ **Payment Integration**
- **PayFast**: Credit/debit card processing (same as registration)
- **EFT**: Direct bank transfer option (same as registration)
- **Automatic tier upgrades** on payment completion
- **Secure payment handling** with signature verification

### ✅ **Unified Payment System**
- Uses existing `payment_transactions` table
- Same PayFast configuration as registration
- Consistent payment flow and user experience
- Existing `activate_subscription` function handles upgrades

## Database Schema

### `payment_transactions` (Existing)
Handles both registration and upgrade payments.

```sql
- id: UUID (Primary Key)
- profile_id: UUID (Foreign Key to profiles)
- payment_method: TEXT ('payfast' | 'eft')
- amount_cents: INTEGER
- reference: TEXT (Unique payment reference)
- tier_requested: TEXT ('premium' | 'business')
- status: TEXT ('pending' | 'paid' | 'failed')
- payfast_payment_id: TEXT
- payment_date: TIMESTAMP
- created_at: TIMESTAMP
```

### `profiles` (Updated fields)
Stores subscription information directly on user profiles.

```sql
- subscription_tier: TEXT ('free' | 'premium' | 'business')
- subscription_status: TEXT ('active' | 'cancelled' | 'pending')
- subscription_start_date: TIMESTAMP
- subscription_end_date: TIMESTAMP
- payment_status: TEXT
- payment_method: TEXT
- payment_reference: TEXT
- last_payment_date: TIMESTAMP
```

## Components

### `SubscriptionUpgradeModal`
**Location**: `/components/SubscriptionUpgradeModal.tsx`

Main upgrade interface with:
- Plan comparison and selection
- Customer details form
- Payment method selection (PayFast/EFT)
- Secure payment processing

**Props**:
```typescript
{
  isOpen: boolean
  onClose: () => void
  currentTier: 'free' | 'premium' | 'business'
  userProfile: UserProfile
  onUpgradeSuccess: (newTier: string) => void
}
```

### `UserProfileDropdown`
**Location**: `/components/UserProfileDropdown.tsx`

Updated to include upgrade button that opens the subscription modal.

## API Endpoints

### `/api/payfast/webhook` (POST)
PayFast webhook handler (shared with registration payments).
- Verifies payment signatures
- Updates payment status in `payment_transactions`
- Calls `activate_subscription` function for tier upgrades
- Same endpoint used for both registration and upgrade payments

## Payment Flow

### Upgrade Process
1. User clicks "UPGRADE TO PREMIUM" in profile dropdown
2. `SubscriptionUpgradeModal` opens with plan selection
3. User selects plan and enters details
4. Payment processed via PayFast or EFT
5. Database automatically updates user tier on payment completion
6. User gains access to premium features immediately

### PayFast Flow
```
User → Modal → PayFast → Payment → Webhook → activate_subscription() → Tier Upgrade
```

### EFT Flow
```
User → Modal → EFT Instructions → Manual Verification → activate_subscription() → Tier Upgrade
```

## Subscription Management

### Automatic Upgrades
- PayFast payments trigger immediate upgrades via webhook
- EFT payments require manual verification by admin
- `activate_subscription()` function handles all tier changes
- Subscription dates calculated automatically (monthly/yearly)

### Manual Management
- Admins can manually activate subscriptions for EFT payments
- Direct database updates via admin panel
- All changes logged in profile history

## Environment Variables

```bash
# PayFast Configuration (same as registration)
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=10000100
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_MERCHANT_KEY=46f0cd694581a
```

## Setup Instructions

### 1. Database Setup
Uses existing database schema:
- `payment_transactions` table (already exists)
- `profiles` table with subscription fields (already exists)
- `activate_subscription()` function (already exists)

### 2. PayFast Configuration
1. Uses same PayFast credentials as registration
2. Webhook URL already configured: `https://yourdomain.com/api/payfast/webhook`
3. No additional setup required - reuses existing infrastructure

### 3. Component Integration
1. `SubscriptionUpgradeModal` component created
2. `UserProfileDropdown` updated with upgrade button
3. Payment success/cancel pages already exist

## Testing

### Test Upgrade Flow
1. Create free tier user
2. Click upgrade button in dashboard
3. Select Premium plan
4. Use PayFast sandbox for testing
5. Verify tier upgrade in database

### Test Downgrade Flow
1. Create premium user with old payment date
2. Run cron job manually: `POST /api/cron/check-subscriptions`
3. Verify user downgraded to free tier

## Security Features

- **Payment signature verification** for PayFast
- **Row Level Security** on all subscription tables
- **Cron endpoint protection** with secret tokens
- **User isolation** - users can only see own payments

## Monitoring

### Key Metrics to Track
- Upgrade conversion rates
- Payment failure rates
- Churn/downgrade rates
- Revenue per user

### Database Queries
```sql
-- Recent upgrades
SELECT * FROM subscription_history 
WHERE change_reason = 'upgrade_payment' 
AND created_at > NOW() - INTERVAL '7 days';

-- Failed payments
SELECT * FROM subscription_payments 
WHERE status = 'failed' 
AND created_at > NOW() - INTERVAL '1 day';

-- Overdue users
SELECT p.display_name, sp.next_billing_date 
FROM profiles p 
JOIN subscription_payments sp ON p.id = sp.profile_id 
WHERE sp.next_billing_date < NOW() - INTERVAL '7 days'
AND p.subscription_tier != 'free';
```

## Troubleshooting

### Common Issues

**Payment not updating tier**:
- Check PayFast ITN logs
- Verify signature validation
- Check trigger function execution

**Cron job not running**:
- Verify cron schedule
- Check endpoint authentication
- Review server logs

**User stuck in wrong tier**:
- Check `subscription_history` for audit trail
- Manually update via admin if needed
- Verify payment status in `subscription_payments`

## Future Enhancements

- **Email notifications** for upgrades/downgrades
- **Proration handling** for mid-cycle changes  
- **Annual billing discounts**
- **Usage-based billing** for enterprise
- **Subscription analytics dashboard**
