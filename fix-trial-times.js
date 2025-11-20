// Fix trial times for all free users - change from 5 minutes to 24 hours
// Run this in browser console where supabase is available

async function fixTrialTimes() {
  console.log('🔧 Fixing trial times for all free users...')
  
  try {
    // Get all free users
    const { data: freeUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, email, trial_end_date, subscription_tier')
      .eq('subscription_tier', 'free')
    
    if (fetchError) {
      console.error('❌ Error fetching free users:', fetchError)
      return
    }
    
    console.log(`📋 Found ${freeUsers?.length || 0} free users`)
    
    if (!freeUsers || freeUsers.length === 0) {
      console.log('✅ No free users found')
      return
    }
    
    // Show current trial times
    console.log('\n📊 Current trial times:')
    freeUsers.forEach(user => {
      const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null
      const timeRemaining = trialEnd ? trialEnd.getTime() - Date.now() : 0
      const minutesRemaining = Math.floor(timeRemaining / (1000 * 60))
      
      console.log(`   ${user.display_name}: ${minutesRemaining}m remaining`)
    })
    
    // Update all free users to have 24-hour trials
    const newTrialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        trial_end_date: newTrialEnd,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_tier', 'free')
    
    if (updateError) {
      console.error('❌ Error updating trial times:', updateError)
      return
    }
    
    console.log(`✅ Updated all ${freeUsers.length} free users to 24-hour trials`)
    console.log(`🕐 New trial end time: ${new Date(newTrialEnd).toLocaleString()}`)
    
    // Verify the changes
    const { data: updatedUsers } = await supabase
      .from('profiles')
      .select('display_name, trial_end_date')
      .eq('subscription_tier', 'free')
    
    console.log('\n📊 Updated trial times:')
    updatedUsers?.forEach(user => {
      const trialEnd = new Date(user.trial_end_date)
      const timeRemaining = trialEnd.getTime() - Date.now()
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      
      console.log(`   ${user.display_name}: ${hoursRemaining}h ${minutesRemaining}m remaining`)
    })
    
    console.log('\n🎉 Trial time fix complete! All free users now have 24-hour trials.')
    console.log('💡 Refresh the page to see the updated timer.')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the fix
fixTrialTimes()

console.log('🔧 Trial time fix script loaded')
console.log('📝 This will update all free users to have 24-hour trials instead of short testing intervals')