
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/category';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  placeholder?: string;
  showColor?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder = "Select category",
  showColor = true
}) => {
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <Select value={selectedCategoryId || ''} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              {showColor && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedCategory.color }}
                />
              )}
              <span>{selectedCategory.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map(category => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              {showColor && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
              )}
              <span>{category.name}</span>
              {category.description && (
                <span className="text-xs text-muted-foreground">
                  - {category.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
