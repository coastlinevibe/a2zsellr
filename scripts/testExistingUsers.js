// Test with existing users for Free/Premium tier testing
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dcfgdlwhixdruyewywly.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'
);

async function testExistingUsers() {
  console.log('🧪 Testing with Existing Users for Free/Premium Tier Testing\n');
  
  // Get existing users
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (error) {
    console.log('❌ Error fetching profiles:', error.message);
    return;
  }
  
  console.log('✅ Available Test Users:');
  console.log('========================');
  
  profiles.forEach((profile, i) => {
    console.log(`${i + 1}. ${profile.display_name || 'No name'}`);
    console.log(`   Email: ${profile.email || 'No email'}`);
    console.log(`   Tier: ${profile.subscription_tier}`);
    console.log(`   Status: ${profile.subscription_status || 'N/A'}`);
    console.log(`   Active: ${profile.is_active}`);
    console.log(`   Listings: ${profile.current_listings}`);
    console.log(`   Verified: ${profile.verified_seller}`);
    console.log(`   Admin: ${profile.is_admin || false}`);
    console.log('');
  });
  
  // Test user categorization for testing
  console.log('🎯 Recommended Users for Testing:');
  console.log('=================================');
  
  const freeUsers = profiles.filter(p => p.subscription_tier === 'free');
  const premiumUsers = profiles.filter(p => p.subscription_tier === 'premium');
  const businessUsers = profiles.filter(p => p.subscription_tier === 'business');
  const adminUsers = profiles.filter(p => p.is_admin === true);
  
  console.log('FREE TIER TESTING:');
  freeUsers.forEach(user => {
    console.log(`  ✅ ${user.display_name} (${user.email})`);
    console.log(`     - Test 3 image limit, 5 product limit, 3 listing limit`);
    console.log(`     - Test 7-day reset system`);
    console.log(`     - Test sharing restrictions (Mon-Tue, Thu-Fri only)`);
  });
  
  console.log('\nPREMIUM TIER TESTING:');
  premiumUsers.forEach(user => {
    console.log(`  💎 ${user.display_name} (${user.email})`);
    console.log(`     - Test unlimited limits`);
    console.log(`     - Test e-commerce features`);
    console.log(`     - Test campaign management`);
    console.log(`     - Test enhanced gallery`);
  });
  
  if (businessUsers.length > 0) {
    console.log('\nBUSINESS TIER TESTING:');
    businessUsers.forEach(user => {
      console.log(`  🏢 ${user.display_name} (${user.email})`);
    });
  }
  
  if (adminUsers.length > 0) {
    console.log('\nADMIN TESTING:');
    adminUsers.forEach(user => {
      console.log(`  👑 ${user.display_name} (${user.email})`);
      console.log(`     - Test admin features`);
      console.log(`     - Test payment approvals`);
      console.log(`     - Test user management`);
    });
  }
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('==============');
  console.log('1. Use these existing users to test your Free/Premium features');
  console.log('2. Start with FREE tier testing checklist');
  console.log('3. Move to PREMIUM tier testing');
  console.log('4. Fix auth system later when you have database admin access');
  console.log('\n✅ Your database connection is working perfectly!');
  console.log('✅ All existing users can be used for comprehensive testing!');
}

testExistingUsers();
