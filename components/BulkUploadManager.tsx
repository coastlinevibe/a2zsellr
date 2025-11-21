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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    }
  }

  const handlePreview = async () => {
    if (!file) return
    
    setUploading(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
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
    if (!file) return
    
    setUploading(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('confirmed', 'true')
      
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
        
        {/* Default Credentials Info */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
          <h4 className="font-black text-blue-800 mb-2">🔐 DEFAULT LOGIN CREDENTIALS</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Password:</strong> 123456 (for all bulk uploaded users)</p>
            <p><strong>Email:</strong> Auto-generated if missing (e.g., businessname@example.com)</p>
            <p><strong>Phone:</strong> +27 81 234 5678 (if missing)</p>
            <p><strong>Rating:</strong> 4.5 stars (default for new businesses)</p>
            <p><strong>Tier:</strong> Premium subscription activated</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* File Upload */}
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

          {/* Preview Button */}
          {file && !showPreview && (
            <motion.button
              onClick={handlePreview}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl border-4 border-black font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              whileHover={{ scale: uploading ? 1 : 1.02 }}
              whileTap={{ scale: uploading ? 1 : 0.98 }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block mr-3"></div>
                  PROCESSING PREVIEW...
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">PROFILES</p>
              <p className="text-2xl font-black text-blue-600">{previewData.totalCount}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">PRODUCTS</p>
              <p className="text-2xl font-black text-green-600">{previewData.expectedProducts}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
              <p className="font-black text-black text-sm">TIER</p>
              <p className="text-lg font-black text-purple-600">PREMIUM</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-2 border-black mb-4 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left font-black p-2">Business Name</th>
                  <th className="text-left font-black p-2">Phone</th>
                  <th className="text-left font-black p-2">Website</th>
                  <th className="text-left font-black p-2">Location</th>
                  <th className="text-left font-black p-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {previewData.profiles?.slice(0, 5).map((profile: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2 font-bold">{profile.display_name}</td>
                    <td className="p-2">{profile.phone_number || 'N/A'}</td>
                    <td className="p-2 text-xs">{profile.website_url || 'N/A'}</td>
                    <td className="p-2">{profile.city}, {profile.province}</td>
                    <td className="p-2">{profile.business_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.profiles?.length > 5 && (
              <p className="text-center text-gray-600 mt-2">
                ...and {previewData.profiles.length - 5} more profiles
              </p>
            )}
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
              <div className="grid grid-cols-2 gap-4 mb-4">
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
              <p className="font-bold text-red-600 mb-2">Error: {results.error}</p>
              {results.details && (
                <p className="text-sm text-gray-600">Details: {results.details}</p>
              )}
            </div>
          )}
          
          {results.errors && results.errors.length > 0 && (
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg border-2 border-black">
              <p className="font-bold text-yellow-800 mb-2">Validation Warnings:</p>
              <ul className="text-sm text-yellow-700">
                {results.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
