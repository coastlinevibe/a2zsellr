'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Users, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function BulkUploadManager() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium' | 'business'>('premium')
  const [productImageAssignments, setProductImageAssignments] = useState<{[key: number]: File}>({})
  const [galleryImage, setGalleryImage] = useState<File | null>(null)
  const [defaultProducts, setDefaultProducts] = useState<any[]>([])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      
      // Load default products for the first business category found in CSV
      try {
        const csvText = await selectedFile.text()
        const lines = csvText.trim().split('\n')
        if (lines.length > 1) {
          const firstDataLine = lines[1].split(',')
          const category = firstDataLine[0]?.trim() || 'butchery'
          
          // Fetch default products for this category
          const response = await fetch('/api/admin/get-default-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category })
          })
          
          if (response.ok) {
            const data = await response.json()
            setDefaultProducts(data.products || [])
          }
        }
      } catch (error) {
        console.error('Error loading default products:', error)
        // Set fallback products
        setDefaultProducts([
          { name: 'Product 1', description: 'Quality product', price_cents: 5000 },
          { name: 'Product 2', description: 'Premium service', price_cents: 7500 },
          { name: 'Product 3', description: 'Essential item', price_cents: 3500 },
          { name: 'Product 4', description: 'Popular choice', price_cents: 4500 },
          { name: 'Product 5', description: 'Special offer', price_cents: 6000 },
          { name: 'Product 6', description: 'Value package', price_cents: 8000 },
          { name: 'Product 7', description: 'Premium option', price_cents: 9500 },
          { name: 'Product 8', description: 'Standard service', price_cents: 4000 },
          { name: 'Product 9', description: 'Deluxe package', price_cents: 12000 },
          { name: 'Product 10', description: 'Basic option', price_cents: 2500 }
        ])
      }
    }
  }

  const handleProductImageAssign = (productIndex: number, file: File | null) => {
    if (file) {
      setProductImageAssignments(prev => ({
        ...prev,
        [productIndex]: file
      }))
    } else {
      setProductImageAssignments(prev => {
        const newAssignments = { ...prev }
        delete newAssignments[productIndex]
        return newAssignments
      })
    }
  }

  const handleGalleryImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setGalleryImage(selectedFile)
    }
  }

  const handlePreview = async () => {
    if (!file || Object.keys(productImageAssignments).length !== 10 || !galleryImage) return
    
    setUploading(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add product images in order
      for (let i = 0; i < 10; i++) {
        if (productImageAssignments[i]) {
          formData.append(`productImage${i}`, productImageAssignments[i])
        }
      }
      
      // Add gallery image
      formData.append('galleryImage', galleryImage)
      
      const response = await fetch('/api/admin/bulk-upload/preview', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setPreviewData(result.preview)
        setShowPreview(true)
      } else {
        setResults({
          success: false,
          error: result.error || 'Preview failed',
          details: result.details || null
        })
      }
    } catch (error) {
      console.error('Preview error:', error)
      setResults({
        success: false,
        error: 'Network error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!file || Object.keys(productImageAssignments).length !== 10 || !galleryImage) return
    
    setUploading(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('confirmed', 'true')
      formData.append('tier', selectedTier)
      
      // Add product images in order
      for (let i = 0; i < 10; i++) {
        if (productImageAssignments[i]) {
          formData.append(`productImage${i}`, productImageAssignments[i])
        }
      }
      
      // Add gallery image
      formData.append('galleryImage', galleryImage)
      
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setResults({
          success: true,
          profiles: result.results?.profilesCreated || 0,
          products: result.results?.productsCreated || 0,
          gallery: result.results?.galleryCreated || 0,
          errors: result.results?.errors || null
        })
        setShowPreview(false)
      } else {
        setResults({
          success: false,
          error: result.error || 'Upload failed',
          details: result.details || null
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResults({
        success: false,
        error: 'Network error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.6 }
            }}
          >
            <Upload className="w-12 h-12 text-white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase">BULK PROFILE UPLOAD</h2>
            <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
              UPLOAD 300+ PROFILES WITH AUTO PRODUCTS
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Interface */}
      <motion.div 
        className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-8 transform rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-2xl font-black text-black mb-6 uppercase">CSV FILE UPLOAD</h3>
        
        {/* CSV Format Info */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
          <h4 className="font-black text-green-800 mb-2">📋 SUPPORTED CSV FORMATS</h4>
          <div className="text-sm text-green-700">
            <p><strong>Required columns:</strong> Keyword, Company Name, Address, Location, Website, Contact No, Email, Facebook Page URL</p>
            <p><strong>Alternative format:</strong> display_name, address, city, province, website_url, phone_number, email, business_category</p>
            <p><strong>Separators:</strong> Comma (,), Semicolon (;), or Tab supported</p>
          </div>
        </div>

        {/* Default Credentials Info */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
          <h4 className="font-black text-blue-800 mb-2">🔐 DEFAULT DATA & CREDENTIALS</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Password:</strong> 123456 (for all bulk uploaded users)</p>
            <p><strong>Email:</strong> Auto-generated if missing (e.g., businessname@example.com)</p>
            <p><strong>Phone:</strong> +27 81 234 5678 (if missing)</p>
            <p><strong>Social Media:</strong> Auto-generated Facebook, Instagram, Twitter, LinkedIn URLs</p>
            <p><strong>Rating:</strong> 4.5 stars (default for new businesses)</p>
            <p><strong>Tier:</strong> Selectable in preview (Free/Premium/Business)</p>
            <p><strong>Images:</strong> 10 product images + 1 gallery image per profile</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* CSV File Upload */}
          <div className="border-4 border-dashed border-black rounded-xl p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-bold text-black mb-2">
                {file ? file.name : 'Select CSV File'}
              </p>
              <p className="text-gray-600">
                Upload your business profiles CSV file
              </p>
            </label>
          </div>

          {/* Product Images Assignment */}
          {file && (
            <div className="border-4 border-dashed border-green-500 rounded-xl p-6">
              <h4 className="text-xl font-black text-black mb-4 uppercase">📦 ASSIGN PRODUCT IMAGES</h4>
              <p className="text-gray-600 mb-4">Assign specific images to each of the 10 products that will be created for every profile</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultProducts.map((product, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-2 border-black">
                    <div className="flex items-start gap-4">
                      {/* Product Info */}
                      <div className="flex-1">
                        <h5 className="font-black text-black text-sm">{index + 1}. {product.name}</h5>
                        <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                        <p className="text-xs font-bold text-green-600">R{(product.price_cents / 100).toFixed(2)}</p>
                      </div>
                      
                      {/* Image Assignment */}
                      <div className="flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProductImageAssign(index, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`product-image-${index}`}
                        />
                        <label htmlFor={`product-image-${index}`} className="cursor-pointer block">
                          {productImageAssignments[index] ? (
                            <div className="relative">
                              <img 
                                src={URL.createObjectURL(productImageAssignments[index])} 
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded border-2 border-green-500"
                              />
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-black">
                  Images assigned: {Object.keys(productImageAssignments).length} / 10
                </p>
              </div>
            </div>
          )}

          {/* Gallery Image Upload */}
          <div className="border-4 border-dashed border-blue-500 rounded-xl p-6">
            <h4 className="text-xl font-black text-black mb-4 uppercase">🖼️ GALLERY IMAGE (1 Required)</h4>
            <input
              type="file"
              accept="image/*"
              onChange={handleGalleryImageSelect}
              className="hidden"
              id="gallery-image-upload"
            />
            <label htmlFor="gallery-image-upload" className="cursor-pointer block">
              <div className="text-center">
                <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-bold text-black">
                  {galleryImage ? galleryImage.name : 'Select Gallery Image'}
                </p>
                <p className="text-gray-600">This image will be added to all profiles' galleries</p>
              </div>
            </label>
            
            {galleryImage && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={URL.createObjectURL(galleryImage)} 
                  alt="Gallery preview"
                  className="w-32 h-24 object-cover rounded border-2 border-black"
                />
              </div>
            )}
          </div>

          {/* Preview Button */}
          {file && !showPreview && (
            <motion.button
              onClick={handlePreview}
              disabled={uploading || Object.keys(productImageAssignments).length !== 10 || !galleryImage}
              className={`w-full px-8 py-4 rounded-xl border-4 border-black font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] ${
                Object.keys(productImageAssignments).length === 10 && galleryImage 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              whileHover={{ scale: (uploading || Object.keys(productImageAssignments).length !== 10 || !galleryImage) ? 1 : 1.02 }}
              whileTap={{ scale: (uploading || Object.keys(productImageAssignments).length !== 10 || !galleryImage) ? 1 : 0.98 }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block mr-3"></div>
                  PROCESSING PREVIEW...
                </>
              ) : Object.keys(productImageAssignments).length !== 10 ? (
                <>
                  <FileText className="w-6 h-6 inline-block mr-3" />
                  ASSIGN {10 - Object.keys(productImageAssignments).length} MORE PRODUCT IMAGES
                </>
              ) : !galleryImage ? (
                <>
                  <FileText className="w-6 h-6 inline-block mr-3" />
                  NEED GALLERY IMAGE
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 inline-block mr-3" />
                  PREVIEW DATA
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Preview Section */}
      {showPreview && previewData && (
        <motion.div 
          className="bg-yellow-100 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-2xl font-black text-black mb-4 uppercase">PREVIEW DATA</h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">PROFILES</p>
              <p className="text-2xl font-black text-blue-600">{previewData.totalCount}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">PRODUCTS</p>
              <p className="text-2xl font-black text-green-600">{previewData.expectedProducts}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">GALLERY</p>
              <p className="text-2xl font-black text-orange-600">{previewData.totalCount}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">TIER</p>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as any)}
                className="text-lg font-black text-purple-600 bg-transparent border-2 border-purple-600 rounded px-2 py-1 uppercase cursor-pointer"
              >
                <option value="free">FREE</option>
                <option value="premium">PREMIUM</option>
                <option value="business">BUSINESS</option>
              </select>
            </div>
          </div>
          
          {/* Profile Data Table */}
          <div className="bg-white p-4 rounded-lg border-2 border-black mb-4 max-h-96 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-black">
                  <th className="text-left font-black p-2 whitespace-nowrap">Business Name</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Email</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Phone</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Address</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">City</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Province</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Website</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Category</th>
                  <th className="text-left font-black p-2 whitespace-nowrap">Facebook</th>
                </tr>
              </thead>
              <tbody>
                {previewData.profiles?.map((profile: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-yellow-50">
                    <td className="p-2 font-bold whitespace-nowrap">{profile.display_name}</td>
                    <td className="p-2 text-xs">{profile.email || 'Auto-generated'}</td>
                    <td className="p-2">{profile.phone_number || '+27 81 234 5678'}</td>
                    <td className="p-2 text-xs max-w-xs truncate" title={profile.address}>{profile.address || 'N/A'}</td>
                    <td className="p-2">{profile.city || 'N/A'}</td>
                    <td className="p-2">{profile.province || 'N/A'}</td>
                    <td className="p-2 text-xs max-w-xs truncate" title={profile.website_url}>{profile.website_url || 'Auto-generated'}</td>
                    <td className="p-2">
                      <span className="bg-blue-100 px-2 py-1 rounded border border-blue-300 text-xs font-bold">
                        {profile.business_category}
                      </span>
                    </td>
                    <td className="p-2 text-xs max-w-xs truncate" title={profile.facebook_url}>{profile.facebook_url || 'Auto-generated'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.profiles?.length > 10 && (
              <p className="text-center text-gray-600 mt-2 font-bold">
                Showing all {previewData.profiles.length} profiles
              </p>
            )}
          </div>

          {/* Images Preview */}
          <div className="bg-white p-4 rounded-lg border-2 border-black mb-4">
            <h4 className="font-black text-black mb-3 uppercase">📸 IMAGES TO BE USED</h4>
            
            {/* Product Images */}
            <div className="mb-4">
              <h5 className="font-bold text-black mb-2">Product Images (10):</h5>
              <div className="grid grid-cols-5 gap-4">
                {defaultProducts.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded border border-black">
                    <div className="text-center mb-2">
                      {productImageAssignments[index] ? (
                        <img 
                          src={URL.createObjectURL(productImageAssignments[index])} 
                          alt={product.name}
                          className="w-full h-16 object-cover rounded border border-green-500"
                        />
                      ) : (
                        <div className="w-full h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-center">{index + 1}. {product.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Image */}
            <div>
              <h5 className="font-bold text-black mb-2">Gallery Image (1):</h5>
              {galleryImage && (
                <img 
                  src={URL.createObjectURL(galleryImage)} 
                  alt="Gallery"
                  className="w-32 h-24 object-cover rounded border-2 border-black"
                />
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              onClick={handleConfirmUpload}
              disabled={uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              whileHover={{ scale: uploading ? 1 : 1.02 }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                  CREATING PROFILES...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 inline-block mr-2" />
                  CONFIRM & CREATE
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ scale: 1.02 }}
            >
              CANCEL
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results && (
        <motion.div 
          className={`p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${
            results.success ? 'bg-green-100' : 'bg-red-100'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-4">
            {results.success ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
            <h3 className="text-2xl font-black text-black uppercase">
              {results.success ? 'UPLOAD COMPLETE' : 'UPLOAD FAILED'}
            </h3>
          </div>
          
          {results.success ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                  <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-black text-black">PROFILES CREATED</p>
                  <p className="text-2xl font-black text-indigo-600">{results.profiles}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                  <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-black text-black">PRODUCTS CREATED</p>
                  <p className="text-2xl font-black text-purple-600">{results.products}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-black text-black">GALLERY IMAGES</p>
                  <p className="text-2xl font-black text-green-600">{results.gallery || 0}</p>
                </div>
              </div>
              
              {/* Authentication Results */}
              {(results.authCreated || results.authFailed) && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <h4 className="font-black text-green-800 mb-2">🔐 AUTHENTICATION STATUS</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="font-bold text-green-700">Login Accounts Created</p>
                      <p className="text-xl font-black text-green-600">{results.authCreated || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-red-700">Auth Failed</p>
                      <p className="text-xl font-black text-red-600">{results.authFailed || 0}</p>
                    </div>
                  </div>
                  {results.defaultPassword && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <p className="text-sm text-green-700">
                        <strong>Default Password:</strong> {results.defaultPassword}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Users can login with their email and this password
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-black">
              <p className="font-bold text-red-600 mb-2">Error: {typeof results.error === 'string' ? results.error : JSON.stringify(results.error)}</p>
              {results.details && (
                <p className="text-sm text-gray-600">Details: {typeof results.details === 'string' ? results.details : JSON.stringify(results.details)}</p>
              )}
            </div>
          )}
          
          {results.errors && results.errors.length > 0 && (
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg border-2 border-black">
              <p className="font-bold text-yellow-800 mb-2">Validation Warnings:</p>
              <ul className="text-sm text-yellow-700">
                {results.errors.map((error: any, index: number) => (
                  <li key={index}>• {typeof error === 'string' ? error : JSON.stringify(error)}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
