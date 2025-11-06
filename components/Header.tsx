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
                WELCOME TO SOUTH AFRICA'S PREMIUM BUSINESS DIRECTORY! JOIN THOUSANDS OF BUSINESSES GROWING THEIR REACH.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 max-md:flex-wrap">
            <motion.button 
              onClick={handleSignUp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.9)",
                x: 2,
                y: -2
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              SIGN UP FOR FREE TRIAL
            </motion.button>
            <motion.button 
              onClick={handleLogin}
              className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-xs font-black transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.9)",
                x: 2,
                y: -2
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              LOG IN
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
