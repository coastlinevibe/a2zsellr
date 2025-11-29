import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, selectedPlan } = await request.json()

    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email and display name are required' },
        { status: 400 }
      )
    }

    console.log(`Sending welcome email to ${email} for ${selectedPlan} plan`)

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Create welcome email HTML
    const welcomeEmailHtml = `
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
              background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
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
            .plan-badge {
              display: inline-block;
              background-color: #fbbf24;
              color: #000;
              padding: 8px 16px;
              border-radius: 6px;
              border: 2px solid #000;
              font-weight: bold;
              font-size: 14px;
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
            .feature-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .feature-list li {
              padding: 8px 0;
              padding-left: 25px;
              position: relative;
              color: #333;
              font-size: 14px;
            }
            .feature-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
              font-size: 16px;
            }
            .cta-button {
              display: inline-block;
              background-color: #3b82f6;
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
              background-color: #2563eb;
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
              color: #3b82f6;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to A2Z Sellr!</h1>
              <p>Your account has been created successfully</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hi ${displayName}! 👋
              </div>
              
              <p>Thank you for joining A2Z Sellr! We're excited to have you on board.</p>
              
              <div class="plan-badge">
                ${selectedPlan.toUpperCase()} PLAN
              </div>
              
              <div class="section">
                <div class="section-title">🚀 Getting Started</div>
                <p>Your account is now active and ready to use. Here's what you can do next:</p>
                <ul class="feature-list">
                  <li>Complete your business profile</li>
                  <li>Add your products to your online shop</li>
                  <li>Create marketing listings to promote your business</li>
                  <li>Connect your WhatsApp for customer communication</li>
                  <li>Start receiving customer inquiries</li>
                </ul>
              </div>
              
              <div class="info-box">
                <strong>💡 Pro Tip:</strong> Visit your dashboard to set up your business profile and start selling. The more complete your profile, the more customers you'll attract!
              </div>
              
              <div class="section">
                <div class="section-title">📚 Your ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Includes</div>
                <ul class="feature-list">
                  ${selectedPlan === 'free' ? `
                    <li>Professional Business Listing</li>
                    <li>Complete Online Shop (5 Products)</li>
                    <li>Powerful Marketing Tools</li>
                    <li>Complete Contact Information</li>
                    <li>Business Gallery (3 Images)</li>
                    <li>Customer Reviews & Ratings</li>
                  ` : selectedPlan === 'premium' ? `
                    <li>Everything in Free Plan</li>
                    <li>Premium Directory Placement</li>
                    <li>Gallery Slider Showcase</li>
                    <li>Advanced Shop Integration</li>
                    <li>WhatsApp Ad Scheduling</li>
                    <li>WhatsApp Broadcast Templates</li>
                    <li>Enhanced Analytics</li>
                  ` : `
                    <li>Everything in Premium Plan</li>
                    <li>Multi-Location Management</li>
                    <li>Advanced Analytics Dashboard</li>
                    <li>Automated WhatsApp Playbooks</li>
                    <li>Custom Business Branding</li>
                    <li>Priority Customer Support</li>
                    <li>Performance Insights</li>
                  `}
                </ul>
              </div>
              
              <div class="section">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.a2zsellr.life'}/dashboard" class="cta-button">
                  Go to Your Dashboard
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
        from: process.env.FROM_EMAIL || 'welcome@a2zsellr.life',
        to: [email],
        subject: `🎉 Welcome to A2Z Sellr, ${displayName}!`,
        html: welcomeEmailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    const resendData = await resendResponse.json()
    console.log('Welcome email sent successfully:', resendData.id)

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: resendData.id
    })

  } catch (error) {
    console.error('Error in send welcome email API:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
