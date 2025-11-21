// Default products for bulk upload - category-based product generation
// Each category gets 10 default products with realistic South African pricing

interface DefaultProduct {
  name: string
  description: string
  price_cents: number // Price in cents (R45.00 = 4500 cents)
  details: string
  image_url: string // Product image URL
}

interface CategoryProducts {
  [key: string]: DefaultProduct[]
}

const defaultProductsByCategory: CategoryProducts = {
  'butcher-shop': [
    {
      name: 'Lamb Chops 500g',
      description: 'Best quality chops, very soft cut',
      price_cents: 4500, // R45.00
      details: 'Clean, Nice red color, Juicy and soft, Not too boney',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Steaks 1kg',
      description: 'Premium cuts, tender and juicy',
      price_cents: 8500, // R85.00
      details: 'Fresh, Grade A beef, Perfect for grilling',
      image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Breasts 500g',
      description: 'Fresh, lean protein',
      price_cents: 3500, // R35.00
      details: 'Skinless, boneless, farm fresh',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pork Ribs 1kg',
      description: 'Succulent and flavorful',
      price_cents: 6500, // R65.00
      details: 'Meaty ribs, perfect for braai',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Mince Beef 500g',
      description: 'Fresh ground beef',
      price_cents: 4000, // R40.00
      details: 'Lean mince, daily fresh preparation',
      image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Boerewors 1kg',
      description: 'Traditional South African sausage',
      price_cents: 5500, // R55.00
      details: 'Authentic recipe, coarse grind',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bacon 500g',
      description: 'Crispy, smoky flavor',
      price_cents: 5000, // R50.00
      details: 'Streaky bacon, perfect thickness',
      image_url: 'https://images.unsplash.com/photo-1528607929212-2636ec44b982?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Thighs 1kg',
      description: 'Juicy and tender',
      price_cents: 4500, // R45.00
      details: 'Bone-in thighs, skin-on',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Biltong 250g',
      description: 'Dried, seasoned meat',
      price_cents: 7500, // R75.00
      details: 'Traditional spices, air-dried',
      image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sosaties 500g',
      description: 'Marinated meat skewers',
      price_cents: 6000, // R60.00
      details: 'Mixed meat, traditional marinade',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'restaurant': [
    {
      name: 'Grilled Chicken Burger',
      description: 'Juicy grilled chicken with fresh salad',
      price_cents: 8500, // R85.00
      details: 'Served with chips and sauce',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Steak 300g',
      description: 'Premium beef steak cooked to perfection',
      price_cents: 12500, // R125.00
      details: 'Choice of sauce, served with vegetables',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Fish and Chips',
      description: 'Fresh fish with golden chips',
      price_cents: 9500, // R95.00
      details: 'Served with tartar sauce and lemon',
      image_url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Schnitzel',
      description: 'Crispy breaded chicken breast',
      price_cents: 8000, // R80.00
      details: 'Served with mushroom sauce',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pasta Bolognese',
      description: 'Traditional meat sauce pasta',
      price_cents: 7500, // R75.00
      details: 'Rich tomato and meat sauce',
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh lettuce with Caesar dressing',
      price_cents: 6500, // R65.00
      details: 'Croutons, parmesan, grilled chicken',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pizza Margherita',
      description: 'Classic tomato and mozzarella pizza',
      price_cents: 8500, // R85.00
      details: 'Fresh basil, wood-fired oven',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Lamb Curry',
      description: 'Tender lamb in rich curry sauce',
      price_cents: 9500, // R95.00
      details: 'Served with rice and naan bread',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Seafood Platter',
      description: 'Mixed seafood selection',
      price_cents: 15500, // R155.00
      details: 'Prawns, calamari, fish, mussels',
      image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate dessert',
      price_cents: 4500, // R45.00
      details: 'Served with vanilla ice cream',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'bakery': [
    {
      name: 'Fresh White Bread',
      description: 'Daily baked white loaf',
      price_cents: 1500, // R15.00
      details: 'Soft, fresh, perfect for sandwiches',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Whole Wheat Bread',
      description: 'Healthy whole wheat loaf',
      price_cents: 1800, // R18.00
      details: 'High fiber, nutritious',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Croissants (6 pack)',
      description: 'Buttery, flaky pastries',
      price_cents: 3500, // R35.00
      details: 'Perfect for breakfast',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chocolate Muffins (4 pack)',
      description: 'Rich chocolate chip muffins',
      price_cents: 2800, // R28.00
      details: 'Moist and delicious',
      image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Meat Pies (2 pack)',
      description: 'Traditional South African pies',
      price_cents: 2500, // R25.00
      details: 'Beef mince filling, flaky pastry',
      image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sausage Rolls (4 pack)',
      description: 'Savory sausage in pastry',
      price_cents: 3200, // R32.00
      details: 'Perfect snack or lunch',
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Birthday Cake (Small)',
      description: 'Custom decorated cake',
      price_cents: 12000, // R120.00
      details: 'Vanilla or chocolate, serves 8-10',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rusks (500g)',
      description: 'Traditional South African rusks',
      price_cents: 4500, // R45.00
      details: 'Perfect with coffee or tea',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Donuts (6 pack)',
      description: 'Fresh glazed donuts',
      price_cents: 3000, // R30.00
      details: 'Various flavors available',
      image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sandwich Platters',
      description: 'Assorted sandwich selection',
      price_cents: 8500, // R85.00
      details: 'Perfect for meetings or events',
      image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'grocery': [
    {
      name: 'Fresh Milk 2L',
      description: 'Full cream fresh milk',
      price_cents: 2200, // R22.00
      details: 'Farm fresh, daily delivery',
      image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Brown Eggs (18 pack)',
      description: 'Free range brown eggs',
      price_cents: 4500, // R45.00
      details: 'Large size, farm fresh',
      image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'White Sugar 2.5kg',
      description: 'Pure white sugar',
      price_cents: 3500, // R35.00
      details: 'Premium quality',
      image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Cooking Oil 2L',
      description: 'Sunflower cooking oil',
      price_cents: 4200, // R42.00
      details: 'Light and healthy',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rice 2kg',
      description: 'Long grain white rice',
      price_cents: 2800, // R28.00
      details: 'Premium quality rice',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Potatoes 2kg',
      description: 'Fresh local potatoes',
      price_cents: 2500, // R25.00
      details: 'Perfect for cooking and baking',
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Onions 2kg',
      description: 'Fresh yellow onions',
      price_cents: 2200, // R22.00
      details: 'Essential cooking ingredient',
      image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Tomatoes 1kg',
      description: 'Fresh ripe tomatoes',
      price_cents: 2800, // R28.00
      details: 'Perfect for salads and cooking',
      image_url: 'https://images.unsplash.com/photo-1546470427-e5380e2047ca?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bananas 1kg',
      description: 'Sweet ripe bananas',
      price_cents: 2000, // R20.00
      details: 'Healthy and nutritious',
      image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Apples 1kg',
      description: 'Fresh red apples',
      price_cents: 3500, // R35.00
      details: 'Crisp and sweet',
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center'
    }
  ]
}

// Fallback products for unknown categories
const fallbackProducts: DefaultProduct[] = [
  {
    name: 'Product 1',
    description: 'Quality product for your needs',
    price_cents: 5000, // R50.00
    details: 'High quality, great value',
    image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 2',
    description: 'Premium service offering',
    price_cents: 7500, // R75.00
    details: 'Professional service, excellent results',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 3',
    description: 'Essential item',
    price_cents: 3500, // R35.00
    details: 'Must-have product',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 4',
    description: 'Popular choice',
    price_cents: 4500, // R45.00
    details: 'Customer favorite',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 5',
    description: 'Special offer',
    price_cents: 6000, // R60.00
    details: 'Limited time special',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 6',
    description: 'Value package',
    price_cents: 8000, // R80.00
    details: 'Great value for money',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 7',
    description: 'Premium option',
    price_cents: 9500, // R95.00
    details: 'Top quality choice',
    image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 8',
    description: 'Standard service',
    price_cents: 4000, // R40.00
    details: 'Reliable and affordable',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 9',
    description: 'Deluxe package',
    price_cents: 12000, // R120.00
    details: 'Complete solution',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 10',
    description: 'Basic option',
    price_cents: 2500, // R25.00
    details: 'Simple and effective',
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop&crop=center'
  }
]

/**
 * Get default products for a specific category
 * Returns 10 products tailored to the business category
 */
export function getDefaultProductsForCategory(category: string): DefaultProduct[] {
  if (!category) {
    console.log('⚠️ No category provided, using fallback products')
    return fallbackProducts
  }

  // Normalize category name
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  
  console.log(`🔍 Looking for products for category: "${category}" (normalized: "${normalizedCategory}")`)
  
  // Try exact match first
  if (defaultProductsByCategory[normalizedCategory]) {
    console.log(`✅ Found exact match for category: ${normalizedCategory}`)
    return defaultProductsByCategory[normalizedCategory]
  }
  
  // Try partial matches for common variations
  const categoryMappings: { [key: string]: string } = {
    'butcher': 'butcher-shop',
    'butchery': 'butcher-shop', // Add specific mapping for "butchery"
    'meat': 'butcher-shop',
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'cafe': 'restaurant',
    'bakery': 'bakery',
    'bread': 'bakery',
    'grocery': 'grocery',
    'shop': 'grocery',
    'store': 'grocery',
    'supermarket': 'grocery'
  }
  
  // Check if any mapping key is contained in the category
  for (const [key, mappedCategory] of Object.entries(categoryMappings)) {
    if (normalizedCategory.includes(key)) {
      console.log(`✅ Found partial match: "${key}" -> "${mappedCategory}" for category "${category}"`)
      const products = defaultProductsByCategory[mappedCategory]
      console.log(`📦 Returning ${products.length} products for ${mappedCategory}`)
      return products
    }
  }
  
  console.log(`⚠️ No match found for category: "${category}", using fallback products`)
  return fallbackProducts
}

/**
 * Get all available categories with products
 */
export function getAvailableCategories(): string[] {
  return Object.keys(defaultProductsByCategory)
}

/**
 * Check if a category has specific products defined
 */
export function hasCategoryProducts(category: string): boolean {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  return normalizedCategory in defaultProductsByCategory
}

/**
 * Get default gallery image for a business category
 */
export function getDefaultGalleryImage(category: string): string {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  
  const galleryImages: { [key: string]: string } = {
    'butcher-shop': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop&crop=center',
    'butchery': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop&crop=center',
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
    'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&crop=center',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&crop=center'
  }
  
  // Try exact match first
  if (galleryImages[normalizedCategory]) {
    return galleryImages[normalizedCategory]
  }
  
  // Try partial matches
  for (const [key, imageUrl] of Object.entries(galleryImages)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return imageUrl
    }
  }
  
  // Default business image
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center'
}
