
import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryManager } from '@/components/CategoryManager';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';

const Categories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories = [] } = useCategoriesData();
  const { createCategory, updateCategory, deleteCategory } = useCategoryOperations();

  const handleCreateCategory = useCallback(async (category: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create categories",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCategory({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6',
        criteria: {}
      });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }, [user, createCategory, toast]);

  const handleUpdateCategory = useCallback((id: string, updates: any) => {
    if (!user) return;
    updateCategory({ id, updates });
  }, [user, updateCategory]);

  const handleDeleteCategory = useCallback((id: string) => {
    if (!user) return;
    deleteCategory(id);
  }, [user, deleteCategory]);

  return (
    <div className="p-6">
      <CategoryManager 
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default Categories;
