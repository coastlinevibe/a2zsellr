'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IconStorageManager from '@/lib/iconStorage'
import { 
  Search, 
  X,
  // Business & Services
  Store, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Wrench, 
  Home, 
  Building2, 
  Briefcase,
  // Food & Dining
  Coffee, 
  Pizza, 
  Wine, 
  Cake, 
  IceCream, 
  Fish, 
  Apple,
  // Health & Beauty
  Heart, 
  Scissors, 
  Dumbbell, 
  Stethoscope, 
  Pill,
  // Technology
  Smartphone, 
  Laptop, 
  Camera, 
  Headphones, 
  Gamepad2,
  // Fashion & Retail
  Shirt, 
  Crown, 
  Watch, 
  Gem, 
  Palette,
  // Services
  Hammer, 
  PaintBucket, 
  Truck, 
  Shield, 
  GraduationCap,
  // Entertainment
  Music, 
  Film, 
  Book, 
  Ticket, 
  PartyPopper,
  // Sports & Recreation
  Zap as Football, 
  Bike, 
  Waves, 
  Mountain, 
  Trophy,
  // Travel & Transport
  Plane, 
  MapPin, 
  Hotel, 
  Compass, 
  Fuel,
  // Finance & Legal
  DollarSign, 
  CreditCard, 
  Scale, 
  Calculator, 
  PiggyBank,
  // Miscellaneous
  Gift, 
  Star, 
  Zap, 
  Leaf, 
  Globe
} from 'lucide-react'

interface IconPickerProps {
  selectedIcon?: string
  onIconSelect: (iconName: string) => void
  className?: string
}

const iconCategories = {
  'Business & Services': [
    { name: 'Store', icon: Store },
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'Building2', icon: Building2 },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Home', icon: Home },
    { name: 'Wrench', icon: Wrench },
    { name: 'Car', icon: Car },
    { name: 'Hammer', icon: Hammer },
    { name: 'PaintBucket', icon: PaintBucket },
    { name: 'Truck', icon: Truck },
    { name: 'Shield', icon: Shield },
    { name: 'GraduationCap', icon: GraduationCap }
  ],
  'Food & Dining': [
    { name: 'Utensils', icon: Utensils },
    { name: 'Coffee', icon: Coffee },
    { name: 'Pizza', icon: Pizza },
    { name: 'Wine', icon: Wine },
    { name: 'Cake', icon: Cake },
    { name: 'IceCream', icon: IceCream },
    { name: 'Fish', icon: Fish },
    { name: 'Apple', icon: Apple }
  ],
  'Health & Beauty': [
    { name: 'Heart', icon: Heart },
    { name: 'Scissors', icon: Scissors },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Pill', icon: Pill }
  ],
  'Technology': [
    { name: 'Smartphone', icon: Smartphone },
    { name: 'Laptop', icon: Laptop },
    { name: 'Camera', icon: Camera },
    { name: 'Headphones', icon: Headphones },
    { name: 'Gamepad2', icon: Gamepad2 }
  ],
  'Fashion & Retail': [
    { name: 'Shirt', icon: Shirt },
    { name: 'Crown', icon: Crown },
    { name: 'Watch', icon: Watch },
    { name: 'Gem', icon: Gem },
    { name: 'Palette', icon: Palette }
  ],
  'Entertainment': [
    { name: 'Music', icon: Music },
    { name: 'Film', icon: Film },
    { name: 'Book', icon: Book },
    { name: 'Ticket', icon: Ticket },
    { name: 'PartyPopper', icon: PartyPopper }
  ],
  'Sports & Recreation': [
    { name: 'Football', icon: Football },
    { name: 'Bike', icon: Bike },
    { name: 'Waves', icon: Waves },
    { name: 'Mountain', icon: Mountain },
    { name: 'Trophy', icon: Trophy }
  ],
  'Travel & Transport': [
    { name: 'Plane', icon: Plane },
    { name: 'MapPin', icon: MapPin },
    { name: 'Hotel', icon: Hotel },
    { name: 'Compass', icon: Compass },
    { name: 'Fuel', icon: Fuel }
  ],
  'Finance & Legal': [
    { name: 'DollarSign', icon: DollarSign },
    { name: 'CreditCard', icon: CreditCard },
    { name: 'Scale', icon: Scale },
    { name: 'Calculator', icon: Calculator },
    { name: 'PiggyBank', icon: PiggyBank }
  ],
  'Miscellaneous': [
    { name: 'Gift', icon: Gift },
    { name: 'Star', icon: Star },
    { name: 'Zap', icon: Zap },
    { name: 'Leaf', icon: Leaf },
    { name: 'Globe', icon: Globe }
  ]
}

export default function IconPicker({ selectedIcon, onIconSelect, className = '' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Business & Services')
  const [recentIcons, setRecentIcons] = useState<string[]>([])

  // Load recent icons on component mount
  useEffect(() => {
    setRecentIcons(IconStorageManager.getRecentIcons())
  }, [isOpen])

  // Get all icons for searching
  const allIcons = Object.values(iconCategories).flat()

  // Filter icons based on search term or category
  const filteredIcons = searchTerm 
    ? allIcons.filter(icon => 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : activeCategory === 'Recent'
    ? allIcons.filter(icon => recentIcons.includes(icon.name))
    : iconCategories[activeCategory as keyof typeof iconCategories] || []

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName)
    IconStorageManager.saveRecentIcon(iconName) // Save to recent icons
    setIsOpen(false)
    setSearchTerm('')
  }

  // Get the selected icon component
  const SelectedIconComponent = selectedIcon 
    ? allIcons.find(icon => icon.name === selectedIcon)?.icon 
    : null

  return (
    <div className={`relative ${className}`}>
      {/* Icon Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border-2 border-black rounded-lg font-bold bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">{selectedIcon}</span>
            </>
          ) : (
            <span className="text-gray-500">Select an icon...</span>
          )}
        </div>
        <div className="text-gray-400">
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {/* Icon Picker Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] z-50 w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 border-b-4 border-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase">Select Icon</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-white text-black p-2 rounded-lg border-2 border-black font-black hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg font-bold bg-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex h-96">
                {/* Categories Sidebar */}
                {!searchTerm && (
                  <div className="w-1/3 border-r-4 border-black bg-gray-50 overflow-y-auto">
                    {/* Recent Icons */}
                    {recentIcons.length > 0 && (
                      <button
                        onClick={() => setActiveCategory('Recent')}
                        className={`w-full text-left p-3 font-bold border-b-2 border-black hover:bg-gray-100 transition-colors ${
                          activeCategory === 'Recent' 
                            ? 'bg-yellow-300 text-black' 
                            : 'text-gray-700'
                        }`}
                      >
                        🕒 Recent Icons
                      </button>
                    )}
                    
                    {/* Category List */}
                    {Object.keys(iconCategories).map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`w-full text-left p-3 font-bold border-b-2 border-black hover:bg-gray-100 transition-colors ${
                          activeCategory === category 
                            ? 'bg-yellow-300 text-black' 
                            : 'text-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Icons Grid */}
                <div className={`${searchTerm ? 'w-full' : 'w-2/3'} p-4 overflow-y-auto`}>
                  {searchTerm && (
                    <div className="mb-4">
                      <p className="text-sm font-bold text-gray-600">
                        {filteredIcons.length} icons found for "{searchTerm}"
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-6 gap-3">
                    {filteredIcons.map((icon) => {
                      const IconComponent = icon.icon
                      const isSelected = selectedIcon === icon.name
                      
                      return (
                        <motion.button
                          key={icon.name}
                          onClick={() => handleIconSelect(icon.name)}
                          className={`p-3 rounded-lg border-2 border-black font-bold transition-all hover:scale-105 ${
                            isSelected 
                              ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]'
                          }`}
                          title={icon.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent className="w-6 h-6 mx-auto" />
                        </motion.button>
                      )
                    })}
                  </div>

                  {filteredIcons.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="font-bold text-gray-600">No icons found</p>
                      <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-100 p-4 border-t-4 border-black">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-600">
                    {Object.values(iconCategories).flat().length} icons available
                  </p>
                  {selectedIcon && (
                    <button
                      onClick={() => handleIconSelect('')}
                      className="bg-red-500 text-white px-3 py-1 rounded border-2 border-black font-bold text-sm hover:bg-red-600 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
