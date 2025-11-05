'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, User, X, Check, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnimatedProfilePictureProps {
  avatarUrl: string
  previewUrl: string | null
  uploading: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageUpload: () => void
  onAvatarUrlChange: (url: string) => void
  selectedFile: File | null
}

export default function AnimatedProfilePicture({
  avatarUrl,
  previewUrl,
  uploading,
  onFileSelect,
  onImageUpload,
  onAvatarUrlChange,
  selectedFile
}: AnimatedProfilePictureProps) {
  const [dragOver, setDragOver] = useState(false)
  const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        // Create a synthetic event for the file input
        const fileList = new DataTransfer()
        fileList.items.add(file)
        const syntheticEvent = {
          target: { files: fileList.files }
        } as unknown as React.ChangeEvent<HTMLInputElement>
        onFileSelect(syntheticEvent)
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Current Avatar Display */}
      <AnimatePresence mode="wait">
        {(previewUrl || avatarUrl) && (
          <motion.div
            key={previewUrl || avatarUrl}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="relative"
          >
            <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
              {/* Avatar Container */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl"
                >
                  <img 
                    src={previewUrl || avatarUrl} 
                    alt="Profile picture" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>

                {/* Status Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-2 -right-2"
                >
                  {previewUrl ? (
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Status Text */}
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {previewUrl ? 'Ready to Upload' : 'Current Profile Picture'}
                </h4>
                <p className="text-sm text-gray-600">
                  {previewUrl 
                    ? 'Click "Upload" to save this image to your profile' 
                    : 'This is your current profile picture'
                  }
                </p>
              </motion.div>

              {/* Upload Button for Preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    onClick={onImageUpload}
                    disabled={uploading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Method Selector */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Profile Picture</h4>
          </div>
          <p className="text-sm text-gray-600 mt-1">Upload an image or provide a URL</p>
        </div>

        {/* Method Toggle */}
        <div className="p-6 space-y-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'upload', label: 'Upload File', icon: Upload },
              { id: 'url', label: 'Image URL', icon: LinkIcon }
            ].map((method) => {
              const Icon = method.icon
              return (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputMethod(method.id as 'upload' | 'url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === method.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </motion.button>
              )
            })}
          </div>

          {/* Upload Method */}
          <AnimatePresence mode="wait">
            {inputMethod === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Drag & Drop Area */}
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileSelect}
                    disabled={uploading}
                  />
                  
                  <motion.div
                    animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-emerald-600" />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {dragOver ? 'Drop your image here' : 'Upload Profile Picture'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Drag and drop an image file, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports: JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </motion.div>

                  {/* Loading Overlay */}
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl"
                    >
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Selected File Info */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-emerald-900">{selectedFile.name}</p>
                          <p className="text-sm text-emerald-700">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* URL Method */}
            {inputMethod === 'url' && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => onAvatarUrlChange(e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a direct link to an image file
                  </p>
                </div>

                {/* URL Preview */}
                {avatarUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                      <img 
                        src={avatarUrl} 
                        alt="URL preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
