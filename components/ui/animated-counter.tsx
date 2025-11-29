'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  isLoading?: boolean
}

export function AnimatedCounter({ value, duration = 2, delay = 0, isLoading = false }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isLoading) {
      setDisplayValue(0)
      return
    }

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = (currentTime - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      setDisplayValue(Math.floor(value * progress))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrame)
    }
  }, [value, duration, delay, isLoading])

  if (isLoading) {
    return <span className="animate-pulse">...</span>
  }

  return <span>{displayValue.toLocaleString()}</span>
}
