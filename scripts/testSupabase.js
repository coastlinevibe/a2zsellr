// Test script for Supabase connection
// Run with: node scripts/testSupabase.js

const { testConnection, listTables, queryTable, getTableSchema } = require('../lib/supabaseTest.ts')
const { db } = require('../lib/supabaseHelper.ts')

async function runTests() {
  console.log('🚀 Starting Supabase Connection Tests\n')
  
  // Test 1: Basic connection
  console.log('=== Test 1: Connection Test ===')
  const connectionResult = await testConnection()
  console.log('Result:', connectionResult)
  console.log('')
  
  // Test 2: List available tables
  console.log('=== Test 2: List Tables ===')
  const tablesResult = await listTables()
  console.log('Result:', tablesResult)
  console.log('')
  
  if (tablesResult.success && tablesResult.tables.length > 0) {
    const firstTable = tablesResult.tables[0]
    
    // Test 3: Query first table
    console.log(`=== Test 3: Query ${firstTable} ===`)
    const queryResult = await queryTable(firstTable, 5)
    console.log('Result:', queryResult)
    console.log('')
    
    // Test 4: Get table schema
    console.log(`=== Test 4: ${firstTable} Schema ===`)
    const schemaResult = await getTableSchema(firstTable)
    console.log('Result:', schemaResult)
    console.log('')
    
    // Test 5: Use helper functions
    console.log(`=== Test 5: Helper Functions ===`)
    const helperResult = await db.getAll(firstTable, 3)
    console.log('Helper Result:', helperResult)
    console.log('')
    
    const infoResult = await db.info(firstTable)
    console.log('Table Info:', infoResult)
  }
  
  console.log('✅ All tests completed!')
}

// Run the tests
runTests().catch(console.error)
