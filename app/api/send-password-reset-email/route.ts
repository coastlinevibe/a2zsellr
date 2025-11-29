import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log(`Sending password reset email to ${email}`)

    // Use Supabase's built-in password reset with custom redirect
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a2zsellr.life'}/auth/reset-password`,
    })

    if (error) {
      console.error('Supabase password reset error:', error)

      // Fallback: Try to send custom email via Resend
      if (process.env.RESEND_API_KEY) {
        try {
          // Create a reset URL with a simple token (less secure but works)
          const resetToken = crypto.randomUUID()
          const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a2zsellr.life'}/auth/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`

          // Read the password reset email template
          let resetEmailHtml = ''
          try {
            const templatePath = join(process.cwd(), 'email-templates', 'password-reset.html')
            resetEmailHtml = readFileSync(templatePath, 'utf8')
            resetEmailHtml = resetEmailHtml.replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, resetUrl)
          } catch (templateError) {
            console.warn('Could not read password reset template:', templateError)
            // Use simple fallback HTML
            resetEmailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>Reset Your Password</h1>
                <p>We received a request to reset your password for A2Z Sellr.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            `
          }

          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.FROM_EMAIL || 'noreply@a2zsellr.com',
              to: [email],
              subject: '🔐 Reset Your A2Z Password',
              html: resetEmailHtml,
            }),
          })

          if (resendResponse.ok) {
            const resendData = await resendResponse.json()
            console.log('Password reset email sent via Resend fallback:', resendData.id)
            return NextResponse.json({
              success: true,
              message: 'Password reset email sent successfully'
            })
          }
        } catch (resendError) {
          console.error('Resend fallback failed:', resendError)
        }
      }

      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent via Supabase for:', email)
    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })

  } catch (error) {
    console.error('Error in password reset API:', error)
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    )
  }
}
