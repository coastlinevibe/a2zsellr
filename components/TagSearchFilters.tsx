import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ProductTag {
  id: string;
  name: string;
  icon?: string;
  color: string;
  is_system_tag: boolean;
  category?: string;
  product_count?: number;
}

interface TagSearchFiltersProps {
  onTagSelect: (tagName: string) => void;
  selectedTags: string[];
  onTagRemove: (tagName: string) => void;
}

const TagSearchFilters: React.FC<TagSearchFiltersProps> = ({
  onTagSelect,
  selectedTags,
  onTagRemove
}) => {
  const [popularTags, setPopularTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      setLoading(true);
      
      // Get popular tags (system tags + most used user tags)
      const { data: tags, error } = await supabase
        .from('product_tags')
        .select(`
          id,
          name,
          icon,
          color,
          is_system_tag
        `)
        .order('is_system_tag', { ascending: false })
        .order('name')
        .limit(12);

      if (error) throw error;
      setPopularTags(tags || []);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-bold text-gray-700">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagName => {
              const tag = popularTags.find(t => t.name === tagName);
              return (
                <motion.button
                  key={tagName}
                  onClick={() => onTagRemove(tagName)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  style={{ backgroundColor: tag?.color || '#3B82F6' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag?.icon && <span>{tag.icon}</span>}
                  {tagName}
                  <X size={14} />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">Use example tags or type in search bar to search for products in businesses:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags
            .filter(tag => !selectedTags.includes(tag.name))
            .slice(0, 4)
            .map(tag => (
              <motion.button
                key={tag.id}
                onClick={() => onTagSelect(tag.name)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border-2 border-black rounded-full hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all bg-white hover:bg-gray-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag.icon && (
                  <span 
                    className="w-3 h-3 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                  >
                    {tag.icon}
                  </span>
                )}
                <span className="font-bold text-gray-700">{tag.name}</span>
                {tag.is_system_tag && (
                  <span className="text-xs text-gray-500">✓</span>
                )}
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TagSearchFilters;