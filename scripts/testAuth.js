// Test Authentication System
// Run with: node scripts/testAuth.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dcfgdlwhixdruyewywly.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'
);

async function runAuthTests() {
  console.log('🚀 Starting Authentication Tests\n');
  
  try {
    // Test 1: Check existing profiles
    console.log('=== Test 1: Check Existing Profiles ===');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, email, subscription_tier, created_at')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${existingProfiles.length} existing profiles`);
      existingProfiles.forEach((profile, i) => {
        console.log(`  ${i+1}. ${profile.display_name || 'No name'} (${profile.email || 'No email'}) - ${profile.subscription_tier}`);
      });
    }
    console.log('');
    
    // Test 2: Test Sign Up
    console.log('=== Test 2: Test User Sign Up ===');
    const testEmail = `testuser${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log(`Attempting to sign up: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User ' + Date.now()
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      console.log('Error details:', JSON.stringify(signUpError, null, 2));
    } else {
      console.log('✅ Sign up successful!');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Test 3: Check if profile was created
      if (signUpData.user) {
        console.log('\n=== Test 3: Check Profile Creation ===');
        
        // Wait for trigger to execute
        console.log('Waiting 3 seconds for profile creation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();
        
        if (newProfileError) {
          console.log('❌ Profile not found:', newProfileError.message);
          
          // Try to create profile manually
          console.log('Attempting to create profile manually...');
          const { data: manualProfile, error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              display_name: 'Test User Manual',
              email: testEmail,
              subscription_tier: 'free',
              subscription_status: 'active',
              verified_seller: false,
              is_active: true,
              current_listings: 0
            })
            .select()
            .single();
          
          if (manualError) {
            console.log('❌ Manual profile creation failed:', manualError.message);
          } else {
            console.log('✅ Profile created manually!');
            console.log('Profile:', manualProfile);
          }
        } else {
          console.log('✅ Profile created automatically!');
          console.log('Profile details:');
          console.log('  ID:', newProfile.id);
          console.log('  Name:', newProfile.display_name);
          console.log('  Email:', newProfile.email);
          console.log('  Tier:', newProfile.subscription_tier);
          console.log('  Active:', newProfile.is_active);
        }
      }
    }
    
    // Test 4: Test Sign In (if sign up was successful)
    if (signUpData && signUpData.user && !signUpError) {
      console.log('\n=== Test 4: Test Sign In ===');
      
      // Sign out first
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
      } else {
        console.log('✅ Sign in successful!');
        console.log('Session active:', signInData.session ? 'Yes' : 'No');
        
        // Test profile access while signed in
        const { data: profileAccess, error: accessError } = await supabase
          .from('profiles')
          .select('display_name, email, subscription_tier')
          .eq('id', signInData.user.id)
          .single();
        
        if (accessError) {
          console.log('❌ Profile access failed:', accessError.message);
        } else {
          console.log('✅ Profile accessible while signed in!');
          console.log('Profile:', profileAccess);
        }
      }
    }
    
    console.log('\n🎉 Authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runAuthTests();
