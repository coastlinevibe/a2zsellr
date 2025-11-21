'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPopupProps {
  isOpen: boolean
  onClose: () => void
  videoUrl?: string
  videoType?: 'upload' | 'youtube'
  businessName?: string
}

export function VideoPopup({ 
  isOpen, 
  onClose, 
  videoUrl, 
  videoType, 
  businessName 
}: VideoPopupProps) {
  if (!isOpen) return null

  const renderVideo = () => {
    if (!videoUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <Play className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500">No video available</p>
        </div>
      )
    }

    if (videoType === 'youtube') {
      // Extract YouTube video ID from URL
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : null
      }

      const videoId = getYouTubeId(videoUrl)
      if (videoId) {
        return (
          <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Business Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }

    // For uploaded videos
    return (
      <video
        className="w-full h-auto max-h-96 rounded-lg"
        controls
        autoPlay
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {businessName ? `${businessName} - Business Video` : 'Business Video'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Content */}
        <div className="p-6">
          {renderVideo()}
        </div>
      </div>
    </div>
  )
}