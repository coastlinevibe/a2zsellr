'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signUp: async () => ({ error: null })
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    // If signup successful, create profile manually and sign out to prevent auto-login
    if (!error && data.user) {
      try {
        // Wait a moment for user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              display_name: metadata?.display_name || email.split('@')[0],
              email: email,
              subscription_tier: metadata?.selected_plan || 'free',
              subscription_status: 'active',
              verified_seller: false,
              is_active: true,
              current_listings: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          )
        
        if (profileError) {
          console.warn('Profile creation failed:', profileError.message)
          // Don't fail the signup, just log the warning
        }

      } catch (profileErr) {
        console.warn('Profile creation error:', profileErr)
      }
    }
    
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
