import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
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

    // Read the welcome email template
    let welcomeEmailHtml = ''
    try {
      const templatePath = join(process.cwd(), 'email-templates', 'welcome-email.html')
      welcomeEmailHtml = readFileSync(templatePath, 'utf8')
      
      // Replace template variables
      welcomeEmailHtml = welcomeEmailHtml
        .replace(/\{\{\.SiteURL\}\}/g, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a2zsellr.life')
        .replace(/\{\{displayName\}\}/g, displayName)
        .replace(/\{\{selectedPlan\}\}/g, selectedPlan)
        .replace(/\{\{email\}\}/g, email)
    } catch (templateError) {
      console.warn('Could not read welcome email template:', templateError)
      // Fallback to simple HTML
      welcomeEmailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #5cbdfd 0%, #667eea 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
              <h1 style="color: white; font-size: 32px; margin: 0;">🚀 Welcome to A2Z Sellr! 🚀</h1>
              <p style="color: white; font-size: 16px; margin: 10px 0 0 0;">Your Journey to Online Success Starts Now!</p>
            </div>
            
            <div style="background: #fff3cd; border: 2px solid #856404; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #856404; margin: 0 0 10px 0;">🎉 Welcome ${displayName}!</h2>
              <p style="color: #856404; margin: 0;">We're thrilled to have you on board with your ${selectedPlan} plan and can't wait to help you grow your online business.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a2zsellr.life'}/dashboard" 
                 style="background: #5cbdfd; color: black; padding: 15px 30px; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block;">
                Start Building Your Store
              </a>
            </div>
            
            <div style="background: #f8d7da; border: 2px solid #721c24; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #721c24; margin: 0 0 10px 0;">🎁 Your Free Trial</h3>
              <p style="color: #721c24; margin: 5px 0;">You have <strong>24 hours</strong> to explore all features for free!</p>
              <p style="color: #721c24; margin: 5px 0;"><strong>No credit card required</strong> to get started!</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <p style="color: #333;">Need help getting started?</p>
              <p style="color: #666;">Contact our support team at <a href="mailto:support@a2zsellr.com" style="color: #5cbdfd;">support@a2zsellr.com</a></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px; border-radius: 10px;">
              <p style="color: #6c757d; margin: 5px 0;"><strong>A2Z Sellr</strong> - Your Complete E-commerce Solution</p>
              <p style="color: #6c757d; margin: 5px 0; font-size: 12px;">Making online selling simple, powerful, and profitable.</p>
            </div>
          </body>
        </html>
      `
    }

    console.log(`Sending welcome email to ${email} for ${displayName} with ${selectedPlan} plan`)

    // For Supabase, you would typically use an Edge Function or integrate with an email service
    // Here's how you could integrate with different email services:

    // Option 1: Using Resend (recommended)
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: [email],
            subject: '🚀 Welcome to A2Z Sellr - Your Journey Starts Now!',
            html: welcomeEmailHtml,
          }),
        })

        if (!resendResponse.ok) {
          throw new Error(`Resend API error: ${resendResponse.status}`)
        }

        const resendData = await resendResponse.json()
        console.log('Welcome email sent via Resend:', resendData.id)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Welcome email sent successfully via Resend',
          emailId: resendData.id
        })
      } catch (resendError) {
        console.error('Resend email error:', resendError)
        // Fall through to other methods or return error
      }
    }
    
    // Option 2: Using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: email, name: displayName }],
              subject: '🚀 Welcome to A2Z Sellr - Your Journey Starts Now!'
            }],
            from: { 
              email: process.env.FROM_EMAIL || 'welcome@a2zsellr.com',
              name: 'A2Z Sellr Team'
            },
            content: [{
              type: 'text/html',
              value: welcomeEmailHtml
            }]
          }),
        })

        if (sendGridResponse.ok) {
          console.log('Welcome email sent via SendGrid')
          return NextResponse.json({ 
            success: true, 
            message: 'Welcome email sent successfully via SendGrid'
          })
        }
      } catch (sendGridError) {
        console.error('SendGrid email error:', sendGridError)
      }
    }
    
    // Option 3: Log to database for manual sending or batch processing
    try {
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          to_name: displayName,
          subject: '🚀 Welcome to A2Z Sellr - Your Journey Starts Now!',
          html_content: welcomeEmailHtml,
          email_type: 'welcome',
          status: 'pending',
          metadata: { selectedPlan },
          created_at: new Date().toISOString()
        })

      if (!error) {
        console.log('Welcome email queued in database for:', email)
        return NextResponse.json({
          success: true,
          message: 'Welcome email queued successfully'
        })
      } else {
        console.warn('Database error queuing email:', error.message)
        // Fall through to logging option
      }
    } catch (dbError) {
      console.warn('Could not queue email in database (table may not exist):', dbError)
      // Fall through to logging option
    }
    
    // Fallback: Just log the email (for development/testing)
    console.log('Welcome email logged for:', email, '- Email service not available, check Resend API key configuration')

    return NextResponse.json({
      success: true,
      message: 'Welcome email logged (email service not available - check Resend configuration)',
      email: email,
      displayName: displayName,
      selectedPlan: selectedPlan
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}