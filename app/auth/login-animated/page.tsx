'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', data.user.id)
            .single()

          if (profile && profile.subscription_tier && profile.subscription_tier !== 'free') {
            router.push('/profile')
          } else {
            router.push('/dashboard')
          }
        } catch (profileError) {
          console.warn('Profile lookup failed after login:', profileError)
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResetLoading(true)
    setError('')
    setResetMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setResetMessage('Password reset email sent! Check your inbox.')
      }
    } catch (err) {
      setError('Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(45deg, #00000015 25%, transparent 25%), linear-gradient(-45deg, #00000015 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000015 75%), linear-gradient(-45deg, transparent 75%, #00000015 75%)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px"
        }} />
      </div>
      
      {/* Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-black font-black"
        style={{
          background: '#5cbdfd',
          fontFamily: 'inherit',
          padding: '0.6em 1.3em',
          fontWeight: 900,
          fontSize: '18px',
          border: '3px solid black',
          borderRadius: '0.4em',
          boxShadow: '0.1em 0.1em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
          e.currentTarget.style.boxShadow = '0.15em 0.15em';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = '0.1em 0.1em';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
          e.currentTarget.style.boxShadow = '0.05em 0.05em';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
          e.currentTarget.style.boxShadow = '0.15em 0.15em';
        }}
      >
        <Home className="h-5 w-5" />
        <span>HOME</span>
      </Link>
      
      <div className="relative z-10 w-full px-4 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-8 transform rotate-1"
          initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-4 transform -rotate-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-black uppercase">WELCOME BACK!</h1>
              <p className="text-sm font-bold mt-1">ACCESS YOUR SELLER DASHBOARD</p>
            </motion.div>
            <motion.p 
              className="text-black font-bold text-sm bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              🚀 GROW YOUR ONLINE SALES WITH A2Z SELLR! 🚀
            </motion.p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-400 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-black font-bold text-sm">⚠️ {error}</p>
            </motion.div>
          )}

          {/* Reset Message */}
          {resetMessage && (
            <motion.div 
              className="mb-6 p-4 bg-green-400 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-black font-bold text-sm">✅ {resetMessage}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Email Field */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-blue-500 p-1 rounded border border-black">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-bold text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-purple-500 p-1 rounded border border-black">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-purple-500 outline-none font-bold text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded border border-black hover:bg-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                </motion.button>
              </div>
            </div>

            {/* Login and Forgot Password Buttons */}
            <div className="flex justify-center items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.6em 1.3em',
                  fontWeight: 900,
                  fontSize: '18px',
                  border: '3px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5em'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }
                }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetLoading}
                style={{
                  background: '#ff6b6b',
                  fontFamily: 'inherit',
                  padding: '0.6em 1em',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '2px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: resetLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: resetLoading ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3em'
                }}
                onMouseEnter={(e) => {
                  if (!resetLoading) {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  if (!resetLoading) {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }
                }}
                onMouseUp={(e) => {
                  if (!resetLoading) {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }
                }}
              >
                {resetLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  'FORGOT PASSWORD?'
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer Links */}
          <motion.div 
            className="mt-8 text-center space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-black font-bold text-sm">
              DON'T HAVE AN ACCOUNT?{' '}
              <Link
                href="/auth/signup-animated"
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.6em 1.3em',
                  fontWeight: 900,
                  fontSize: '15px',
                  border: '3px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block',
                  marginLeft: '0.5em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                  e.currentTarget.style.boxShadow = '0.05em 0.05em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
              >
                SIGN UP
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
