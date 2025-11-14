const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://dcfgdlwhixdruyewywly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function analyzePerformance() {
  console.log('🔍 A2Z Business Directory - Performance Analysis\n');
  console.log('='.repeat(60));
  
  const results = {
    connectionSpeed: null,
    queryPerformance: {},
    indexAnalysis: {},
    recommendations: []
  };

  // Test 1: Basic Connection Speed
  console.log('\n📡 Testing Connection Speed...');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    const connectionTime = Date.now() - startTime;
    results.connectionSpeed = connectionTime;
    
    if (connectionTime > 1000) {
      console.log(`❌ SLOW CONNECTION: ${connectionTime}ms (Expected: <500ms)`);
      results.recommendations.push('Connection is slow - check network or Supabase region');
    } else if (connectionTime > 500) {
      console.log(`⚠️  MODERATE CONNECTION: ${connectionTime}ms (Expected: <500ms)`);
      results.recommendations.push('Connection could be faster - consider optimizations');
    } else {
      console.log(`✅ GOOD CONNECTION: ${connectionTime}ms`);
    }
  } catch (error) {
    console.log(`❌ CONNECTION FAILED: ${error.message}`);
    results.recommendations.push('Connection failed - check credentials and network');
  }

  // Test 2: Query Performance Analysis
  console.log('\n📊 Analyzing Query Performance...');
  
  const queries = [
    {
      name: 'Simple Profile Query',
      query: () => supabase.from('profiles').select('*').limit(10),
      expectedTime: 300
    },
    {
      name: 'Profile with Gallery Join',
      query: () => supabase
        .from('profiles')
        .select(`
          *,
          gallery_images:profile_gallery(
            id,
            image_url,
            caption
          )
        `)
        .limit(10),
      expectedTime: 800
    },
    {
      name: 'Recent Activities with Join',
      query: () => supabase
        .from('profile_products')
        .select(`
          id,
          name,
          created_at,
          profile_id,
          profiles(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(15),
      expectedTime: 600
    },
    {
      name: 'Business Search Query',
      query: () => supabase
        .from('profiles')
        .select(`
          *,
          gallery_images:profile_gallery(
            id,
            image_url,
            caption
          )
        `)
        .eq('is_active', true)
        .in('subscription_tier', ['free', 'premium', 'business'])
        .not('display_name', 'is', null)
        .order('verified_seller', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(24),
      expectedTime: 1000
    },
    {
      name: 'Categories Query',
      query: () => supabase.from('categories').select('*').order('name'),
      expectedTime: 200
    },
    {
      name: 'Locations Query',
      query: () => supabase.from('locations').select('*').order('city'),
      expectedTime: 200
    }
  ];

  for (const test of queries) {
    try {
      const startTime = Date.now();
      const { data, error } = await test.query();
      const queryTime = Date.now() - startTime;
      
      results.queryPerformance[test.name] = {
        time: queryTime,
        recordCount: data?.length || 0,
        status: error ? 'error' : 'success'
      };

      if (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        results.recommendations.push(`Fix error in ${test.name}: ${error.message}`);
      } else if (queryTime > test.expectedTime * 2) {
        console.log(`❌ ${test.name}: VERY SLOW - ${queryTime}ms (Expected: <${test.expectedTime}ms, Records: ${data?.length || 0})`);
        results.recommendations.push(`${test.name} is very slow - needs optimization`);
      } else if (queryTime > test.expectedTime) {
        console.log(`⚠️  ${test.name}: SLOW - ${queryTime}ms (Expected: <${test.expectedTime}ms, Records: ${data?.length || 0})`);
        results.recommendations.push(`${test.name} could be faster - consider indexing`);
      } else {
        console.log(`✅ ${test.name}: GOOD - ${queryTime}ms (Records: ${data?.length || 0})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      results.recommendations.push(`${test.name} failed - check query structure`);
    }
  }

  // Test 3: Table Size Analysis
  console.log('\n📈 Analyzing Table Sizes...');
  
  const tables = ['profiles', 'profile_products', 'profile_gallery', 'categories', 'locations', 'profile_analytics'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      } else {
        console.log(`📊 ${table}: ${count} records`);
        
        if (count > 10000) {
          results.recommendations.push(`${table} has ${count} records - consider pagination and indexing`);
        }
      }
    } catch (error) {
      console.log(`❌ ${table}: FAILED - ${error.message}`);
    }
  }

  // Test 4: Concurrent Query Performance
  console.log('\n🔄 Testing Concurrent Query Performance...');
  
  try {
    const startTime = Date.now();
    const promises = [
      supabase.from('profiles').select('*').limit(5),
      supabase.from('categories').select('*'),
      supabase.from('locations').select('*'),
      supabase.from('profile_products').select('*').limit(10)
    ];
    
    const results_concurrent = await Promise.all(promises);
    const concurrentTime = Date.now() - startTime;
    
    console.log(`✅ Concurrent Queries: ${concurrentTime}ms`);
    
    if (concurrentTime > 2000) {
      results.recommendations.push('Concurrent queries are slow - check connection pooling');
    }
  } catch (error) {
    console.log(`❌ Concurrent Queries: FAILED - ${error.message}`);
    results.recommendations.push('Concurrent queries failed - check connection limits');
  }

  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📋 PERFORMANCE ANALYSIS REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🎯 KEY FINDINGS:');
  if (results.recommendations.length === 0) {
    console.log('✅ No major performance issues detected!');
  } else {
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  console.log('\n🚀 OPTIMIZATION RECOMMENDATIONS:');
  console.log('1. Implement query caching for frequently accessed data');
  console.log('2. Add database indexes on commonly filtered columns');
  console.log('3. Use connection pooling for better resource management');
  console.log('4. Implement pagination for large result sets');
  console.log('5. Consider using Supabase Edge Functions for complex queries');
  console.log('6. Optimize image loading with lazy loading and compression');
  console.log('7. Use React.memo and useMemo for expensive computations');
  
  console.log('\n📊 PERFORMANCE SUMMARY:');
  console.log(`Connection Speed: ${results.connectionSpeed}ms`);
  Object.entries(results.queryPerformance).forEach(([name, data]) => {
    console.log(`${name}: ${data.time}ms (${data.recordCount} records)`);
  });

  return results;
}

// Run the analysis
analyzePerformance().catch(console.error);
