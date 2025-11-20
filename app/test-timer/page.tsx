'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import TrialTimer from '@/components/TrialTimer'
import { checkTrialStatus, resetUserData } from '@/lib/trialManager'

export default function TestTimerPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleManualReset = async () => {
    if (!user) return
    
    const confirmed = confirm('Are you sure you want to manually reset your data? This will delete all products, listings, and gallery items.')
    if (!confirmed) return
    
    console.log('🔄 Manual reset triggered...')
    const success = await resetUserData(user.id)
    if (success) {
      alert('✅ Data reset successfully! Your trial has been extended by 5 minutes.')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      alert('❌ Failed to reset data. Please try again.')
    }
  }

  const handleForceReset = async () => {
    if (!user) return
    
    console.log('🚨 Force reset triggered...')
    
    // Force reset regardless of trial status
    const success = await resetUserData(user.id)
    if (success) {
      alert('✅ Force reset completed! All data cleared and trial extended.')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      alert('❌ Failed to force reset. Check console for errors.')
    }
  }

  const handleCheckStatus = async () => {
    if (!user) return
    
    const status = await checkTrialStatus(user.id)
    console.log('Trial Status:', status)
    alert(`Trial Status:\nExpired: ${status.isExpired}\nTime Remaining: ${status.timeRemaining}ms\nTrial End: ${status.trialEndDate}`)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Timer - Not Logged In</h1>
        <p>Please log in to test the timer functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Timer Test Page</h1>
      
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trial Timer (5 Minutes)</h2>
        <div className="mb-4">
          <TrialTimer userId={user.id} compact={false} />
        </div>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Compact Version:</h3>
          <TrialTimer userId={user.id} compact={true} />
        </div>
      </div>

      <div className="bg-gray-50 border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleCheckStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check Status
          </button>
          <button
            onClick={handleManualReset}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Manual Reset
          </button>
          <button
            onClick={handleForceReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🚨 FORCE RESET NOW
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">How It Works</h2>
        <ul className="list-disc list-inside space-y-2 text-yellow-700">
          <li>Free tier users get a 5-minute trial period</li>
          <li>When the timer reaches 0, all products, listings, and gallery items are automatically deleted</li>
          <li>The user profile information is preserved</li>
          <li>The trial is automatically extended by another 5 minutes after reset</li>
          <li>The timer updates every second for real-time countdown</li>
          <li>You can manually trigger a reset using the button above</li>
        </ul>
      </div>
    </div>
  )
}