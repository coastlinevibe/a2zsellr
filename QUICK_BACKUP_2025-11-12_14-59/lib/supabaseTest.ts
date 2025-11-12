import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials - use environment variables in production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

// Create a test client
export const testSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test connection function
export async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await testSupabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Connection successful!')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Connection error:', err)
    return { success: false, error: err }
  }
}

// Get all tables function
export async function listTables() {
  try {
    const { data, error } = await testSupabase
      .rpc('get_table_names')
    
    if (error) {
      console.log('📋 Attempting to list some common tables...')
      // Try common table names
      const commonTables = ['profiles', 'products', 'orders', 'categories', 'locations']
      const results = []
      
      for (const table of commonTables) {
        try {
          const { error: tableError } = await testSupabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (!tableError) {
            results.push(table)
          }
        } catch (e) {
          // Table doesn't exist, continue
        }
      }
      
      return { success: true, tables: results }
    }
    
    return { success: true, tables: data }
  } catch (err) {
    console.error('Error listing tables:', err)
    return { success: false, error: err }
  }
}

// Query any table
export async function queryTable(tableName: string, limit: number = 10) {
  try {
    console.log(`🔍 Querying table: ${tableName}`)
    
    const { data, error } = await testSupabase
      .from(tableName)
      .select('*')
      .limit(limit)
    
    if (error) {
      console.error(`❌ Query failed for ${tableName}:`, error.message)
      return { success: false, error: error.message }
    }
    
    console.log(`✅ Found ${data?.length || 0} records in ${tableName}`)
    return { success: true, data, count: data?.length || 0 }
  } catch (err) {
    console.error(`Error querying ${tableName}:`, err)
    return { success: false, error: err }
  }
}

// Get table schema
export async function getTableSchema(tableName: string) {
  try {
    const { data, error } = await testSupabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      return { success: true, columns }
    }
    
    return { success: true, columns: [] }
  } catch (err) {
    return { success: false, error: err }
  }
}

// Comprehensive test runner
export async function runAllTests() {
  console.log('🚀 Starting comprehensive Supabase tests...\n')
  
  // Test 1: Connection
  console.log('=== Test 1: Connection ===')
  const connectionResult = await testConnection()
  console.log('Result:', connectionResult)
  console.log('')
  
  if (!connectionResult.success) {
    console.log('❌ Connection failed. Stopping tests.')
    return { success: false, error: 'Connection failed' }
  }
  
  // Test 2: List Tables
  console.log('=== Test 2: List Tables ===')
  const tablesResult = await listTables()
  console.log('Result:', tablesResult)
  console.log('')
  
  if (tablesResult.success && tablesResult.tables) {
    // Test 3: Query each table
    console.log('=== Test 3: Query Tables ===')
    for (const table of tablesResult.tables) {
      console.log(`--- Querying ${table} ---`)
      const queryResult = await queryTable(table, 3)
      console.log(`${table}:`, queryResult.success ? `${queryResult.count} records` : queryResult.error)
      
      if (queryResult.success) {
        const schemaResult = await getTableSchema(table)
        console.log(`${table} columns:`, schemaResult.success ? schemaResult.columns : 'Unable to get schema')
      }
      console.log('')
    }
  }
  
  console.log('✅ All tests completed!')
  return { success: true }
}
