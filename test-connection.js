const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://dcfgdlwhixdruyewywly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnectionSpeed() {
  console.log('🔄 Testing Supabase connection speed...\n');
  
  const tests = [
    { name: 'Basic Connection Test', test: testBasicConnection },
    { name: 'Small Query Test', test: testSmallQuery },
    { name: 'Large Query Test', test: testLargeQuery },
    { name: 'Multiple Sequential Queries', test: testSequentialQueries },
    { name: 'Concurrent Queries Test', test: testConcurrentQueries }
  ];
  
  for (const { name, test } of tests) {
    console.log(`=== ${name} ===`);
    try {
      const startTime = Date.now();
      const result = await test();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${name}: ${duration}ms`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Failed - ${error.message}`);
    }
    console.log('');
  }
}

async function testBasicConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count(*)')
    .limit(1);
  
  if (error) throw error;
  return { details: 'Connection successful' };
}

async function testSmallQuery() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (error) throw error;
  return { details: `Retrieved ${data?.length || 0} records` };
}

async function testLargeQuery() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(100);
  
  if (error) throw error;
  return { details: `Retrieved ${data?.length || 0} records` };
}

async function testSequentialQueries() {
  const tables = ['profiles', 'products', 'categories'];
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(10);
      
      if (!error && data) {
        totalRecords += data.length;
      }
    } catch (e) {
      // Table might not exist, continue
    }
  }
  
  return { details: `Retrieved ${totalRecords} total records from ${tables.length} tables` };
}

async function testConcurrentQueries() {
  const tables = ['profiles', 'products', 'categories'];
  
  const promises = tables.map(async (table) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(10);
      
      return error ? 0 : (data?.length || 0);
    } catch (e) {
      return 0;
    }
  });
  
  const results = await Promise.all(promises);
  const totalRecords = results.reduce((sum, count) => sum + count, 0);
  
  return { details: `Retrieved ${totalRecords} total records concurrently` };
}

// Run the tests
testConnectionSpeed().catch(console.error);
