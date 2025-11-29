'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Lock, Eye, EyeOff, CheckCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Handle the auth callback from the email link
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError('Invalid or expired reset link')
        return
      }

      if (!data.session) {
        setError('No active session found. Please request a new password reset.')
        return
      }
    }

    handleAuthCallback()
  }, [])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login-animated')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, #00000015 25%, transparent 25%), linear-gradient(-45deg, #00000015 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000015 75%), linear-gradient(-45deg, transparent 75%, #00000015 75%)",
            backgroundSize: "30px 30px",
            backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px"
          }} />
        </div>
        
        <div className="relative z-10 w-full px-4 flex items-center justify-center">
          <motion.div 
            className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            
            <h1 className="text-2xl font-black text-black mb-4 uppercase">
              PASSWORD UPDATED!
            </h1>
            
            <p className="text-black font-bold mb-6">
              Your password has been successfully updated. You will be redirected to the login page in a few seconds.
            </p>
            
            <Link
              href="/auth/login-animated"
              style={{
                background: '#5cbdfd',
                fontFamily: 'inherit',
                padding: '0.6em 1.3em',
                fontWeight: 900,
                fontSize: '16px',
                border: '3px solid black',
                borderRadius: '0.4em',
                boxShadow: '0.1em 0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: 'inherit',
                display: 'inline-block'
              }}
            >
              GO TO LOGIN
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-300 via-orange-300 to-yellow-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-4 transform -rotate-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-black uppercase">RESET PASSWORD</h1>
              <p className="text-sm font-bold mt-1">CREATE A NEW SECURE PASSWORD</p>
            </motion.div>
            <motion.p 
              className="text-black font-bold text-sm bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              🔒 CHOOSE A STRONG PASSWORD FOR YOUR ACCOUNT 🔒
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

          {/* Reset Form */}
          <motion.form 
            onSubmit={handlePasswordReset} 
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                NEW PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-red-500 p-1 rounded border border-black">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-red-500 outline-none font-bold text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  placeholder="Enter new password"
                  required
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-orange-500 p-1 rounded border border-black">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-orange-500 outline-none font-bold text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded border border-black hover:bg-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                </motion.button>
              </div>
            </div>

            {/* Update Password Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#ff6b6b',
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
                  'UPDATE PASSWORD'
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer Links */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-black font-bold text-sm">
              REMEMBER YOUR PASSWORD?{' '}
              <Link
                href="/auth/login-animated"
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
              >
                BACK TO LOGIN
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}