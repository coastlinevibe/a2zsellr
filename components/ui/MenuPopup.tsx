'use client'

import { useState } from 'react'
import { X, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  url: string
  name?: string
  order?: number
}

interface MenuPopupProps {
  isOpen: boolean
  onClose: () => void
  menuImages?: MenuItem[]
  businessName?: string
}

export function MenuPopup({ 
  isOpen, 
  onClose, 
  menuImages = [], 
  businessName 
}: MenuPopupProps) {
  if (!isOpen) return null

  // Handle single image or array
  const images = menuImages && menuImages.length > 0 ? menuImages : []
  const hasMenu = images.length > 0

  const renderMenuContent = () => {
    if (!hasMenu) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <ChefHat className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500">No menu available</p>
        </div>
      )
    }

    // For single image, display it prominently (scroll-only, no click)
    if (images.length === 1) {
      const menuItem = images[0]
      return (
        <div className="flex justify-center">
          <div className="relative max-w-2xl">
            <div className="overflow-hidden rounded-lg bg-gray-100 shadow-lg">
              <img
                src={menuItem.url}
                alt={menuItem.name || 'Menu'}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
            {menuItem.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                <p className="text-white text-lg font-medium text-center">
                  {menuItem.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // For multiple images, use grid layout (scroll-only, no click)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((item, index) => (
          <div
            key={item.id}
            className="relative group"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={item.url}
                alt={item.name || `Menu item ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {item.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                <p className="text-white text-sm font-medium truncate">
                  {item.name}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Main Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {businessName ? `${businessName} - Menu` : 'Menu'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {renderMenuContent()}
          </div>
        </div>
      </div>


    </>
  )
}