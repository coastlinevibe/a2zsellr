import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';

interface ProductTag {
  id: string;
  name: string;
  icon?: string;
  color: string;
  is_system_tag: boolean;
}

interface ProductTagSelectorProps {
  selectedTags: ProductTag[];
  onTagsChange: (tags: ProductTag[]) => void;
  availableTags: ProductTag[];
  onCreateTag: (tagData: { name: string; icon?: string; color: string }) => Promise<ProductTag>;
}

const ProductTagSelector: React.FC<ProductTagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
  onCreateTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    icon: '',
    color: '#3B82F6'
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  const handleTagSelect = (tag: ProductTag) => {
    onTagsChange([...selectedTags, tag]);
    setSearchTerm('');
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim() || isCreating) return;

    try {
      setIsCreating(true);
      const createdTag = await onCreateTag({
        name: newTag.name,
        icon: newTag.icon,
        color: newTag.color
      });
      
      handleTagSelect(createdTag);
      setNewTag({ name: '', icon: '', color: '#3B82F6' });
      setShowCreateForm(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const commonIcons = ['🏷️', '⭐', '🔥', '💎', '🚀', '💡', '🎯', '🔧', '📦', '💻', '🏥', '🍕', '👕', '📚', '🎨'];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
        Product Tags
        <span className="text-xs text-gray-500 font-normal">(Optional - help customers find your product)</span>
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.icon && <span>{tag.icon}</span>}
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-1 hover:bg-black/20 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search and Add Tags */}
      <div className="relative mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tags or type to create new..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Tag Suggestions */}
        {searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  <span>{tag.name}</span>
                  {tag.is_system_tag && (
                    <span className="ml-auto text-xs text-gray-500">System</span>
                  )}
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNewTag({ ...newTag, name: searchTerm });
                  setShowCreateForm(true);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-emerald-600"
              >
                <Plus size={16} />
                Create "{searchTerm}" tag
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create New Tag Form */}
      {showCreateForm && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-3">
          <h4 className="font-medium text-gray-900 mb-3">Create New Tag</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter tag name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag.icon}
                  onChange={(e) => setNewTag({ ...newTag, icon: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="🏷️ or emoji"
                />
                <div className="flex gap-1">
                  {commonIcons.slice(0, 5).map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewTag({ ...newTag, icon })}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{newTag.color}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTag.name.trim() || isCreating}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Tag'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add System Tags */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter(tag => tag.is_system_tag && !selectedTags.some(selected => selected.id === tag.id))
            .slice(0, 8)
            .map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
              >
                {tag.icon && <span>{tag.icon}</span>}
                {tag.name}
                <Plus size={12} />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductTagSelector;