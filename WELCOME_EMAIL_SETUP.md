# Welcome Email Setup Guide

## Overview
The welcome email system is now integrated into your A2Z Sellr signup process. When users register, they'll automatically receive a beautifully designed welcome email.

## What's Been Added

### 1. Welcome Email Template
- **File**: `email-templates/welcome-email.html`
- **Features**: 
  - Brutalist design matching your app's style
  - Responsive layout
  - Dynamic content (user name, plan, etc.)
  - Call-to-action buttons
  - Trial information

### 2. Welcome Email API
- **File**: `app/api/send-welcome-email/route.ts`
- **Features**:
  - Multiple email service integrations (Resend, SendGrid)
  - Fallback to database queue
  - Template variable replacement
  - Error handling

### 3. Signup Integration
- **File**: `lib/auth.tsx`
- **Integration**: Automatically sends welcome email after successful signup

## Email Service Setup Options

### Option 1: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to your `.env.local`:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   FROM_EMAIL=welcome@yourdomain.com
   ```

### Option 2: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to your `.env.local`:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL=welcome@yourdomain.com
   ```

### Option 3: Database Queue (Fallback)
If no email service is configured, emails are queued in the database.

Create this table in Supabase:
```sql
CREATE TABLE email_queue (
  id BIGSERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  email_type TEXT DEFAULT 'welcome',
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);
```

## Supabase Email Templates (Alternative)

You can also set up welcome emails directly in Supabase:

### 1. Go to Supabase Dashboard
- Navigate to Authentication > Email Templates

### 2. Create Custom Welcome Template
- Click "New Template"
- Select "Welcome" type
- Use the HTML from `email-templates/welcome-email.html`

### 3. Configure Email Settings
- Go to Authentication > Settings
- Configure SMTP settings or use Supabase's built-in email

### 4. Enable Welcome Emails
- In Authentication settings
- Enable "Send welcome email" option

## Testing the Welcome Email

### 1. Development Testing
```bash
# The system will log email content to console
# Check your terminal after user registration
```

### 2. Production Testing
- Register a new user account
- Check the email inbox
- Verify all links work correctly

## Customization

### Email Content
Edit `email-templates/welcome-email.html` to customize:
- Colors and styling
- Content and messaging
- Call-to-action buttons
- Company branding

### Email Logic
Edit `app/api/send-welcome-email/route.ts` to:
- Add more email services
- Customize sending logic
- Add email tracking
- Implement retry mechanisms

## Environment Variables

Add these to your `.env.local`:
```
# Email Service (choose one)
RESEND_API_KEY=your_resend_key
SENDGRID_API_KEY=your_sendgrid_key

# Email Configuration
FROM_EMAIL=welcome@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Email tracking
EMAIL_TRACKING_ENABLED=true
```

## Monitoring

### Check Email Delivery
1. **Logs**: Check server logs for email sending status
2. **Database**: Query `email_queue` table for queued emails
3. **Service Dashboard**: Check your email service dashboard

### Common Issues
1. **API Key Issues**: Verify environment variables
2. **Domain Verification**: Ensure sending domain is verified
3. **Rate Limits**: Check email service rate limits
4. **Template Errors**: Verify HTML template syntax

## Next Steps

1. **Set up your preferred email service** (Resend recommended)
2. **Test with a real email address**
3. **Customize the email template** to match your branding
4. **Monitor email delivery** in production
5. **Consider adding email analytics** for tracking opens/clicks

The welcome email system is now ready to use! Users will receive a professional welcome email immediately after signing up for A2Z Sellr.