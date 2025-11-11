'use client'

import React, { useState } from 'react'
import { Edit, MousePointer, Plus, Upload } from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface InteractiveElement {
  id: string
  x: number // Percentage (0-100)
  y: number // Percentage (0-100)
  type: 'product' | 'cta' | 'info' | 'custom'
  action: string
  data: any
  width?: number
  height?: number
}

interface Template {
  id: string
  name: string
  content?: string // HTML content (optional for image templates)
  style?: string // CSS styles (optional for image templates)
  interactions: InteractiveElement[]
  category: string
  backgroundImage?: string // URL of uploaded background image
}

interface CustomTemplateLayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
  selectedTemplate?: Template
  isEditMode?: boolean
  onInteractionAdd?: (element: InteractiveElement) => void
  onInteractionEdit?: (id: string, element: InteractiveElement) => void
}

export const CustomTemplateLayout: React.FC<CustomTemplateLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName,
  ratingAverage,
  ratingCount,
  deliveryAvailable,
  selectedTemplate,
  isEditMode = false,
  onInteractionAdd,
  onInteractionEdit
}) => {
  const [hoveredInteraction, setHoveredInteraction] = useState<string | null>(null)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeDirection, setResizeDirection] = useState<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
  const rafIdRef = React.useRef<number | null>(null)
  const pendingUpdateRef = React.useRef<(() => void) | null>(null)

  // Clear modal when edit mode changes
  React.useEffect(() => {
    if (!isEditMode) {
      setShowAddInteraction(false)
      setClickPosition(null)
      setIsDragging(null)
      setIsResizing(null)
    }
  }, [isEditMode])

  // Ultra-smooth requestAnimationFrame-based throttling
  const scheduleUpdate = React.useCallback((updateFn: () => void) => {
    // Cancel any pending update
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }
    
    // Store the latest update function
    pendingUpdateRef.current = updateFn
    
    // Schedule the update for the next frame
    rafIdRef.current = requestAnimationFrame(() => {
      if (pendingUpdateRef.current) {
        pendingUpdateRef.current()
        pendingUpdateRef.current = null
      }
      rafIdRef.current = null
    })
  }, [])

  // Handle mouse move for drag and resize (ultra-smooth with rAF)
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!selectedTemplate || !selectedTemplate.interactions || (!isDragging && !isResizing)) return

    const clientX = e.clientX
    const clientY = e.clientY
    const rect = e.currentTarget.getBoundingClientRect()

    // Schedule the update for the next animation frame
    scheduleUpdate(() => {
      if (isDragging) {
        const interaction = selectedTemplate.interactions.find(i => i.id === isDragging)
        if (interaction) {
          const x = ((clientX - rect.left) / rect.width) * 100
          const y = ((clientY - rect.top) / rect.height) * 100
          interaction.x = Math.max(5, Math.min(95, x))
          interaction.y = Math.max(5, Math.min(95, y))
        }
      }

      if (isResizing && dragStart && resizeDirection) {
        const interaction = selectedTemplate.interactions.find(i => i.id === isResizing)
        if (interaction) {
          const deltaX = clientX - dragStart.x
          const deltaY = clientY - dragStart.y
          const currentWidth = interaction.width || 120
          const currentHeight = interaction.height || 40
          
          // Handle all 8 resize directions with smooth performance
          switch (resizeDirection) {
            case 'e': // East (right)
              interaction.width = Math.max(60, Math.min(400, currentWidth + deltaX))
              break
            case 'w': // West (left)
              interaction.width = Math.max(60, Math.min(400, currentWidth - deltaX))
              interaction.x = Math.max(5, Math.min(95, interaction.x + (deltaX / rect.width) * 100))
              break
            case 's': // South (bottom)
              interaction.height = Math.max(30, Math.min(120, currentHeight + deltaY))
              break
            case 'n': // North (top)
              interaction.height = Math.max(30, Math.min(120, currentHeight - deltaY))
              interaction.y = Math.max(5, Math.min(95, interaction.y + (deltaY / rect.height) * 100))
              break
            case 'se': // Southeast (bottom-right)
              interaction.width = Math.max(60, Math.min(400, currentWidth + deltaX))
              interaction.height = Math.max(30, Math.min(120, currentHeight + deltaY))
              break
            case 'sw': // Southwest (bottom-left)
              interaction.width = Math.max(60, Math.min(400, currentWidth - deltaX))
              interaction.height = Math.max(30, Math.min(120, currentHeight + deltaY))
              interaction.x = Math.max(5, Math.min(95, interaction.x + (deltaX / rect.width) * 100))
              break
            case 'ne': // Northeast (top-right)
              interaction.width = Math.max(60, Math.min(400, currentWidth + deltaX))
              interaction.height = Math.max(30, Math.min(120, currentHeight - deltaY))
              interaction.y = Math.max(5, Math.min(95, interaction.y + (deltaY / rect.height) * 100))
              break
            case 'nw': // Northwest (top-left)
              interaction.width = Math.max(60, Math.min(400, currentWidth - deltaX))
              interaction.height = Math.max(30, Math.min(120, currentHeight - deltaY))
              interaction.x = Math.max(5, Math.min(95, interaction.x + (deltaX / rect.width) * 100))
              interaction.y = Math.max(5, Math.min(95, interaction.y + (deltaY / rect.height) * 100))
              break
          }
        }
      }
    })
  }, [isDragging, isResizing, resizeDirection, selectedTemplate, dragStart, scheduleUpdate])

  // Handle mouse up with cleanup
  const handleMouseUp = React.useCallback(() => {
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingUpdateRef.current = null
    
    setIsDragging(null)
    setIsResizing(null)
    setDragStart(null)
    setResizeDirection(null)
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // Debug logging
  console.log('CustomTemplateLayout received:', { selectedTemplate, backgroundImage: selectedTemplate?.backgroundImage })

  // If no template selected, show upload prompt
  if (!selectedTemplate?.backgroundImage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Upload Template Image</p>
          <p className="text-sm">Select an image to use as your template background</p>
        </div>
      </div>
    )
  }

  const template = selectedTemplate

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isEditMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    console.log('Canvas clicked at:', { x, y })
    setClickPosition({ x, y })
    setShowAddInteraction(true)
  }

  const handleAddCTA = () => {
    if (!clickPosition) return

    // Only allow one CTA button
    if (selectedTemplate && selectedTemplate.interactions && selectedTemplate.interactions.length > 0) {
      alert('Only one CTA button is allowed. Delete the existing one first.')
      setShowAddInteraction(false)
      setClickPosition(null)
      return
    }

    const newCTA: InteractiveElement = {
      id: `cta-${Date.now()}`,
      x: clickPosition.x,
      y: clickPosition.y,
      type: 'cta',
      action: 'contact',
      data: { label: 'Contact Us' },
      width: 120,
      height: 40
    }

    console.log('Adding CTA:', newCTA)
    
    // Add to template interactions directly
    if (selectedTemplate) {
      selectedTemplate.interactions = selectedTemplate.interactions || []
      selectedTemplate.interactions.push(newCTA)
    }

    // Also call the callback if provided
    if (onInteractionAdd) {
      onInteractionAdd(newCTA)
    }

    // Clear the modal
    setShowAddInteraction(false)
    setClickPosition(null)
  }

  return (
    <div 
      className="w-full relative cursor-pointer mx-auto select-none"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'none',
        backgroundColor: template.backgroundImage ? '#f8f9fa' : '#f3f4f6',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '800px',
        maxWidth: '700px',
        margin: '0 auto',
        padding: 0,
        userSelect: 'none'
      }}
    >
          {/* Debug info overlay */}
          {!template.backgroundImage && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm">No background image</p>
                <p className="text-xs">Template ID: {template.id}</p>
              </div>
            </div>
          )}
          
          {/* Show image URL for debugging */}
          {template.backgroundImage && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded max-w-xs truncate">
              IMG: {template.backgroundImage}
            </div>
          )}
      {/* Optional HTML content overlay */}
      {template.content && (
        <div 
          className="absolute inset-0"
          dangerouslySetInnerHTML={{ 
            __html: `
              <style>${template.style || ''}</style>
              ${template.content}
            `
          }}
        />
      )}

      {/* CTA Button Overlay - Hardware Accelerated */}
      {template.interactions.map((interaction) => (
          <div
            key={interaction.id}
            className={`absolute border-2 border-blue-500 bg-blue-600 text-white flex items-center justify-center font-medium text-sm select-none ${
              hoveredInteraction === interaction.id ? 'shadow-lg border-blue-400' : ''
            } ${isDragging === interaction.id ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: `${interaction.x}%`,
              top: `${interaction.y}%`,
              width: `${interaction.width || 120}px`,
              height: `${interaction.height || 40}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '6px',
              userSelect: 'none',
              // Hardware acceleration for ultra-smooth performance
              willChange: isDragging === interaction.id || isResizing === interaction.id ? 'transform, width, height' : 'auto',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              transformStyle: 'preserve-3d',
              // Smooth transitions only when not actively dragging/resizing
              transition: isDragging === interaction.id || isResizing === interaction.id ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredInteraction(interaction.id)}
            onMouseLeave={() => setHoveredInteraction(null)}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsDragging(interaction.id)
              setDragStart({ x: e.clientX, y: e.clientY })
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <span style={{ pointerEvents: 'none' }}>{interaction.data?.label || 'Contact Us'}</span>
            
            {/* Delete button */}
            {hoveredInteraction === interaction.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Remove the interaction
                  if (selectedTemplate) {
                    selectedTemplate.interactions = selectedTemplate.interactions.filter(i => i.id !== interaction.id)
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            )}
            
            {/* Professional Resize Handles - All 8 Directions */}
            {hoveredInteraction === interaction.id && (
              <>
                {/* Corner Handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" 
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('nw'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('ne'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('sw'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('se'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                
                {/* Side Handles */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 border border-white cursor-n-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('n'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 border border-white cursor-s-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('s'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-blue-500 border border-white cursor-w-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('w'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-blue-500 border border-white cursor-e-resize"
                     onMouseDown={(e) => { e.stopPropagation(); setIsResizing(interaction.id); setResizeDirection('e'); setDragStart({ x: e.clientX, y: e.clientY }); }}></div>
              </>
            )}
          </div>
        ))}

        {/* Edit Mode Overlay */}
        {isEditMode && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-400">
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
              EDIT MODE - Click to add interactions
            </div>
          </div>
        )}

        {/* Add Interaction Modal */}
        {showAddInteraction && clickPosition && (
          <div 
            className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3 z-10"
            style={{
              left: `${clickPosition.x}%`,
              top: `${clickPosition.y}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-bold">Add Interaction:</div>
              <button
                onClick={() => {
                  setShowAddInteraction(false)
                  setClickPosition(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCTA}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 font-medium"
              >
                Add CTA Button
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
