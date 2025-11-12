// Icon Storage Utility for A2Z Sellr
// Manages icon data and provides utilities for icon handling

export interface IconData {
  name: string
  category: string
  keywords: string[]
  component?: string
}

// Icon storage with categories and search keywords
export const iconStorage: IconData[] = [
  // Business & Services
  { name: 'Store', category: 'Business & Services', keywords: ['shop', 'retail', 'business', 'store', 'market'] },
  { name: 'ShoppingBag', category: 'Business & Services', keywords: ['shopping', 'bag', 'retail', 'purchase', 'buy'] },
  { name: 'Building2', category: 'Business & Services', keywords: ['office', 'building', 'corporate', 'business', 'company'] },
  { name: 'Briefcase', category: 'Business & Services', keywords: ['business', 'work', 'professional', 'office', 'corporate'] },
  { name: 'Home', category: 'Business & Services', keywords: ['house', 'home', 'residential', 'property', 'real estate'] },
  { name: 'Wrench', category: 'Business & Services', keywords: ['repair', 'maintenance', 'tools', 'fix', 'service'] },
  { name: 'Car', category: 'Business & Services', keywords: ['automotive', 'vehicle', 'transport', 'car', 'auto'] },
  { name: 'Hammer', category: 'Business & Services', keywords: ['construction', 'building', 'tools', 'repair', 'handyman'] },
  { name: 'PaintBucket', category: 'Business & Services', keywords: ['painting', 'decoration', 'art', 'design', 'creative'] },
  { name: 'Truck', category: 'Business & Services', keywords: ['delivery', 'transport', 'logistics', 'shipping', 'moving'] },
  { name: 'Shield', category: 'Business & Services', keywords: ['security', 'protection', 'safety', 'insurance', 'guard'] },
  { name: 'GraduationCap', category: 'Business & Services', keywords: ['education', 'learning', 'school', 'training', 'academy'] },

  // Food & Dining
  { name: 'Utensils', category: 'Food & Dining', keywords: ['restaurant', 'food', 'dining', 'eat', 'meal'] },
  { name: 'Coffee', category: 'Food & Dining', keywords: ['coffee', 'cafe', 'beverage', 'drink', 'espresso'] },
  { name: 'Pizza', category: 'Food & Dining', keywords: ['pizza', 'italian', 'fast food', 'delivery', 'restaurant'] },
  { name: 'Wine', category: 'Food & Dining', keywords: ['wine', 'alcohol', 'beverage', 'bar', 'restaurant'] },
  { name: 'Cake', category: 'Food & Dining', keywords: ['bakery', 'dessert', 'cake', 'sweet', 'pastry'] },
  { name: 'IceCream', category: 'Food & Dining', keywords: ['ice cream', 'dessert', 'frozen', 'sweet', 'treat'] },
  { name: 'Fish', category: 'Food & Dining', keywords: ['seafood', 'fish', 'restaurant', 'fresh', 'ocean'] },
  { name: 'Apple', category: 'Food & Dining', keywords: ['fruit', 'healthy', 'fresh', 'organic', 'grocery'] },

  // Health & Beauty
  { name: 'Heart', category: 'Health & Beauty', keywords: ['health', 'medical', 'wellness', 'care', 'fitness'] },
  { name: 'Scissors', category: 'Health & Beauty', keywords: ['salon', 'hair', 'beauty', 'barber', 'styling'] },
  { name: 'Dumbbell', category: 'Health & Beauty', keywords: ['fitness', 'gym', 'exercise', 'workout', 'health'] },
  { name: 'Stethoscope', category: 'Health & Beauty', keywords: ['medical', 'doctor', 'health', 'clinic', 'healthcare'] },
  { name: 'Pill', category: 'Health & Beauty', keywords: ['pharmacy', 'medicine', 'health', 'medical', 'drugs'] },

  // Technology
  { name: 'Smartphone', category: 'Technology', keywords: ['phone', 'mobile', 'technology', 'device', 'communication'] },
  { name: 'Laptop', category: 'Technology', keywords: ['computer', 'technology', 'laptop', 'device', 'digital'] },
  { name: 'Camera', category: 'Technology', keywords: ['photography', 'camera', 'photo', 'digital', 'media'] },
  { name: 'Headphones', category: 'Technology', keywords: ['audio', 'music', 'sound', 'headphones', 'entertainment'] },
  { name: 'Gamepad2', category: 'Technology', keywords: ['gaming', 'games', 'entertainment', 'console', 'play'] },

  // Fashion & Retail
  { name: 'Shirt', category: 'Fashion & Retail', keywords: ['clothing', 'fashion', 'apparel', 'wear', 'style'] },
  { name: 'Crown', category: 'Fashion & Retail', keywords: ['luxury', 'premium', 'jewelry', 'accessories', 'royal'] },
  { name: 'Watch', category: 'Fashion & Retail', keywords: ['time', 'accessories', 'luxury', 'jewelry', 'fashion'] },
  { name: 'Gem', category: 'Fashion & Retail', keywords: ['jewelry', 'diamond', 'precious', 'luxury', 'accessories'] },
  { name: 'Palette', category: 'Fashion & Retail', keywords: ['art', 'design', 'creative', 'color', 'painting'] },

  // Entertainment
  { name: 'Music', category: 'Entertainment', keywords: ['music', 'entertainment', 'audio', 'sound', 'performance'] },
  { name: 'Film', category: 'Entertainment', keywords: ['movie', 'cinema', 'film', 'entertainment', 'video'] },
  { name: 'Book', category: 'Entertainment', keywords: ['book', 'reading', 'education', 'literature', 'library'] },
  { name: 'Ticket', category: 'Entertainment', keywords: ['event', 'ticket', 'entertainment', 'show', 'concert'] },
  { name: 'PartyPopper', category: 'Entertainment', keywords: ['party', 'celebration', 'event', 'fun', 'entertainment'] },

  // Sports & Recreation
  { name: 'Football', category: 'Sports & Recreation', keywords: ['sports', 'football', 'game', 'recreation', 'team'] },
  { name: 'Bike', category: 'Sports & Recreation', keywords: ['cycling', 'bike', 'sport', 'recreation', 'fitness'] },
  { name: 'Waves', category: 'Sports & Recreation', keywords: ['water', 'ocean', 'swimming', 'surfing', 'beach'] },
  { name: 'Mountain', category: 'Sports & Recreation', keywords: ['hiking', 'outdoor', 'adventure', 'nature', 'climbing'] },
  { name: 'Trophy', category: 'Sports & Recreation', keywords: ['award', 'winner', 'achievement', 'competition', 'success'] },

  // Travel & Transport
  { name: 'Plane', category: 'Travel & Transport', keywords: ['travel', 'flight', 'airline', 'transport', 'vacation'] },
  { name: 'MapPin', category: 'Travel & Transport', keywords: ['location', 'map', 'navigation', 'place', 'address'] },
  { name: 'Hotel', category: 'Travel & Transport', keywords: ['accommodation', 'hotel', 'travel', 'lodging', 'stay'] },
  { name: 'Compass', category: 'Travel & Transport', keywords: ['navigation', 'direction', 'travel', 'exploration', 'guide'] },
  { name: 'Fuel', category: 'Travel & Transport', keywords: ['gas', 'fuel', 'petrol', 'energy', 'station'] },

  // Finance & Legal
  { name: 'DollarSign', category: 'Finance & Legal', keywords: ['money', 'finance', 'currency', 'payment', 'business'] },
  { name: 'CreditCard', category: 'Finance & Legal', keywords: ['payment', 'card', 'finance', 'money', 'transaction'] },
  { name: 'Scale', category: 'Finance & Legal', keywords: ['legal', 'law', 'justice', 'balance', 'court'] },
  { name: 'Calculator', category: 'Finance & Legal', keywords: ['accounting', 'finance', 'math', 'calculation', 'business'] },
  { name: 'PiggyBank', category: 'Finance & Legal', keywords: ['savings', 'money', 'finance', 'bank', 'investment'] },

  // Miscellaneous
  { name: 'Gift', category: 'Miscellaneous', keywords: ['gift', 'present', 'surprise', 'celebration', 'special'] },
  { name: 'Star', category: 'Miscellaneous', keywords: ['rating', 'quality', 'premium', 'favorite', 'excellence'] },
  { name: 'Zap', category: 'Miscellaneous', keywords: ['energy', 'power', 'electric', 'fast', 'lightning'] },
  { name: 'Leaf', category: 'Miscellaneous', keywords: ['nature', 'eco', 'green', 'organic', 'environment'] },
  { name: 'Globe', category: 'Miscellaneous', keywords: ['global', 'world', 'international', 'web', 'internet'] }
]

// Utility functions for icon management
export class IconStorageManager {
  // Search icons by keyword
  static searchIcons(query: string): IconData[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return iconStorage

    return iconStorage.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.category.toLowerCase().includes(searchTerm) ||
      icon.keywords.some(keyword => keyword.includes(searchTerm))
    )
  }

  // Get icons by category
  static getIconsByCategory(category: string): IconData[] {
    return iconStorage.filter(icon => icon.category === category)
  }

  // Get all categories
  static getCategories(): string[] {
    const categories = new Set(iconStorage.map(icon => icon.category))
    return Array.from(categories)
  }

  // Get icon by name
  static getIcon(name: string): IconData | undefined {
    return iconStorage.find(icon => icon.name === name)
  }

  // Get popular icons (you can customize this logic)
  static getPopularIcons(): IconData[] {
    const popularNames = ['Store', 'Utensils', 'Car', 'Heart', 'Smartphone', 'Home', 'Coffee', 'Shirt']
    return iconStorage.filter(icon => popularNames.includes(icon.name))
  }

  // Save icon selection to localStorage (for user preferences)
  static saveRecentIcon(iconName: string): void {
    try {
      const recent = this.getRecentIcons()
      const updated = [iconName, ...recent.filter(name => name !== iconName)].slice(0, 10)
      localStorage.setItem('a2z_recent_icons', JSON.stringify(updated))
    } catch (error) {
      console.warn('Could not save recent icon:', error)
    }
  }

  // Get recently used icons
  static getRecentIcons(): string[] {
    try {
      const recent = localStorage.getItem('a2z_recent_icons')
      return recent ? JSON.parse(recent) : []
    } catch (error) {
      console.warn('Could not load recent icons:', error)
      return []
    }
  }

  // Validate icon name
  static isValidIcon(name: string): boolean {
    return iconStorage.some(icon => icon.name === name)
  }

  // Get icon suggestions based on category name
  static suggestIconsForCategory(categoryName: string): IconData[] {
    const searchResults = this.searchIcons(categoryName)
    if (searchResults.length > 0) return searchResults.slice(0, 5)

    // Fallback to popular icons
    return this.getPopularIcons().slice(0, 3)
  }
}

export default IconStorageManager
