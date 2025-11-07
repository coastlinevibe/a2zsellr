'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link, 
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eraser
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  maxLength = 1000,
  className = "" 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)

  // Clean up malformed HTML
  const cleanHTML = useCallback((html: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // Remove nested links
    const links = tempDiv.querySelectorAll('a a')
    links.forEach(nestedLink => {
      const parent = nestedLink.parentElement
      if (parent && parent.tagName === 'A') {
        // Replace nested link with just text
        nestedLink.replaceWith(nestedLink.textContent || '')
      }
    })
    
    // Remove empty tags and clean up structure
    const emptyTags = tempDiv.querySelectorAll('*:empty:not(br):not(img):not(hr)')
    emptyTags.forEach(tag => tag.remove())
    
    // Remove font tags and replace with spans
    const fontTags = tempDiv.querySelectorAll('font')
    fontTags.forEach(font => {
      const span = document.createElement('span')
      const color = font.getAttribute('color')
      const size = font.getAttribute('size')
      
      if (color) span.style.color = color
      if (size) {
        const sizeMap: {[key: string]: string} = {
          '1': '12px', '2': '14px', '3': '16px', 
          '4': '18px', '5': '19px'
        }
        span.style.fontSize = sizeMap[size] || '16px'
      }
      
      span.innerHTML = font.innerHTML
      font.replaceWith(span)
    })
    
    // Remove nested lists and complex structures
    const nestedLists = tempDiv.querySelectorAll('ul ul, ol ol, li ul, li ol')
    nestedLists.forEach(list => {
      const textContent = list.textContent || ''
      if (textContent.trim()) {
        list.replaceWith(document.createTextNode(textContent))
      } else {
        list.remove()
      }
    })
    
    // Clean up excessive nesting
    const complexElements = tempDiv.querySelectorAll('div[style*="text-align"] ul li ul li')
    complexElements.forEach(el => {
      const textContent = el.textContent || ''
      if (textContent.trim()) {
        el.replaceWith(document.createTextNode(textContent))
      }
    })
    
    return tempDiv.innerHTML
  }, [])

  // Sync value with contentEditable div (only when not actively editing)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      // Only update if the editor is not focused (prevents cursor jumping during typing)
      if (editorRef.current.innerHTML !== value) {
        const cleanedValue = value ? cleanHTML(value) : value
        editorRef.current.innerHTML = cleanedValue
      }
    }
  }, [value, cleanHTML])

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return
    
    // Focus the editor first
    editorRef.current.focus()
    
    // Use execCommand for formatting
    try {
      document.execCommand(command, false, value)
    } catch (error) {
      console.warn('execCommand failed:', command, error)
    }
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      const textContent = editorRef.current.textContent || ''
      
      if (textContent.length <= maxLength) {
        // Pass content directly without cleaning on every keystroke
        // Cleaning will happen on blur or when needed
        onChange(content)
      } else {
        // Prevent further input if too long
        const selection = window.getSelection()
        const range = selection?.getRangeAt(0)
        
        // Restore content to last valid state
        editorRef.current.innerHTML = value
        
        // Restore cursor position
        if (range && selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }, [onChange, maxLength, value])

  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      // Clean the HTML when user finishes editing
      const content = editorRef.current.innerHTML
      const cleanedContent = cleanHTML(content)
      if (cleanedContent !== content) {
        editorRef.current.innerHTML = cleanedContent
        onChange(cleanedContent)
      }
    }
  }, [onChange, cleanHTML])

  const insertLink = () => {
    if (linkUrl && savedSelection && editorRef.current) {
      // Restore the saved selection
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelection)
        
        // Get the selected text
        const selectedText = savedSelection.toString()
        
        if (selectedText) {
          // Create link with selected text
          const linkHTML = `<a href="${linkUrl}" target="_blank">${selectedText}</a>`
          savedSelection.deleteContents()
          savedSelection.insertNode(savedSelection.createContextualFragment(linkHTML))
        } else {
          // Insert link with URL as text
          const linkHTML = `<a href="${linkUrl}" target="_blank">${linkUrl}</a>`
          savedSelection.insertNode(savedSelection.createContextualFragment(linkHTML))
        }
        
        // Update the content
        onChange(editorRef.current.innerHTML)
      }
      
      setLinkUrl('')
      setShowLinkDialog(false)
      setSavedSelection(null)
    }
  }

  const getTextLength = () => {
    return editorRef.current?.textContent?.length || 0
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if clicked element is a link
    if (target.tagName === 'A') {
      e.preventDefault()
      const href = target.getAttribute('href')
      if (href) {
        // Open link in new tab
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    }
  }, [])

  const cleanCurrentContent = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      const cleanedContent = cleanHTML(currentContent)
      editorRef.current.innerHTML = cleanedContent
      onChange(cleanedContent)
    }
  }, [cleanHTML, onChange])

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
    { command: 'undo', icon: Undo, title: 'Undo' },
    { command: 'redo', icon: Redo, title: 'Redo' },
  ]

  const colors = ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        {toolbarButtons.map((button) => {
          const IconComponent = button.icon
          return (
            <button
              key={button.command}
              type="button"
              onClick={() => executeCommand(button.command)}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title={button.title}
            >
              <IconComponent className="w-4 h-4 text-gray-600" />
            </button>
          )
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size */}
        <select
          onChange={(e) => executeCommand('fontSize', e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
          defaultValue="3"
        >
          <option value="1">12px</option>
          <option value="2">14px</option>
          <option value="3">16px</option>
          <option value="4">18px</option>
          <option value="5">19px</option>
        </select>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-gray-600" />
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => executeCommand('foreColor', color)}
              className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Text color: ${color}`}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            // Save the current selection before opening dialog
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0).cloneRange()
              setSavedSelection(range)
            }
            setShowLinkDialog(true)
          }}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4 text-gray-600" />
        </button>

        {/* Clean Content */}
        <button
          type="button"
          onClick={cleanCurrentContent}
          className="p-1.5 rounded hover:bg-red-100 transition-colors"
          title="Clean HTML formatting"
        >
          <Eraser className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          onClick={handleClick}
          className="min-h-[120px] p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
          style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.5',
            direction: 'ltr',
            textAlign: 'left'
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
        
        {/* Character Counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
          <span className={getTextLength() > maxLength * 0.9 ? 'text-amber-600' : getTextLength() > maxLength ? 'text-red-600' : ''}>
            {getTextLength()}/{maxLength}
          </span>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80">
            <h3 className="font-medium mb-3">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  insertLink()
                }
              }}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                  setSavedSelection(null)
                }}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 500;
          border-bottom: 1px solid #3b82f6;
          padding: 1px 2px;
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
          background-color: #eff6ff;
          border-bottom: 2px solid #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }
        [contenteditable] a:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] strike {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}
