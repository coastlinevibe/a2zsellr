'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, MapPin, Tag, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Location {
  id: number
  city: string
  slug: string
  province: string | null
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductCategory {
  id: string
  category: string
  type: string
  created_at: string
}

export function AdminCategoriesLocations() {
  const [activeTab, setActiveTab] = useState<'categories' | 'locations' | 'product-categories'>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<number | string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        // Sort categories with "All Categories" always first
        const sortedCategories = (data || []).sort((a, b) => {
          if (a.name === 'All Categories') return -1
          if (b.name === 'All Categories') return 1
          return a.name.localeCompare(b.name)
        })
        
        setCategories(sortedCategories)
      } else if (activeTab === 'locations') {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('city')
        
        if (error) throw error
        setLocations(data || [])
      } else if (activeTab === 'product-categories') {
        const { data, error } = await supabase
          .from('profile_products')
          .select('category, type')
          .order('category')
        
        if (error) throw error
        
        // Get unique categories with their types
        const uniqueCategories = data?.reduce((acc: ProductCategory[], item: any) => {
          const existing = acc.find(cat => cat.category === item.category)
          if (!existing) {
            acc.push({
              id: item.category,
              category: item.category,
              type: item.type || 'product',
              created_at: new Date().toISOString()
            })
          }
          return acc
        }, []) || []
        
        setProductCategories(uniqueCategories)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleAdd = () => {
    setShowAddForm(true)
    setEditingItem(null)
    if (activeTab === 'categories') {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        is_active: true
      })
    } else if (activeTab === 'locations') {
      setFormData({
        city: '',
        slug: '',
        province: '',
        country: 'South Africa',
        is_active: true
      })
    } else if (activeTab === 'product-categories') {
      setFormData({
        category: '',
        type: 'product'
      })
    }
  }

  const handleEdit = (item: Category | Location | ProductCategory) => {
    setEditingItem(item.id)
    setShowAddForm(false)
    setFormData(item)
  }

  const handleSave = async () => {
    setError('')
    
    // Basic validation
    if (activeTab === 'categories' && !formData.name?.trim()) {
      setError('Category name is required')
      return
    }
    
    if (activeTab === 'locations' && !formData.city?.trim()) {
      setError('City name is required')
      return
    }
    
    try {
      if (activeTab === 'categories') {
        // Auto-generate slug if empty
        if (!formData.slug && formData.name) {
          formData.slug = generateSlug(formData.name)
        }

        // Check for duplicate name/slug when adding new category
        if (!editingItem) {
          const { data: existingCategories } = await supabase
            .from('categories')
            .select('id, name, slug')
            .or(`name.ilike.${formData.name.trim()},slug.eq.${formData.slug}`)
          
          if (existingCategories && existingCategories.length > 0) {
            const duplicate = existingCategories[0]
            if (duplicate.name.toLowerCase() === formData.name.trim().toLowerCase()) {
              setError(`Category "${formData.name}" already exists`)
              return
            }
            if (duplicate.slug === formData.slug) {
              setError(`Category slug "${formData.slug}" already exists`)
              return
            }
          }
        }

        if (editingItem) {
          // Update existing category
          const { error } = await supabase
            .from('categories')
            .update({
              name: formData.name,
              slug: formData.slug,
              description: formData.description || null,
              icon: formData.icon || null,
              is_active: formData.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingItem)
          
          if (error) throw error
        } else {
          // Add new category
          const { error } = await supabase
            .from('categories')
            .insert({
              name: formData.name.trim(),
              slug: formData.slug,
              description: formData.description?.trim() || null,
              icon: formData.icon?.trim() || null,
              is_active: formData.is_active
            })
          
          if (error) throw error
        }
      } else if (activeTab === 'locations') {
        // Auto-generate slug if empty
        if (!formData.slug && formData.city) {
          formData.slug = generateSlug(formData.city)
        }

        if (editingItem) {
          // Update existing location
          const { error } = await supabase
            .from('locations')
            .update({
              city: formData.city,
              slug: formData.slug,
              province: formData.province || null,
              country: formData.country,
              is_active: formData.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingItem)
          
          if (error) throw error
        } else {
          // Add new location
          const { error } = await supabase
            .from('locations')
            .insert({
              city: formData.city,
              slug: formData.slug,
              province: formData.province || null,
              country: formData.country,
              is_active: formData.is_active
            })
          
          if (error) throw error
        }
      } else if (activeTab === 'product-categories') {
        if (!editingItem) {
          // Add new product category - we'll create a sample product with this category
          const { error } = await supabase
            .from('profile_products')
            .insert({
              id: crypto.randomUUID(),
              category: formData.category,
              type: formData.type,
              name: `Sample ${formData.category}`,
              description: `Sample product for ${formData.category} category`,
              price: 0,
              is_active: false
            })
          
          if (error) throw error
        }
        // Note: We don't allow editing product categories directly as they're derived from products
      }

      // Reset form and refresh data
      setEditingItem(null)
      setShowAddForm(false)
      setFormData({})
      fetchData()
      
    } catch (err: any) {
      console.error('Error saving:', err)
      
      // Handle specific database errors with user-friendly messages
      if (err.message?.includes('duplicate key value violates unique constraint')) {
        if (err.message.includes('categories_name_key')) {
          setError(`A category with the name "${formData.name}" already exists. Please choose a different name.`)
        } else if (err.message.includes('categories_slug_key')) {
          setError(`A category with the slug "${formData.slug}" already exists. Please choose a different slug.`)
        } else if (err.message.includes('locations_city_key')) {
          setError(`A location with the city "${formData.city}" already exists. Please choose a different city.`)
        } else if (err.message.includes('locations_slug_key')) {
          setError(`A location with the slug "${formData.slug}" already exists. Please choose a different slug.`)
        } else {
          setError('This item already exists. Please check your input and try again.')
        }
      } else if (err.message?.includes('violates row-level security policy')) {
        setError('You do not have permission to perform this action.')
      } else if (err.message?.includes('violates not-null constraint')) {
        setError('Please fill in all required fields.')
      } else if (err.message?.includes('violates check constraint')) {
        setError('Please check your input values and try again.')
      } else {
        // Generic user-friendly message for other errors
        setError(`Unable to save ${activeTab === 'categories' ? 'category' : activeTab === 'locations' ? 'location' : 'product category'}. Please check your input and try again.`)
      }
    }
  }

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      if (activeTab === 'product-categories') {
        // Delete all products with this category
        const { error } = await supabase
          .from('profile_products')
          .delete()
          .eq('category', id)
        
        if (error) throw error
      } else {
        const table = activeTab === 'categories' ? 'categories' : 'locations'
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
        
        if (error) throw error
      }
      
      fetchData()
      
    } catch (err: any) {
      console.error('Error deleting:', err)
      if (err.message?.includes('violates foreign key constraint')) {
        setError(`Cannot delete this ${activeTab === 'categories' ? 'category' : 'location'} because it is being used by existing businesses.`)
      } else {
        setError(`Unable to delete ${activeTab === 'categories' ? 'category' : 'location'}. Please try again.`)
      }
    }
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const table = activeTab === 'categories' ? 'categories' : 'locations'
      const { error } = await supabase
        .from(table)
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      fetchData()
      
    } catch (err: any) {
      console.error('Error toggling status:', err)
      setError(err.message || 'Failed to update status')
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowAddForm(false)
    setFormData({})
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-400 to-pink-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase">CATEGORIES & LOCATIONS</h2>
            <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
              MANAGE BUSINESS CATEGORIES & LOCATIONS
            </p>
          </div>
          <motion.button
            onClick={fetchData}
            className="bg-white text-black px-4 py-2 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2"
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
          >
            <motion.div
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            REFRESH
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-4 justify-center">
        <motion.button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-green-500 text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
          whileHover={{ 
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
        >
          <motion.div
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.6 }
            }}
          >
            <Tag className="w-5 h-5" />
          </motion.div>
          CATEGORIES ({categories.length})
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('locations')}
          className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
          whileHover={{ 
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
        >
          <motion.div
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.6 }
            }}
          >
            <MapPin className="w-5 h-5" />
          </motion.div>
          LOCATIONS ({locations.length})
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('product-categories')}
          className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
            activeTab === 'product-categories'
              ? 'bg-purple-500 text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
          whileHover={{ 
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
        >
          <motion.div
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.6 }
            }}
          >
            <Tag className="w-5 h-5" />
          </motion.div>
          PRODUCT CATEGORIES ({productCategories.length})
        </motion.button>
      </div>

      {/* Notification Message */}
      {error && (
        <motion.div 
          className="bg-orange-300 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-black font-black text-sm uppercase">Heads up!</p>
              <p className="text-black font-bold">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleAdd}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl border-4 border-black font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2"
          whileHover={{ 
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ 
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
        >
          <motion.div
            whileHover={{ 
              rotate: 180,
              transition: { duration: 0.3 }
            }}
          >
            <Plus className="w-5 h-5" />
          </motion.div>
          ADD {activeTab === 'categories' ? 'CATEGORY' : activeTab === 'locations' ? 'LOCATION' : 'PRODUCT CATEGORY'}
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingItem) && (
        <motion.div 
          className="bg-gradient-to-r from-orange-300 to-yellow-300 border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
          initial={{ scale: 0.9, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          <h3 className="text-2xl font-black text-black mb-6 uppercase">
            {editingItem ? 'EDIT' : 'ADD'} {activeTab === 'categories' ? 'CATEGORY' : activeTab === 'locations' ? 'LOCATION' : 'PRODUCT CATEGORY'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'categories' ? (
              <>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">NAME *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., RESTAURANTS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">SLUG *</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., RESTAURANTS"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-black mb-2 uppercase">DESCRIPTION</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    rows={3}
                    placeholder="CATEGORY DESCRIPTION..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">ICON</label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., UTENSILS"
                  />
                </div>
              </>
            ) : activeTab === 'locations' ? (
              <>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">CITY *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., CAPE TOWN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">SLUG *</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., CAPE-TOWN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">PROVINCE</label>
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., WESTERN CAPE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">COUNTRY</label>
                  <input
                    type="text"
                    value={formData.country || 'South Africa'}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white"
                  />
                </div>
              </>
            ) : activeTab === 'product-categories' ? (
              <>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">CATEGORY NAME *</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white placeholder-gray-500"
                    placeholder="E.G., SERVICES"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase">TYPE</label>
                  <select
                    value={formData.type || 'product'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white"
                  >
                    <option value="product">PRODUCT</option>
                    <option value="service">SERVICE</option>
                    <option value="food">FOOD & DRINKS</option>
                    <option value="retail">RETAIL ITEMS</option>
                  </select>
                </div>
              </>
            ) : null}
            
            {(activeTab === 'categories' || activeTab === 'locations') && (
              <div className="flex items-center bg-white p-3 rounded-lg border-2 border-black">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-3 w-5 h-5"
                />
                <label htmlFor="is_active" className="font-black text-black uppercase">ACTIVE</label>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-5 h-5" />
              SAVE
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-5 h-5" />
              CANCEL
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div 
        className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-400 to-blue-500 border-b-4 border-black">
              <tr>
                {activeTab === 'categories' ? (
                  <>
                    <th className="text-left p-4 font-black text-black uppercase">NAME</th>
                    <th className="text-left p-4 font-black text-black uppercase">SLUG</th>
                    <th className="text-left p-4 font-black text-black uppercase">DESCRIPTION</th>
                    <th className="text-left p-4 font-black text-black uppercase">ICON</th>
                    <th className="text-left p-4 font-black text-black uppercase">STATUS</th>
                    <th className="text-left p-4 font-black text-black uppercase">ACTIONS</th>
                  </>
                ) : activeTab === 'locations' ? (
                  <>
                    <th className="text-left p-4 font-black text-black uppercase">CITY</th>
                    <th className="text-left p-4 font-black text-black uppercase">SLUG</th>
                    <th className="text-left p-4 font-black text-black uppercase">PROVINCE</th>
                    <th className="text-left p-4 font-black text-black uppercase">COUNTRY</th>
                    <th className="text-left p-4 font-black text-black uppercase">STATUS</th>
                    <th className="text-left p-4 font-black text-black uppercase">ACTIONS</th>
                  </>
                ) : (
                  <>
                    <th className="text-left p-4 font-black text-black uppercase">CATEGORY</th>
                    <th className="text-left p-4 font-black text-black uppercase">TYPE</th>
                    <th className="text-left p-4 font-black text-black uppercase">PRODUCT COUNT</th>
                    <th className="text-left p-4 font-black text-black uppercase">ACTIONS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y-4 divide-black">
              {activeTab === 'categories' ? (
                categories.map((category, index) => (
                  <motion.tr 
                    key={category.id} 
                    className="hover:bg-yellow-100 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4 font-black text-black">{category.name}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded border border-black inline-block">
                        {category.slug}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-black">{category.description || '-'}</td>
                    <td className="p-4 font-bold text-black">{category.icon || '-'}</td>
                    <td className="p-4">
                      <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase ${
                        category.is_active 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {category.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleActive(category.id, category.is_active)}
                          className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                            category.is_active 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={category.is_active ? 'Deactivate' : 'Activate'}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          onClick={() => handleEdit(category)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(category.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : activeTab === 'locations' ? (
                locations.map((location, index) => (
                  <motion.tr 
                    key={location.id} 
                    className="hover:bg-yellow-100 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4 font-black text-black">{location.city}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded border border-black inline-block">
                        {location.slug}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-black">{location.province || '-'}</td>
                    <td className="p-4 font-bold text-black">{location.country}</td>
                    <td className="p-4">
                      <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase ${
                        location.is_active 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {location.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleActive(location.id, location.is_active)}
                          className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                            location.is_active 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={location.is_active ? 'Deactivate' : 'Activate'}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {location.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          onClick={() => handleEdit(location)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(location.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : activeTab === 'product-categories' ? (
                productCategories.map((productCategory, index) => (
                  <motion.tr 
                    key={productCategory.id} 
                    className="hover:bg-yellow-100 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4 font-black text-black">{productCategory.category}</td>
                    <td className="p-4">
                      <div className="font-bold text-white bg-purple-500 px-3 py-1 rounded-lg border-2 border-black uppercase text-sm">
                        {productCategory.type}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-black">
                      <div className="bg-blue-100 px-3 py-1 rounded-lg border border-black inline-block">
                        {/* We'll show a placeholder count for now */}
                        Multiple Products
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleDelete(productCategory.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete all products in this category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Empty State */}
      {((activeTab === 'categories' && categories.length === 0) || 
        (activeTab === 'locations' && locations.length === 0) ||
        (activeTab === 'product-categories' && productCategories.length === 0)) && (
        <motion.div 
          className="text-center py-12 bg-gray-100 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="bg-white p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] inline-block mb-4"
            whileHover={{ 
              rotate: 5,
              transition: { duration: 0.3 }
            }}
          >
            {activeTab === 'categories' ? (
              <Tag className="h-12 w-12 text-black" />
            ) : activeTab === 'locations' ? (
              <MapPin className="h-12 w-12 text-black" />
            ) : (
              <Tag className="h-12 w-12 text-black" />
            )}
          </motion.div>
          <p className="text-black font-black uppercase text-lg">
            NO {activeTab.replace('-', ' ').toUpperCase()} FOUND!
          </p>
          <p className="text-black font-bold mt-2">
            CLICK "ADD {activeTab === 'categories' ? 'CATEGORY' : activeTab === 'locations' ? 'LOCATION' : 'PRODUCT CATEGORY'}" TO GET STARTED
          </p>
        </motion.div>
      )}
    </div>
  )
}
