import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';

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

      {/* Instructional Text */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">Use, separated keywords for best results eg.. Meat, beef, 500g</span>
        </div>
      </div>
    </div>
  );
};

export default TagSearchFilters;