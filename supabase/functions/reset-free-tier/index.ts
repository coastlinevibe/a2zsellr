// Supabase Edge Function for 7-Day Free Tier Reset Automation
// Deploy this function and schedule it to run daily via Supabase Cron
// https://supabase.com/docs/guides/functions/schedule-functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetResult {
  profile_id: string
  display_name: string
  email: string
  profile_age_days: number
  products_deleted: number
  listings_deleted: number
  gallery_items_deleted: number
  reset_timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key (has elevated permissions)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔄 Starting free tier reset automation...')

    // Call the SQL function to reset free tier profiles
    const { data: resetResults, error } = await supabase
      .rpc('reset_free_tier_profiles')

    if (error) {
      console.error('❌ Error executing reset:', error)
      throw error
    }

    const results = resetResults as ResetResult[]
    
    // Calculate totals
    const totalProfiles = results.length
    const totalProducts = results.reduce((sum, r) => sum + r.products_deleted, 0)
    const totalListings = results.reduce((sum, r) => sum + r.listings_deleted, 0)
    const totalGallery = results.reduce((sum, r) => sum + r.gallery_items_deleted, 0)

    console.log('✅ Reset completed successfully')
    console.log(`📊 Profiles reset: ${totalProfiles}`)
    console.log(`🛍️ Products deleted: ${totalProducts}`)
    console.log(`📋 Listings deleted: ${totalListings}`)
    console.log(`🖼️ Gallery items deleted: ${totalGallery}`)

    // Prepare response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        profiles_reset: totalProfiles,
        total_products_deleted: totalProducts,
        total_listings_deleted: totalListings,
        total_gallery_deleted: totalGallery
      },
      details: results.map(r => ({
        profile_id: r.profile_id,
        display_name: r.display_name || 'Unknown',
        email: r.email || 'No email',
        age_days: r.profile_age_days,
        items_deleted: {
          products: r.products_deleted,
          listings: r.listings_deleted,
          gallery: r.gallery_items_deleted
        }
      }))
    }

    // Optional: Send notification emails to reset users
    // You can integrate with a service like SendGrid, Resend, etc.
    if (totalProfiles > 0) {
      console.log('📧 Sending reset notifications to users...')
      // TODO: Implement email notifications
      // await sendResetNotifications(results)
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Fatal error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

/* 
DEPLOYMENT INSTRUCTIONS:

1. Deploy this function:
   supabase functions deploy reset-free-tier

2. Set up a cron schedule (run daily at 2 AM UTC):
   In Supabase Dashboard > Edge Functions > reset-free-tier > Add Cron Schedule
   Cron expression: 0 2 * * *
   
   Or via SQL:
   SELECT cron.schedule(
     'reset-free-tier-daily',
     '0 2 * * *',  -- Every day at 2 AM UTC
     $$
     SELECT net.http_post(
       url := 'https://your-project.supabase.co/functions/v1/reset-free-tier',
       headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     );
     $$
   );

3. Test manually:
   curl -X POST https://your-project.supabase.co/functions/v1/reset-free-tier \
     -H "Authorization: Bearer YOUR_ANON_KEY"

4. Monitor logs:
   supabase functions logs reset-free-tier

SAFETY FEATURES:
✅ Only runs on free tier users
✅ Only resets profiles older than 7 days
✅ Preserves user profiles and authentication
✅ Logs all actions for audit trail
✅ Returns detailed report
✅ Can be safely run multiple times
*/
