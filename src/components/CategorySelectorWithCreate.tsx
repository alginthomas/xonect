
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types/category';

interface CategorySelectorWithCreateProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onCreateCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  placeholder?: string;
}

export const CategorySelectorWithCreate: React.FC<CategorySelectorWithCreateProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onCreateCategory,
  placeholder = "Select or create category"
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (value: string) => {
    setCustomInput(value);
    
    // Check if the typed value matches any existing category
    const exactMatch = categories.find(cat => 
      cat.name.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      onCategoryChange(exactMatch.id);
      setShowCreateForm(false);
    } else if (value.trim() && !exactMatch) {
      // Show create form if typing a new category name
      setShowCreateForm(true);
      setNewCategoryName(value.trim());
    } else {
      setShowCreateForm(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await onCreateCategory({
        name: newCategoryName,
        description: `Created during import`,
        color: '#3B82F6',
        criteria: {}
      });
      
      // Find the newly created category and select it
      const newCategory = categories.find(cat => 
        cat.name.toLowerCase() === newCategoryName.toLowerCase()
      );
      
      if (newCategory) {
        onCategoryChange(newCategory.id);
      }
      
      setShowCreateForm(false);
      setCustomInput(newCategoryName);
      setNewCategoryName('');
      
      toast({
        title: "Category created",
        description: `Category "${newCategoryName}" has been created and selected`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={customInput || selectedCategory?.name || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
        
        {categories.length > 0 && (
          <Select 
            value={selectedCategoryId} 
            onValueChange={(value) => {
              onCategoryChange(value);
              const selected = categories.find(cat => cat.id === value);
              setCustomInput(selected?.name || '');
              setShowCreateForm(false);
            }}
          >
            <SelectTrigger className="mt-1 opacity-75">
              <SelectValue placeholder="Or select from existing categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {showCreateForm && (
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>Create new category: "{newCategoryName}"</span>
              </div>
              <Button 
                onClick={handleCreateCategory}
                disabled={isCreating}
                size="sm"
                className="w-full"
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
