// Default products for bulk upload - category-based product generation
// Each category gets 10 default products with realistic South African pricing

interface DefaultProduct {
  name: string
  description: string
  price_cents: number // Price in cents (R45.00 = 4500 cents)
  details: string
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
      details: 'Clean, Nice red color, Juicy and soft, Not too boney'
    },
    {
      name: 'Beef Steaks 1kg',
      description: 'Premium cuts, tender and juicy',
      price_cents: 8500, // R85.00
      details: 'Fresh, Grade A beef, Perfect for grilling'
    },
    {
      name: 'Chicken Breasts 500g',
      description: 'Fresh, lean protein',
      price_cents: 3500, // R35.00
      details: 'Skinless, boneless, farm fresh'
    },
    {
      name: 'Pork Ribs 1kg',
      description: 'Succulent and flavorful',
      price_cents: 6500, // R65.00
      details: 'Meaty ribs, perfect for braai'
    },
    {
      name: 'Mince Beef 500g',
      description: 'Fresh ground beef',
      price_cents: 4000, // R40.00
      details: 'Lean mince, daily fresh preparation'
    },
    {
      name: 'Boerewors 1kg',
      description: 'Traditional South African sausage',
      price_cents: 5500, // R55.00
      details: 'Authentic recipe, coarse grind'
    },
    {
      name: 'Bacon 500g',
      description: 'Crispy, smoky flavor',
      price_cents: 5000, // R50.00
      details: 'Streaky bacon, perfect thickness'
    },
    {
      name: 'Chicken Thighs 1kg',
      description: 'Juicy and tender',
      price_cents: 4500, // R45.00
      details: 'Bone-in thighs, skin-on'
    },
    {
      name: 'Beef Biltong 250g',
      description: 'Dried, seasoned meat',
      price_cents: 7500, // R75.00
      details: 'Traditional spices, air-dried'
    },
    {
      name: 'Sosaties 500g',
      description: 'Marinated meat skewers',
      price_cents: 6000, // R60.00
      details: 'Mixed meat, traditional marinade'
    }
  ],

  'restaurant': [
    {
      name: 'Grilled Chicken Burger',
      description: 'Juicy grilled chicken with fresh salad',
      price_cents: 8500, // R85.00
      details: 'Served with chips and sauce'
    },
    {
      name: 'Beef Steak 300g',
      description: 'Premium beef steak cooked to perfection',
      price_cents: 12500, // R125.00
      details: 'Choice of sauce, served with vegetables'
    },
    {
      name: 'Fish and Chips',
      description: 'Fresh fish with golden chips',
      price_cents: 9500, // R95.00
      details: 'Served with tartar sauce and lemon'
    },
    {
      name: 'Chicken Schnitzel',
      description: 'Crispy breaded chicken breast',
      price_cents: 8000, // R80.00
      details: 'Served with mushroom sauce'
    },
    {
      name: 'Pasta Bolognese',
      description: 'Traditional meat sauce pasta',
      price_cents: 7500, // R75.00
      details: 'Rich tomato and meat sauce'
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh lettuce with Caesar dressing',
      price_cents: 6500, // R65.00
      details: 'Croutons, parmesan, grilled chicken'
    },
    {
      name: 'Pizza Margherita',
      description: 'Classic tomato and mozzarella pizza',
      price_cents: 8500, // R85.00
      details: 'Fresh basil, wood-fired oven'
    },
    {
      name: 'Lamb Curry',
      description: 'Tender lamb in rich curry sauce',
      price_cents: 9500, // R95.00
      details: 'Served with rice and naan bread'
    },
    {
      name: 'Seafood Platter',
      description: 'Mixed seafood selection',
      price_cents: 15500, // R155.00
      details: 'Prawns, calamari, fish, mussels'
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate dessert',
      price_cents: 4500, // R45.00
      details: 'Served with vanilla ice cream'
    }
  ],

  'bakery': [
    {
      name: 'Fresh White Bread',
      description: 'Daily baked white loaf',
      price_cents: 1500, // R15.00
      details: 'Soft, fresh, perfect for sandwiches'
    },
    {
      name: 'Whole Wheat Bread',
      description: 'Healthy whole wheat loaf',
      price_cents: 1800, // R18.00
      details: 'High fiber, nutritious'
    },
    {
      name: 'Croissants (6 pack)',
      description: 'Buttery, flaky pastries',
      price_cents: 3500, // R35.00
      details: 'Perfect for breakfast'
    },
    {
      name: 'Chocolate Muffins (4 pack)',
      description: 'Rich chocolate chip muffins',
      price_cents: 2800, // R28.00
      details: 'Moist and delicious'
    },
    {
      name: 'Meat Pies (2 pack)',
      description: 'Traditional South African pies',
      price_cents: 2500, // R25.00
      details: 'Beef mince filling, flaky pastry'
    },
    {
      name: 'Sausage Rolls (4 pack)',
      description: 'Savory sausage in pastry',
      price_cents: 3200, // R32.00
      details: 'Perfect snack or lunch'
    },
    {
      name: 'Birthday Cake (Small)',
      description: 'Custom decorated cake',
      price_cents: 12000, // R120.00
      details: 'Vanilla or chocolate, serves 8-10'
    },
    {
      name: 'Rusks (500g)',
      description: 'Traditional South African rusks',
      price_cents: 4500, // R45.00
      details: 'Perfect with coffee or tea'
    },
    {
      name: 'Donuts (6 pack)',
      description: 'Fresh glazed donuts',
      price_cents: 3000, // R30.00
      details: 'Various flavors available'
    },
    {
      name: 'Sandwich Platters',
      description: 'Assorted sandwich selection',
      price_cents: 8500, // R85.00
      details: 'Perfect for meetings or events'
    }
  ],

  'grocery': [
    {
      name: 'Fresh Milk 2L',
      description: 'Full cream fresh milk',
      price_cents: 2200, // R22.00
      details: 'Farm fresh, daily delivery'
    },
    {
      name: 'Brown Eggs (18 pack)',
      description: 'Free range brown eggs',
      price_cents: 4500, // R45.00
      details: 'Large size, farm fresh'
    },
    {
      name: 'White Sugar 2.5kg',
      description: 'Pure white sugar',
      price_cents: 3500, // R35.00
      details: 'Premium quality'
    },
    {
      name: 'Cooking Oil 2L',
      description: 'Sunflower cooking oil',
      price_cents: 4200, // R42.00
      details: 'Light and healthy'
    },
    {
      name: 'Rice 2kg',
      description: 'Long grain white rice',
      price_cents: 2800, // R28.00
      details: 'Premium quality rice'
    },
    {
      name: 'Potatoes 2kg',
      description: 'Fresh local potatoes',
      price_cents: 2500, // R25.00
      details: 'Perfect for cooking and baking'
    },
    {
      name: 'Onions 2kg',
      description: 'Fresh yellow onions',
      price_cents: 2200, // R22.00
      details: 'Essential cooking ingredient'
    },
    {
      name: 'Tomatoes 1kg',
      description: 'Fresh ripe tomatoes',
      price_cents: 2800, // R28.00
      details: 'Perfect for salads and cooking'
    },
    {
      name: 'Bananas 1kg',
      description: 'Sweet ripe bananas',
      price_cents: 2000, // R20.00
      details: 'Healthy and nutritious'
    },
    {
      name: 'Apples 1kg',
      description: 'Fresh red apples',
      price_cents: 3500, // R35.00
      details: 'Crisp and sweet'
    }
  ]
}

// Fallback products for unknown categories
const fallbackProducts: DefaultProduct[] = [
  {
    name: 'Product 1',
    description: 'Quality product for your needs',
    price_cents: 5000, // R50.00
    details: 'High quality, great value'
  },
  {
    name: 'Product 2',
    description: 'Premium service offering',
    price_cents: 7500, // R75.00
    details: 'Professional service, excellent results'
  },
  {
    name: 'Product 3',
    description: 'Essential item',
    price_cents: 3500, // R35.00
    details: 'Must-have product'
  },
  {
    name: 'Product 4',
    description: 'Popular choice',
    price_cents: 4500, // R45.00
    details: 'Customer favorite'
  },
  {
    name: 'Product 5',
    description: 'Special offer',
    price_cents: 6000, // R60.00
    details: 'Limited time special'
  },
  {
    name: 'Product 6',
    description: 'Value package',
    price_cents: 8000, // R80.00
    details: 'Great value for money'
  },
  {
    name: 'Product 7',
    description: 'Premium option',
    price_cents: 9500, // R95.00
    details: 'Top quality choice'
  },
  {
    name: 'Product 8',
    description: 'Standard service',
    price_cents: 4000, // R40.00
    details: 'Reliable and affordable'
  },
  {
    name: 'Product 9',
    description: 'Deluxe package',
    price_cents: 12000, // R120.00
    details: 'Complete solution'
  },
  {
    name: 'Product 10',
    description: 'Basic option',
    price_cents: 2500, // R25.00
    details: 'Simple and effective'
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
