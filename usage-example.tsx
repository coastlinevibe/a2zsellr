// Example of how to use the ProductForm with the tagging system

import React from 'react';
import ProductForm from './ProductForm';
import { assignProductTags } from './api-routes';

const CreateProductPage = () => {
  const profileId = 'fb37f61c-315a-4716-830c-0cfbedf5191a'; // Your profile ID

  const handleProductSubmit = async (productData: any) => {
    try {
      // 1. Create the product first
      const { data: product, error: productError } = await supabase
        .from('profile_products')
        .insert([{
          profile_id: profileId,
          name: productData.name,
          description: productData.description,
          price_cents: productData.price_cents,
          currency: productData.currency,
          category: productData.category,
          product_details: productData.product_details,
          image_url: productData.image_url,
          is_active: true
        }])
        .select()
        .single();

      if (productError) throw productError;

      // 2. Assign tags to the product
      if (productData.tags.length > 0) {
        const tagIds = productData.tags.map((tag: any) => tag.id);
        await assignProductTags(product.id, tagIds);
      }

      console.log('Product created successfully:', product);
      // Redirect or show success message
      
    } catch (error) {
      console.error('Failed to create product:', error);
      // Show error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProductForm
          profileId={profileId}
          onSubmit={handleProductSubmit}
        />
      </div>
    </div>
  );
};

// Example of fetching products with tags
const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProductsWithTags();
  }, []);

  const fetchProductsWithTags = async () => {
    try {
      const { data, error } = await supabase
        .from('products_with_tags')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product: any) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-green-600">
              {product.currency} {(product.price_cents / 100).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>

          {/* Display tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CreateProductPage;