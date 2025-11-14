const { getDefaultProductsForCategory } = require('./lib/defaultProducts.ts');

async function testBulkUploadSystem() {
  console.log('🧪 Testing Bulk Upload System...\n');
  
  // Test 1: Check default products for butcher category
  console.log('=== Test 1: Butcher Shop Products ===');
  const butcherProducts = getDefaultProductsForCategory('butcher-shop');
  console.log(`Products count: ${butcherProducts.length}`);
  console.log('Sample products:');
  butcherProducts.slice(0, 3).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - R${(product.price_cents / 100).toFixed(2)}`);
    console.log(`   Description: ${product.description}`);
    console.log(`   Details: ${product.details}\n`);
  });
  
  // Test 2: Check restaurant products
  console.log('=== Test 2: Restaurant Products ===');
  const restaurantProducts = getDefaultProductsForCategory('restaurant');
  console.log(`Products count: ${restaurantProducts.length}`);
  console.log('Sample products:');
  restaurantProducts.slice(0, 2).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - R${(product.price_cents / 100).toFixed(2)}`);
  });
  
  // Test 3: Check fallback products
  console.log('\n=== Test 3: Unknown Category (Fallback) ===');
  const fallbackProducts = getDefaultProductsForCategory('unknown-category');
  console.log(`Products count: ${fallbackProducts.length}`);
  console.log('First product:', fallbackProducts[0].name);
  
  // Test 4: Verify all products have required fields
  console.log('\n=== Test 4: Product Structure Validation ===');
  const testProducts = getDefaultProductsForCategory('butcher-shop');
  const requiredFields = ['name', 'description', 'price_cents', 'details'];
  
  let allValid = true;
  testProducts.forEach((product, index) => {
    requiredFields.forEach(field => {
      if (!product[field]) {
        console.log(`❌ Product ${index + 1} missing field: ${field}`);
        allValid = false;
      }
    });
  });
  
  if (allValid) {
    console.log('✅ All products have required fields');
  }
  
  console.log('\n🎉 Bulk Upload System Test Complete!');
}

testBulkUploadSystem();
