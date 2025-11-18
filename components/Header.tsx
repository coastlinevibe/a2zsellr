'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export function Header() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
    
    // Show welcome banner only on landing page (/)
    if (pathname === '/') {
      setShowWelcome(true)
    } else {
      setShowWelcome(false)
    }
  }, [pathname])

  const handleSignUp = () => {
    router.push('/auth/signup-animated')
  }

  const handleLogin = () => {
    router.push('/auth/login-animated')
  }

  if (!isClient || !showWelcome) {
    return null
  }

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-300 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.9)]"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              className="text-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🎉
            </motion.div>
            <div className="bg-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
              <p className="text-xs font-black text-black uppercase">
                WELCOME TO S.A's PREMIUM SELLER DIRECTORY! JOIN THOUSANDS OF MEMBERS SHOWING & SHARING THEIR PRODUCTS AND SERVICES.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 max-md:flex-wrap">
2            <button 
              onClick={handleSignUp}
              style={{
                background: '#5cbdfd',
                fontFamily: 'inherit',
                padding: '0.4em 0.9em',
                fontWeight: 900,
                fontSize: '12px',
                border: '3px solid black',
                borderRadius: '0.4em',
                boxShadow: '0.1em 0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
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
              SIGN UP FOR FREE TRIAL
            </button>
            <button 
              onClick={handleLogin}
              style={{
                background: '#5cbdfd',
                fontFamily: 'inherit',
                padding: '0.4em 0.9em',
                fontWeight: 900,
                fontSize: '12px',
                border: '3px solid black',
                borderRadius: '0.4em',
                boxShadow: '0.1em 0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
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
              LOG IN
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
