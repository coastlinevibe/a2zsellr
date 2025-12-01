import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const resendApiKey = Deno.env.get("RESEND_API_KEY")!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    const { record, old_record } = await req.json()

    // Only process if status changed from 'scheduled' to 'active'
    if (old_record?.status !== "scheduled" || record?.status !== "active") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    console.log(`📧 Listing activated: ${record.title}`)

    // Get profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("id", record.profile_id)
      .single()

    if (profileError || !profile?.email) {
      console.error("Profile not found:", profileError)
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 400 })
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "notifications@a2zsellr.life",
        to: [profile.email],
        subject: `🚀 Your Listing "${record.title}" is Now Active!`,
        html: generateEmail(profile.display_name, record.title),
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.json()
      console.error("Resend error:", error)
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 })
    }

    const result = await emailResponse.json()
    console.log(`✅ Email sent to ${profile.email}`)

    return new Response(JSON.stringify({ success: true, emailId: result.id }), { status: 200 })
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

function generateEmail(displayName: string, listingTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #000; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #000; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; }
          .content { padding: 30px 20px; }
          .listing-info { background: #f0fdf4; border: 2px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .listing-title { font-size: 18px; font-weight: bold; color: #059669; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; border: 2px solid #000; font-weight: bold; margin-top: 15px; }
          .footer { background: #f5f5f5; border-top: 2px solid #e5e5e5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
            <p>Your listing is now live and ready to be shared with your customers!</p>
            <a href="https://www.a2zsellr.life/dashboard/listings" class="cta-button">View Your Listing</a>
          </div>
          <div class="footer">
            <p>© 2025 A2Z Sellr. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
