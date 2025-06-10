
import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CSVImport } from '@/components/CSVImport';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useLeadOperations } from '@/hooks/useLeadOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import type { Lead } from '@/types/lead';

const Import = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories = [] } = useCategoriesData();
  const { importLeads } = useLeadOperations();
  const { createCategory } = useCategoryOperations();

  const handleImportComplete = useCallback((
    leadsData: Lead[],
    importBatch: any
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to import leads",
        variant: "destructive",
      });
      return;
    }

    importLeads({ leads: leadsData, importBatch });
  }, [user, importLeads, toast]);

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

  return (
    <div className="p-6">
      <CSVImport 
        onImportComplete={handleImportComplete}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
};

export default Import;
