import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📧 Processing email queue...')

    // Get pending emails from queue with profile and listing details
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from('email_queue')
      .select(`
        *,
        profiles:profile_id(email, display_name),
        profile_listings:listing_id(title)
      `)
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching email queue:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending emails',
        processed: 0
      })
    }

    console.log(`Found ${pendingEmails.length} pending emails`)

    let successCount = 0
    let failureCount = 0

    for (const emailRecord of pendingEmails) {
      try {
        const email = (emailRecord.profiles as any)?.email || emailRecord.email
        const displayName = (emailRecord.profiles as any)?.display_name || 'there'
        const listingTitle = (emailRecord.profile_listings as any)?.title || emailRecord.listing_title

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || 'notifications@a2zsellr.life',
            to: [email],
            subject: `🚀 Your Listing "${listingTitle}" is Now Active!`,
            html: generateListingActivatedEmail(displayName, listingTitle),
          }),
        })

        if (emailResponse.ok) {
          // Mark as sent
          await supabaseAdmin
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', emailRecord.id)

          console.log(`✅ Email sent to ${email}`)
          successCount++
        } else {
          const errorData = await emailResponse.json()
          throw new Error(errorData.message || 'Email send failed')
        }
      } catch (error) {
        const email = (emailRecord.profiles as any)?.email || emailRecord.email
        console.error(`❌ Failed to send email to ${email}:`, error)

        // Increment retry count
        await supabaseAdmin
          .from('email_queue')
          .update({
            retry_count: emailRecord.retry_count + 1,
            last_error: error instanceof Error ? error.message : String(error),
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id)

        failureCount++
      }
    }

    console.log(`📊 Email queue processed: ${successCount} sent, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingEmails.length} emails`,
      processed: successCount,
      failed: failureCount
    })

  } catch (error) {
    console.error('Error in process-email-queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateListingActivatedEmail(displayName: string, listingTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 3px solid #000;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-bottom: 3px solid #000;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .content {
            padding: 30px 20px;
          }
          .listing-info {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .listing-title {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
          }
          .cta-button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            border: 2px solid #000;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            margin-top: 15px;
            box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
          }
          .footer {
            background-color: #f5f5f5;
            border-top: 2px solid #e5e5e5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Listing Activated!</h1>
            <p>Your scheduled listing is now live</p>
          </div>
          
          <div class="content">
            <p>Hi ${displayName}! 👋</p>
            <p>Great news! Your scheduled listing has reached its scheduled time and is now <strong>ACTIVE</strong>.</p>
            
            <div class="listing-info">
              <div class="listing-title">📋 ${listingTitle}</div>
              <div style="margin-top: 10px; font-size: 14px; color: #059669;">✓ Active</div>
            </div>
            
            <p>Your listing is now live and ready to be shared with your customers. Share it on WhatsApp, social media, or email to maximize engagement!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.a2zsellr.life'}/dashboard/listings" class="cta-button">
              View Your Listing
            </a>
          </div>
          
          <div class="footer">
            <p>© 2025 A2Z Sellr. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
