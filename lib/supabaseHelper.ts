import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const SUPABASE_URL = 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

// Create Supabase client for helper functions
export const helperSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export class SupabaseHelper {
  private client = helperSupabase

  // Generic query function
  async query(sql: string, params?: any[]) {
    try {
      const { data, error } = await this.client.rpc('execute_sql', { 
        query: sql, 
        params: params || [] 
      })
      
      if (error) {
        console.error('SQL Query Error:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Query execution error:', err)
      return { success: false, error: err }
    }
  }

  // Get all records from a table
  async getAll(tableName: string, limit: number = 100) {
    try {
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .limit(limit)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data, count: data?.length || 0 }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Get records with filters
  async getWhere(tableName: string, filters: Record<string, any>, limit: number = 100) {
    try {
      let query = this.client.from(tableName).select('*')
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query.limit(limit)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data, count: data?.length || 0 }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Insert new record
  async insert(tableName: string, record: Record<string, any>) {
    try {
      const { data, error } = await this.client
        .from(tableName)
        .insert(record)
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Update records
  async update(tableName: string, filters: Record<string, any>, updates: Record<string, any>) {
    try {
      let query = this.client.from(tableName).update(updates)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query.select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Delete records
  async delete(tableName: string, filters: Record<string, any>) {
    try {
      let query = this.client.from(tableName).delete()
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query.select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Count records
  async count(tableName: string, filters?: Record<string, any>) {
    try {
      let query = this.client.from(tableName).select('*', { count: 'exact', head: true })
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { count, error } = await query
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, count }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Get table structure
  async getTableInfo(tableName: string) {
    try {
      // Get a sample record to understand structure
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const columns = data && data.length > 0 ? Object.keys(data[0]) : []
      const sampleData = data && data.length > 0 ? data[0] : null
      
      return { 
        success: true, 
        columns, 
        sampleData,
        columnCount: columns.length 
      }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Search across text fields
  async search(tableName: string, searchTerm: string, columns: string[], limit: number = 50) {
    try {
      let query = this.client.from(tableName).select('*')
      
      // Build OR conditions for text search
      const orConditions = columns.map(col => `${col}.ilike.%${searchTerm}%`).join(',')
      query = query.or(orConditions)
      
      const { data, error } = await query.limit(limit)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data, count: data?.length || 0 }
    } catch (err) {
      return { success: false, error: err }
    }
  }
}

// Create a singleton instance
export const dbHelper = new SupabaseHelper()

// Convenience functions
export const db = {
  getAll: (table: string, limit?: number) => dbHelper.getAll(table, limit),
  getWhere: (table: string, filters: Record<string, any>, limit?: number) => dbHelper.getWhere(table, filters, limit),
  insert: (table: string, record: Record<string, any>) => dbHelper.insert(table, record),
  update: (table: string, filters: Record<string, any>, updates: Record<string, any>) => dbHelper.update(table, filters, updates),
  delete: (table: string, filters: Record<string, any>) => dbHelper.delete(table, filters),
  count: (table: string, filters?: Record<string, any>) => dbHelper.count(table, filters),
  info: (table: string) => dbHelper.getTableInfo(table),
  search: (table: string, term: string, columns: string[], limit?: number) => dbHelper.search(table, term, columns, limit)
}
