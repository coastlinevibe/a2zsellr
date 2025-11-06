'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, MapPin, Tag, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

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

export function AdminCategoriesLocations() {
  const [activeTab, setActiveTab] = useState<'categories' | 'locations'>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<number | null>(null)
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
        setCategories(data || [])
      } else {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('city')
        
        if (error) throw error
        setLocations(data || [])
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
    } else {
      setFormData({
        city: '',
        slug: '',
        province: '',
        country: 'South Africa',
        is_active: true
      })
    }
  }

  const handleEdit = (item: Category | Location) => {
    setEditingItem(item.id)
    setShowAddForm(false)
    setFormData(item)
  }

  const handleSave = async () => {
    setError('')
    
    try {
      if (activeTab === 'categories') {
        // Auto-generate slug if empty
        if (!formData.slug && formData.name) {
          formData.slug = generateSlug(formData.name)
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
              name: formData.name,
              slug: formData.slug,
              description: formData.description || null,
              icon: formData.icon || null,
              is_active: formData.is_active
            })
          
          if (error) throw error
        }
      } else {
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
      }

      // Reset form and refresh data
      setEditingItem(null)
      setShowAddForm(false)
      setFormData({})
      fetchData()
      
    } catch (err: any) {
      console.error('Error saving:', err)
      setError(err.message || 'Failed to save')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const table = activeTab === 'categories' ? 'categories' : 'locations'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
      
    } catch (err: any) {
      console.error('Error deleting:', err)
      setError(err.message || 'Failed to delete')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories & Locations</h2>
          <p className="text-gray-600">Manage business categories and locations</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-5 h-5 inline mr-2" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            Locations ({locations.length})
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'categories' ? 'Category' : 'Location'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingItem) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'Location'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'categories' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Restaurants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., restaurants"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Category description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., utensils"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Cape Town"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., cape-town"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Western Cape"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country || 'South Africa'}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {activeTab === 'categories' ? (
                  <>
                    <th className="text-left p-4 font-medium text-gray-900">Name</th>
                    <th className="text-left p-4 font-medium text-gray-900">Slug</th>
                    <th className="text-left p-4 font-medium text-gray-900">Description</th>
                    <th className="text-left p-4 font-medium text-gray-900">Icon</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="text-left p-4 font-medium text-gray-900">City</th>
                    <th className="text-left p-4 font-medium text-gray-900">Slug</th>
                    <th className="text-left p-4 font-medium text-gray-900">Province</th>
                    <th className="text-left p-4 font-medium text-gray-900">Country</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'categories' ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4 text-gray-600">{category.slug}</td>
                    <td className="p-4 text-gray-600">{category.description || '-'}</td>
                    <td className="p-4 text-gray-600">{category.icon || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleActive(category.id, category.is_active)}
                          variant="outline"
                          size="sm"
                          title={category.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => handleEdit(category)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{location.city}</td>
                    <td className="p-4 text-gray-600">{location.slug}</td>
                    <td className="p-4 text-gray-600">{location.province || '-'}</td>
                    <td className="p-4 text-gray-600">{location.country}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        location.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleActive(location.id, location.is_active)}
                          variant="outline"
                          size="sm"
                          title={location.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {location.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => handleEdit(location)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(location.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {((activeTab === 'categories' && categories.length === 0) || 
        (activeTab === 'locations' && locations.length === 0)) && (
        <div className="text-center py-12">
          {activeTab === 'categories' ? (
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          ) : (
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          )}
          <p className="text-gray-600">
            No {activeTab} found. Click "Add {activeTab === 'categories' ? 'Category' : 'Location'}" to get started.
          </p>
        </div>
      )}
    </div>
  )
}
