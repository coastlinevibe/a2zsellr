import React, { useState } from 'react';
import { X, Plus, Search, Edit2 } from 'lucide-react';

interface ProductTag {
  id: string;
  name: string;
  icon?: string;
  color: string;
  is_system_tag: boolean;
  category?: string;
}

interface ProductTagSelectorProps {
  selectedTags: ProductTag[];
  onTagsChange: (tags: ProductTag[]) => void;
  availableTags: ProductTag[];
  onCreateTag: (tagData: { name: string; icon?: string; color: string }) => Promise<ProductTag>;
  onUpdateTag?: (tagId: string, tagData: { name: string; icon?: string; color: string }) => Promise<ProductTag>;
  selectedCategory?: string; // Add category prop to filter tags
  userTier?: 'free' | 'premium' | 'business'; // Add tier prop for tag limits
}

const ProductTagSelector: React.FC<ProductTagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
  onCreateTag,
  onUpdateTag,
  selectedCategory = 'products',
  userTier = 'free'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    icon: '',
    color: '#3B82F6'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    icon: '',
    color: '#3B82F6'
  });

  // Tier-based tag limits
  const TAG_LIMITS = {
    free: 2,
    premium: 5,
    business: 15
  };

  const maxTags = TAG_LIMITS[userTier];
  const canAddMoreTags = selectedTags.length < maxTags;

  // Filter tags based on selected category and search term
  const categoryFilteredTags = availableTags.filter(tag => {
    // Show general tags and tags matching the selected category
    const categoryMatch = !tag.category || tag.category === 'general' || tag.category === selectedCategory;
    return categoryMatch;
  });

  const filteredTags = categoryFilteredTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  const handleTagSelect = (tag: ProductTag) => {
    if (selectedTags.length >= maxTags) {
      return; // Don't add if limit reached
    }
    onTagsChange([...selectedTags, tag]);
    setSearchTerm('');
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleTagEdit = (tag: ProductTag) => {
    // Only allow editing of non-system tags
    if (tag.is_system_tag) return;
    
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      icon: tag.icon || '',
      color: tag.color
    });
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editForm.name.trim() || !onUpdateTag || isCreating) return;

    try {
      setIsCreating(true);
      const updatedTag = await onUpdateTag(editingTag.id, {
        name: editForm.name,
        icon: editForm.icon,
        color: editForm.color
      });
      
      // Update the tag in selectedTags
      const updatedSelectedTags = selectedTags.map(tag => 
        tag.id === editingTag.id ? updatedTag : tag
      );
      onTagsChange(updatedSelectedTags);
      
      setEditingTag(null);
      setEditForm({ name: '', icon: '', color: '#3B82F6' });
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const createMultipleTags = async (tagNamesString: string, tagIcon?: string, tagColor?: string) => {
    const tagNames = tagNamesString.split(',').map(name => name.trim()).filter(name => name.length > 0);
    
    // Limit to maximum 4 commas (5 tags) and respect tier limits
    const maxNewTags = Math.min(5, maxTags - selectedTags.length);
    const limitedTagNames = tagNames.slice(0, maxNewTags);
    
    const createdTags: ProductTag[] = [];
    
    for (const tagName of limitedTagNames) {
      // Check if we've reached the tier limit
      if (selectedTags.length + createdTags.length >= maxTags) {
        break;
      }
      
      // Check if tag already exists
      const existingTag = availableTags.find(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (existingTag && !selectedTags.some(selected => selected.id === existingTag.id)) {
        // Use existing tag
        createdTags.push(existingTag);
      } else if (!existingTag) {
        // Create new tag
        const createdTag = await onCreateTag({
          name: tagName,
          icon: tagIcon || '',
          color: tagColor || '#3B82F6'
        });
        createdTags.push(createdTag);
      }
    }
    
    return createdTags;
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim() || isCreating) return;

    try {
      setIsCreating(true);
      
      const createdTags = await createMultipleTags(newTag.name, newTag.icon, newTag.color);
      
      // Add all created/found tags to selection
      onTagsChange([...selectedTags, ...createdTags]);
      
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
        Product Tags ({selectedTags.length}/{maxTags})
        <span className="text-xs text-gray-500 font-normal">(Optional - help customers find your product)</span>
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white group"
              style={{ backgroundColor: tag.color }}
            >
              {tag.icon && <span>{tag.icon}</span>}
              {tag.name}
              <div className="flex items-center gap-0.5 ml-1">
                {!tag.is_system_tag && onUpdateTag && (
                  <button
                    type="button"
                    onClick={() => handleTagEdit(tag)}
                    className="hover:bg-black/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit tag"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag.id)}
                  className="hover:bg-black/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove tag"
                >
                  <X size={14} />
                </button>
              </div>
            </span>
          ))}
        </div>
      )}

      {/* Tag Limit Warning */}
      {selectedTags.length >= maxTags && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Tag Limit Reached</p>
              <p className="text-xs text-amber-700">
                {userTier === 'free' && 'Free accounts can add up to 2 tags per product. Upgrade to Premium for 5 tags.'}
                {userTier === 'premium' && 'Premium accounts can add up to 5 tags per product. Upgrade to Business for 15 tags.'}
                {userTier === 'business' && 'You\'ve reached the maximum of 15 tags per product.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add Tags */}
      <div className="relative mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={canAddMoreTags ? "Search tags or type to create new (use commas for multiple)..." : "Tag limit reached"}
            value={searchTerm}
            onChange={(e) => canAddMoreTags && setSearchTerm(e.target.value)}
            disabled={!canAddMoreTags}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!canAddMoreTags ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Tag Suggestions */}
        {searchTerm && canAddMoreTags && (
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
                onClick={async () => {
                  // Check if searchTerm contains commas for multiple tags
                  const tagNames = searchTerm.split(',').map(name => name.trim()).filter(name => name.length > 0);
                  const remainingSlots = maxTags - selectedTags.length;
                  
                  if (tagNames.length > 1) {
                    // Multiple tags - create them directly with limits
                    try {
                      setIsCreating(true);
                      const createdTags = await createMultipleTags(searchTerm, newTag.icon, newTag.color);
                      onTagsChange([...selectedTags, ...createdTags]);
                      setSearchTerm('');
                    } catch (error) {
                      console.error('Failed to create tags:', error);
                    } finally {
                      setIsCreating(false);
                    }
                  } else {
                    // Single tag - show form
                    setNewTag({ ...newTag, name: searchTerm });
                    setShowCreateForm(true);
                    setSearchTerm('');
                  }
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-emerald-600"
                disabled={isCreating || !canAddMoreTags}
              >
                <Plus size={16} />
                {isCreating ? 'Creating...' : (
                  searchTerm.includes(',') 
                    ? (() => {
                        const tagCount = searchTerm.split(',').filter(name => name.trim()).length;
                        const remainingSlots = maxTags - selectedTags.length;
                        const maxCommas = Math.min(4, remainingSlots - 1); // Max 4 commas (5 tags) or remaining slots
                        const actualCount = Math.min(tagCount, remainingSlots, 5);
                        
                        if (tagCount > 5) {
                          return `Create ${actualCount} tags (max 5 per input)`;
                        } else if (tagCount > remainingSlots) {
                          return `Create ${actualCount} tags (${remainingSlots} slots left)`;
                        } else {
                          return `Create ${actualCount} tags`;
                        }
                      })()
                    : `Create "${searchTerm}" tag`
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Tag Form */}
      {editingTag && (
        <div className="border border-blue-300 rounded-lg p-4 bg-blue-50 mb-3">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Edit2 size={16} className="text-blue-600" />
            Edit Tag: {editingTag.name}
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🏷️ or emoji"
                />
                <div className="flex gap-1">
                  {commonIcons.slice(0, 5).map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, icon })}
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
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{editForm.color}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleUpdateTag}
                disabled={!editForm.name.trim() || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isCreating ? 'Updating...' : 'Update Tag'}
              </button>
              <button
                type="button"
                onClick={() => setEditingTag(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Tag Form */}
      {showCreateForm && canAddMoreTags && (
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
                placeholder="Enter tag name or multiple tags separated by commas"
              />
              {newTag.name.includes(',') && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Multiple tags detected! This will create {(() => {
                    const tagCount = newTag.name.split(',').filter(name => name.trim()).length;
                    const remainingSlots = maxTags - selectedTags.length;
                    const actualCount = Math.min(tagCount, remainingSlots, 5);
                    
                    if (tagCount > 5) {
                      return `${actualCount} tags (max 5 per input, ${tagCount - 5} will be ignored)`;
                    } else if (tagCount > remainingSlots) {
                      return `${actualCount} tags (${remainingSlots} slots available)`;
                    } else {
                      return `${actualCount} separate tags`;
                    }
                  })()} 
                </p>
              )}
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

      {/* Quick Add Category-Specific Tags */}
      {canAddMoreTags && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Popular {selectedCategory} tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryFilteredTags
              .filter(tag => tag.is_system_tag && !selectedTags.some(selected => selected.id === tag.id))
              .slice(0, 12)
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
      )}
    </div>
  );
};

export default ProductTagSelector;