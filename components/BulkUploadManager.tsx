'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Users, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function BulkUploadManager() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    // TODO: Implement upload logic
    setTimeout(() => {
      setUploading(false)
      setResults({ success: true, profiles: 0, products: 0 })
    }, 2000)
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

          {/* Upload Button */}
          {file && (
            <motion.button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl border-4 border-black font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              whileHover={{ scale: uploading ? 1 : 1.02 }}
              whileTap={{ scale: uploading ? 1 : 0.98 }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block mr-3"></div>
                  PROCESSING UPLOAD...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 inline-block mr-3" />
                  START BULK UPLOAD
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div 
          className="bg-green-100 p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-black text-black uppercase">UPLOAD COMPLETE</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        </motion.div>
      )}
    </motion.div>
  )
}
