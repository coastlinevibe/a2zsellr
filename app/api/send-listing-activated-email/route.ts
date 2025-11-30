import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, listingTitle, listingId } = await request.json()

    if (!email || !displayName || !listingTitle) {
      return NextResponse.json(
        { error: 'Email, display name, and listing title are required' },
        { status: 400 }
      )
    }

    console.log(`Sending listing activated email to ${email} for listing: ${listingTitle}`)

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Create listing activated email HTML
    const activatedEmailHtml = `
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
            .header p {
              margin: 10px 0 0 0;
              font-size: 14px;
              font-weight: bold;
            }
            .content {
              padding: 30px 20px;
            }
            .greeting {
              font-size: 18px;
              font-weight: bold;
              color: #000;
              margin-bottom: 20px;
            }
            .listing-badge {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 12px 20px;
              border-radius: 6px;
              border: 2px solid #000;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .listing-info {
              background-color: #f0fdf4;
              border: 2px solid #10b981;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 15px;
            }
            .listing-title {
              font-size: 18px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 8px;
            }
            .listing-status {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
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
            .cta-button:hover {
              background-color: #059669;
            }
            .info-box {
              background-color: #f0f9ff;
              border: 2px solid #3b82f6;
              border-radius: 6px;
              padding: 15px;
              margin: 15px 0;
              font-size: 13px;
              color: #333;
            }
            .footer {
              background-color: #f5f5f5;
              border-top: 2px solid #e5e5e5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .footer a {
              color: #10b981;
              text-decoration: none;
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
              <div class="greeting">
                Hi ${displayName}! 👋
              </div>
              
              <p>Great news! Your scheduled listing has reached its scheduled time and is now <strong>ACTIVE</strong>.</p>
              
              <div class="listing-info">
                <div class="listing-title">📋 ${listingTitle}</div>
                <div class="listing-status">✓ Active</div>
              </div>
              
              <div class="section">
                <div class="section-title">📊 What's Next?</div>
                <p>Your listing is now live and ready to be shared with your customers. You can:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Share the listing link on WhatsApp, social media, or email</li>
                  <li>Monitor views and clicks in your analytics dashboard</li>
                  <li>Edit or pause the listing anytime from your dashboard</li>
                  <li>Schedule additional listings for future dates</li>
                </ul>
              </div>
              
              <div class="info-box">
                <strong>💡 Pro Tip:</strong> Share your listing immediately to maximize engagement and reach more customers!
              </div>
              
              <div class="section">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.a2zsellr.life'}/dashboard/listings" class="cta-button">
                  View Your Listing
                </a>
              </div>
              
              <div class="info-box">
                <strong>❓ Need Help?</strong> Check out our documentation or contact our support team at support@a2zsellr.com
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 A2Z Sellr. All rights reserved.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.a2zsellr.life'}">Visit Website</a> | 
                <a href="mailto:support@a2zsellr.com">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'notifications@a2zsellr.life',
        to: [email],
        subject: `🚀 Your Listing "${listingTitle}" is Now Active!`,
        html: activatedEmailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send listing activated email' },
        { status: 500 }
      )
    }

    const resendData = await resendResponse.json()
    console.log('Listing activated email sent successfully:', resendData.id)

    return NextResponse.json({
      success: true,
      message: 'Listing activated email sent successfully',
      emailId: resendData.id
    })

  } catch (error) {
    console.error('Error in send listing activated email API:', error)
    return NextResponse.json(
      { error: 'Failed to send listing activated email' },
      { status: 500 }
    )
  }
}
