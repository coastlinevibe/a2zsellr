import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface StepProps {
  data: any
  setData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function WelcomeScreen({ username, onStart, onSkip, isReturning = false }: any) {
  if (isReturning) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] w-full max-w-md text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="text-5xl">👋</div>
            <div className="min-h-16 flex items-center justify-center">
              <h1 className="text-2xl sm:text-3xl font-black text-black break-words line-clamp-3">
                Welcome, {username}!
              </h1>
            </div>
            <p className="text-black font-bold text-sm sm:text-base leading-relaxed">
              You are being redirected to your dashboard...
            </p>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              ⏳
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] w-full max-w-md text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="text-5xl">👋</div>
          <div className="min-h-16 flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-black text-black break-words line-clamp-3">
              Welcome, {username}!
            </h1>
          </div>
          <p className="text-black font-bold text-sm sm:text-base leading-relaxed">
            Let's set up your business profile. A completed profile gets 3× more customer inquiries.
          </p>
          
          <div className="space-y-3 pt-4">
            <button
              onClick={onStart}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
            >
              ➡️ Start Setup
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function BusinessBasicsStep({ data, setData, onNext, onBack }: StepProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('name')
        
        if (error) {
          console.error('Error fetching categories:', error)
        } else {
          setCategories(categoriesData || [])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const isValid = data.displayName.trim() && data.description.trim().length >= 20 && data.category

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
    >
      <h2 className="text-3xl font-black text-black mb-2">Your Business Basics</h2>
      <p className="text-black font-bold mb-6">Tell us what customers should know first.</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-black font-black mb-2">Business Display Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.displayName}
            onChange={(e) => setData({ ...data, displayName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your business name"
            required
          />
        </div>

        <div>
          <label className="block text-black font-black mb-2">Business Description (20–500 chars) <span className="text-red-500">*</span></label>
          <textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value.slice(0, 500) })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="What does your business do?"
            required
          />
          <p className="text-sm text-gray-600 mt-1">{data.description.length}/500 {data.description.length < 20 && <span className="text-red-500">(minimum 20 required)</span>}</p>
        </div>

        <div>
          <label className="block text-black font-black mb-2">Business Category <span className="text-red-500">*</span></label>
          <select
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingCategories}
            required
          >
            <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex-1 px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 transition-all ${
            isValid 
              ? 'bg-blue-500 text-white hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function LocationContactStep({ data, setData, onNext, onBack }: StepProps) {
  const [locations, setLocations] = useState<any[]>([])
  const [loadingLocations, setLoadingLocations] = useState(true)
  const isValid = data.phoneNumber.trim() && data.city.trim()

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data: locationsData, error } = await supabase
          .from('locations')
          .select('id, city, slug')
          .eq('is_active', true)
          .order('city')
        
        if (error) {
          console.error('Error fetching locations:', error)
        } else {
          setLocations(locationsData || [])
        }
      } catch (err) {
        console.error('Error fetching locations:', err)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
    >
      <h2 className="text-3xl font-black text-black mb-2">Where can customers reach you?</h2>
      <p className="text-black font-bold mb-6">This helps customers find local businesses like yours.</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-black font-black mb-2">Phone Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+27 123 456 7890"
            required
          />
        </div>

        <div>
          <label className="block text-black font-black mb-2">Location <span className="text-red-500">*</span></label>
          <select
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingLocations}
            required
          >
            <option value="">{loadingLocations ? 'Loading locations...' : 'Select a location'}</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.city}>{loc.city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-black font-black mb-2">Full Business Address (optional)</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street address"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex-1 px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 transition-all ${
            isValid 
              ? 'bg-blue-500 text-white hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function OperatingHoursStep({ data, setData, onNext, onBack }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] w-full"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">When are you open?</h2>
      <p className="text-black font-bold mb-6 text-sm sm:text-base">Let customers know the best time to contact or visit you.</p>

      <div className="space-y-2 mb-8 max-h-96 overflow-y-auto pr-2">
        {DAYS.map(day => (
          <div key={day} className="bg-gray-50 border-2 border-black rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <label className="flex items-center gap-2 min-w-fit">
                <input
                  type="checkbox"
                  checked={data.hours[day].open}
                  onChange={(e) => setData({
                    ...data,
                    hours: {
                      ...data.hours,
                      [day]: { ...data.hours[day], open: e.target.checked }
                    }
                  })}
                  className="w-5 h-5 border-2 border-black rounded cursor-pointer"
                />
                <span className="font-black text-black text-sm sm:text-base whitespace-nowrap">{day}</span>
              </label>
              
              {data.hours[day].open && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                  <input
                    type="time"
                    value={data.hours[day].start}
                    onChange={(e) => setData({
                      ...data,
                      hours: {
                        ...data.hours,
                        [day]: { ...data.hours[day], start: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border-2 border-black rounded font-bold text-sm sm:text-base flex-1 sm:flex-none"
                  />
                  <span className="font-black text-black hidden sm:inline">–</span>
                  <span className="font-black text-black sm:hidden">to</span>
                  <input
                    type="time"
                    value={data.hours[day].end}
                    onChange={(e) => setData({
                      ...data,
                      hours: {
                        ...data.hours,
                        [day]: { ...data.hours[day], end: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border-2 border-black rounded font-bold text-sm sm:text-base flex-1 sm:flex-none"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function BrandingStep({ data, setData, onNext, onBack }: StepProps) {
  const [preview, setPreview] = useState<string | null>(data.profileImage)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreview(result)
        setData({ ...data, profileImage: result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
    >
      <h2 className="text-3xl font-black text-black mb-2">Add your business profile image <span className="text-red-500">*</span></h2>
      <p className="text-black font-bold mb-6">Profiles with photos get 42% more trust from customers.</p>

      <div className="mb-8">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg border-2 border-black" />
            <button
              onClick={() => {
                setPreview(null)
                setData({ ...data, profileImage: null })
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full border-2 border-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <label className="border-4 border-dashed border-black rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="h-12 w-12 text-black mx-auto mb-2" />
            <p className="font-black text-black">Click to upload image</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              required
            />
          </label>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!preview}
          className={`flex-1 px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 transition-all ${
            preview 
              ? 'bg-blue-500 text-white hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function GalleryUploadStep({ galleryImages, setGalleryImages, onNext, onBack }: any) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setGalleryImages([result])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setGalleryImages([])
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] w-full"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">Add a Gallery Image <span className="text-red-500">*</span></h2>
      <p className="text-black font-bold mb-6 text-sm sm:text-base">Add your first gallery image. You can add more images in your dashboard later.</p>

      <div className="mb-8">
        {galleryImages.length === 0 ? (
          <label className="border-4 border-dashed border-black rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block">
            <Upload className="h-12 w-12 text-black mx-auto mb-2" />
            <p className="font-black text-black text-sm sm:text-base">Click to upload image</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">JPG, PNG or GIF (max 5MB)</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              required
            />
          </label>
        ) : (
          <div className="relative inline-block w-full">
            <img src={galleryImages[0]} alt="Gallery preview" className="w-full h-64 object-cover rounded-lg border-2 border-black" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={galleryImages.length === 0}
          className={`flex-1 px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
            galleryImages.length > 0
              ? 'bg-blue-500 text-white hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function SocialLinksStep({ data, setData, onBack, onFinish }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
    >
      <h2 className="text-3xl font-black text-black mb-2">Add links (optional)</h2>
      <p className="text-black font-bold mb-6">Help customers connect with you on social media.</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-black font-black mb-2">Website URL</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => setData({ ...data, website: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-black font-black mb-2">X / Twitter</label>
          <input
            type="url"
            value={data.twitter}
            onChange={(e) => setData({ ...data, twitter: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://x.com/yourprofile"
          />
        </div>

        <div>
          <label className="block text-black font-black mb-2">YouTube</label>
          <input
            type="url"
            value={data.youtube}
            onChange={(e) => setData({ ...data, youtube: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/yourchannel"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={onFinish}
          className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-center gap-2"
        >
          Finish
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

export function SuccessScreen({ onDashboard, onAddProduct, onViewProfile }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] max-w-md w-full text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black text-black mb-2">🎉 Your Profile is Ready!</h1>
          <p className="text-black font-bold mb-8">You're all set! Explore your dashboard and start posting your listings.</p>
          
          <div className="space-y-3">
            <button
              onClick={onAddProduct}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
            >
              ➕ Add Your First Product
            </button>
            <button
              onClick={onViewProfile}
              className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
            >
              👀 View My Profile
            </button>
            <button
              onClick={onDashboard}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
