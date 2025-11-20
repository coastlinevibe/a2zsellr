import React, { useState } from 'react';
import ProductTagSelector from './ProductTagSelector';

interface ProductTag {
  id: string;
  name: string;
  icon?: string;
  color: string;
  is_system_tag: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  category: string;
  product_details: string;
  image_url: string;
  tags: ProductTag[];
}

interface ProductFormProps {
  profileId: string;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  profileId,
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price_cents: 0,
    currency: 'ZAR',
    category: 'services',
    product_details: '',
    image_url: '',
    tags: [],
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData.name ? 'Edit Product' : 'Create New Product'}
        </h2>

        {/* Product Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your product or service"
          />
        </div>

        {/* Price and Currency */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (cents) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price_cents}
              onChange={(e) => handleInputChange('price_cents', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="14900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Price in cents (e.g., 14900 = R149.00)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ZAR">ZAR (South African Rand)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="services">Services</option>
            <option value="products">Products</option>
            <option value="digital">Digital</option>
            <option value="consulting">Consulting</option>
            <option value="software">Software</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="food">Food & Beverage</option>
            <option value="fashion">Fashion</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Tags */}
        <ProductTagSelector
          selectedTags={formData.tags}
          onTagsChange={(tags) => handleInputChange('tags', tags)}
          profileId={profileId}
        />

        {/* Product Details */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Details
          </label>
          <textarea
            rows={4}
            value={formData.product_details}
            onChange={(e) => handleInputChange('product_details', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Professional&#10;Great Value&#10;Easy to use&#10;Multi platform"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter each detail on a new line
          </p>
        </div>

        {/* Image URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (initialData.name ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      {/* Preview */}
      {formData.name && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt={formData.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                <p className="text-gray-600 text-sm mt-1">{formData.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-green-600">
                    {formData.currency} {(formData.price_cents / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formData.category}
                  </span>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map(tag => (
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
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ProductForm;