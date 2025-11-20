import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function DELETE(request: NextRequest) {
  try {
    // Get the user from the request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = user.id

    console.log(`🗑️ Starting account deletion for user: ${userId}`)

    // Delete user data in the correct order (respecting foreign key constraints)
    
    // 1. Delete payment transactions
    const { error: transactionsError } = await supabase
      .from('payment_transactions')
      .delete()
      .eq('profile_id', userId)
    
    if (transactionsError) {
      console.error('Error deleting payment transactions:', transactionsError)
    } else {
      console.log('✅ Payment transactions deleted')
    }

    // 2. Delete referrals (both as referrer and referred)
    const { error: referralsError1 } = await supabase
      .from('referrals')
      .delete()
      .eq('referrer_id', userId)
    
    const { error: referralsError2 } = await supabase
      .from('referrals')
      .delete()
      .eq('referred_user_id', userId)
    
    if (referralsError1 || referralsError2) {
      console.error('Error deleting referrals:', referralsError1 || referralsError2)
    } else {
      console.log('✅ Referrals deleted')
    }

    // 3. Delete profile products
    const { error: productsError } = await supabase
      .from('profile_products')
      .delete()
      .eq('profile_id', userId)
    
    if (productsError) {
      console.error('Error deleting products:', productsError)
    } else {
      console.log('✅ Products deleted')
    }

    // 4. Delete profile listings
    const { error: listingsError } = await supabase
      .from('profile_listings')
      .delete()
      .eq('profile_id', userId)
    
    if (listingsError) {
      console.error('Error deleting listings:', listingsError)
    } else {
      console.log('✅ Listings deleted')
    }

    // 5. Delete profile gallery
    const { error: galleryError } = await supabase
      .from('profile_gallery')
      .delete()
      .eq('profile_id', userId)
    
    if (galleryError) {
      console.error('Error deleting gallery:', galleryError)
    } else {
      console.log('✅ Gallery deleted')
    }

    // 6. Delete profile analytics
    const { error: analyticsError } = await supabase
      .from('profile_analytics')
      .delete()
      .eq('profile_id', userId)
    
    if (analyticsError) {
      console.error('Error deleting analytics:', analyticsError)
    } else {
      console.log('✅ Analytics deleted')
    }

    // 7. Delete any email queue entries
    try {
      const { error: emailError } = await supabase
        .from('email_queue')
        .delete()
        .eq('to_email', user.email)
      
      if (emailError) {
        console.warn('Error deleting email queue (table might not exist):', emailError)
      } else {
        console.log('✅ Email queue deleted')
      }
    } catch (emailErr) {
      console.warn('Email queue table might not exist:', emailErr)
    }

    // 8. Delete the user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete profile data' },
        { status: 500 }
      )
    } else {
      console.log('✅ Profile deleted')
    }

    // 9. Delete user files from storage (avatar, product images, etc.)
    try {
      // Delete from profile storage bucket
      const { data: profileFiles } = await supabase.storage
        .from('profile')
        .list(`avatars`, {
          search: userId
        })
      
      if (profileFiles && profileFiles.length > 0) {
        const filesToDelete = profileFiles.map(file => `avatars/${file.name}`)
        await supabase.storage
          .from('profile')
          .remove(filesToDelete)
        console.log('✅ Profile files deleted')
      }

      // Delete from other storage buckets if they exist
      const { data: paymentFiles } = await supabase.storage
        .from('payment-proofs')
        .list(userId)
      
      if (paymentFiles && paymentFiles.length > 0) {
        const filesToDelete = paymentFiles.map(file => `${userId}/${file.name}`)
        await supabase.storage
          .from('payment-proofs')
          .remove(filesToDelete)
        console.log('✅ Payment proof files deleted')
      }
    } catch (storageError) {
      console.warn('Error deleting storage files:', storageError)
      // Don't fail the deletion for storage errors
    }

    // 10. Finally, delete the auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      )
    }

    console.log(`✅ Account deletion completed for user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}