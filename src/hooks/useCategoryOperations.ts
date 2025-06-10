
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/security';
import type { Category } from '@/types/category';

export const useCategoryOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (category: {
      name: string;
      description?: string;
      color?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const sanitizedCategory = {
        name: sanitizeInput(category.name),
        description: category.description ? sanitizeInput(category.description) : undefined,
        color: category.color || '#3B82F6',
        user_id: user.id,
      };

      const { error } = await supabase
        .from('categories')
        .insert(sanitizedCategory);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "Category has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: "Error creating category",
        description: "Failed to create the category",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Category updated",
        description: "Category has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: "Failed to update the category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: "Failed to delete the category",
        variant: "destructive",
      });
    },
  });

  return {
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
};
