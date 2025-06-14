
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { CategorySelector } from './CategorySelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types/category';

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onRefresh
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const { toast } = useToast();

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('categories')
      .insert([{
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        criteria: {},
        user_id: (await supabase.auth.getUser()).data.user?.id!
      }]);

    if (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error creating category',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    onRefresh();
    setNewCategory({ name: '', description: '', color: '#3B82F6' });
    setIsCreateOpen(false);
    toast({
      title: 'Category created',
      description: 'Category has been created successfully'
    });
  };

  const handleEditCategory = async () => {
    if (!editCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editCategory.name,
          description: editCategory.description,
          color: editCategory.color
        })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: 'Error updating category',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      onRefresh();
      setEditingCategory(null);
      setEditCategory({ name: '', description: '', color: '#3B82F6' });
      toast({
        title: 'Category updated',
        description: 'Category has been updated successfully'
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    onRefresh();
    toast({
      title: 'Category deleted',
      description: 'Category has been deleted successfully'
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setEditCategory({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const closeEditDialog = () => {
    setEditingCategory(null);
    setEditCategory({ name: '', description: '', color: '#3B82F6' });
  };

  const defaultColors = [
    '#3B82F6', '#DC2626', '#059669', '#7C3AED', '#EA580C', 
    '#0891B2', '#65A30D', '#CA8A04', '#BE185D', '#4338CA'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Category Management
        </CardTitle>
        <CardDescription>
          Organize your leads with custom categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Companies"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description (Optional)</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleCreateCategory} 
                  className="w-full"
                  disabled={!newCategory.name.trim()}
                >
                  Create Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Category Dialog */}
          <Dialog open={!!editingCategory} onOpenChange={(open) => !open && closeEditDialog()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editCategoryName">Category Name</Label>
                  <Input
                    id="editCategoryName"
                    value={editCategory.name}
                    onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Companies"
                  />
                </div>
                <div>
                  <Label htmlFor="editCategoryDescription">Description (Optional)</Label>
                  <Textarea
                    id="editCategoryDescription"
                    value={editCategory.description}
                    onChange={(e) => setEditCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          editCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={closeEditDialog} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditCategory} 
                    className="flex-1"
                    disabled={!editCategory.name.trim()}
                  >
                    Update Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.name === 'General'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
