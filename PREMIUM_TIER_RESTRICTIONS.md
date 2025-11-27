# Premium Tier Restrictions - WhatsApp Integration

## Overview
Premium users have access to WhatsApp tools with specific hard limits to encourage upgrades to Business tier.

---

## 1. Hourly Send Limits (8/hour each)

### Direct Messages (DMs)
- **Limit**: 8 DMs per hour
- **Enforcement**: Backend tracks sends in `whatsapp_sends` table
- **UI Display**: Shows counter "X/8 DMs remaining this hour" in preview
- **Error**: "Premium limit reached: 8 DMs per hour. Upgrade to Business for unlimited sends."

### Group Messages
- **Limit**: 8 group messages per hour
- **Enforcement**: Backend tracks sends in `whatsapp_sends` table
- **UI Display**: Shows counter "X/8 Groups remaining this hour" in preview
- **Error**: "Premium limit reached: 8 group messages per hour. Upgrade to Business for unlimited sends."

### Implementation
- `whatsapp_sends` table logs each successful send with `recipient_type` and `created_at`
- `checkHourlyRateLimit()` function queries sends from last 60 minutes
- Blocks send if limit reached before API call
- `logSend()` function records each successful send

---

## 2. Contact Import Limit

- **Limit**: 80 personal contacts max
- **Enforcement**: UI prevents selecting more than 80 contacts
- **UI Display**: Shows counter "X/80 contacts selected"
- **Disabled State**: Contact selection button disabled when at limit
- **Error**: Cannot select more contacts when limit reached

---

## 3. Saved Groups Limit

- **Limit**: 2 groups max
- **Enforcement**: UI prevents selecting more than 2 groups
- **UI Display**: Shows counter "X/2 groups selected"
- **Disabled State**: Group selection button disabled when at limit
- **Error**: Cannot select more groups when limit reached

---

## 4. Scheduling Restrictions

### Allowed
- ✅ "Send Now" - Immediate sending
- ✅ "Send Later" - One-time scheduled send

### Not Allowed
- ❌ "Send Every Day (Autopilot)" - Daily recurring sends
- ❌ Custom scheduling windows (morning/afternoon/night)
- ❌ Recurring campaigns

### Implementation
- Autopilot button hidden or disabled for Premium users
- Backend validation blocks `repeat.mode == "daily"`
- Error: "Daily Autopilot is available in the Business plan."

---

## 5. Tier Comparison

| Feature | Free | Premium | Business |
|---------|------|---------|----------|
| Send to Groups | ❌ | ✅ (2 max) | ✅ (Unlimited) |
| Send DMs | ❌ | ✅ (8/hour) | ✅ (Unlimited) |
| Contacts | ❌ | ✅ (80 max) | ✅ (Unlimited) |
| Hourly Limit | N/A | 8 DMs + 8 Groups | Unlimited |
| Send Now | ❌ | ✅ | ✅ |
| Send Later | ❌ | ✅ | ✅ |
| Daily Autopilot | ❌ | ❌ | ✅ |
| Custom Scheduling | ❌ | ❌ | ✅ |

---

## 6. Database Schema

### whatsapp_sends Table
```sql
CREATE TABLE whatsapp_sends (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (references auth.users),
  recipient_type TEXT ('contact' | 'group' | 'custom'),
  created_at TIMESTAMP WITH TIME ZONE,
  
  INDEX: (user_id, created_at DESC)
);
```

---

## 7. UI Components Updated

### StepWho.tsx
- Fetches user tier from profiles table
- Shows tier-specific limits
- Enforces group selection limit (2 max for Premium)
- Enforces contact selection limit (80 max for Premium)
- Displays warning if user is on free tier

### PreviewStep.tsx
- Shows hourly send counters for Premium users
- Displays "X/8 DMs remaining" and "X/8 Groups remaining"
- Shows warning if hourly limit reached
- Displays tier violation warnings

### page.tsx
- `checkTierLimits()` - Validates tier-based restrictions
- `checkHourlyRateLimit()` - Checks hourly send limits
- `logSend()` - Records successful sends to database
- Blocks send button if limits exceeded
- Shows alert with reason if send blocked

---

## 8. Error Messages

| Scenario | Message |
|----------|---------|
| Free user tries groups | "Free tier cannot send to groups. Upgrade to Premium or Business." |
| Premium user exceeds 2 groups | "Premium tier allows max 2 groups. You selected X. Upgrade to Business." |
| Premium user exceeds 80 contacts | "Premium tier allows max 80 contacts. You selected X. Upgrade to Business." |
| Premium user hits 8 DM/hour limit | "Premium limit reached: 8 DMs per hour. Upgrade to Business for unlimited sends." |
| Premium user hits 8 group/hour limit | "Premium limit reached: 8 group messages per hour. Upgrade to Business for unlimited sends." |

---

## 9. Implementation Checklist

- ✅ Hourly rate limiting (8 DMs + 8 groups per hour)
- ✅ Contact import limit (80 max)
- ✅ Saved groups limit (2 max)
- ✅ UI counters showing remaining sends
- ✅ Send button disabled when limits exceeded
- ✅ Database table for tracking sends
- ✅ Backend validation before sending
- ✅ Error messages for each restriction
- ⏳ Autopilot scheduling restrictions (future)
- ⏳ Custom scheduling window restrictions (future)

---

## 10. Testing

To test Premium tier restrictions:

1. Set user's `subscription_tier` to 'premium' in profiles table
2. Try sending 9 DMs in one hour → should block on 9th
3. Try sending 9 group messages in one hour → should block on 9th
4. Try selecting 3 groups → should disable 3rd group button
5. Try selecting 81 contacts → should disable 81st contact button
6. Check `whatsapp_sends` table for logged sends

---

## 11. Future Enhancements

- Add daily/weekly/monthly send limits
- Implement autopilot scheduling for Business tier
- Add custom scheduling windows
- Create admin dashboard to view send statistics
- Add email notifications when limits approached
- Implement soft limits with warnings before hard block
