
import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { ImportHistory } from '@/components/ImportHistory';
import { BrandingSettings } from '@/components/BrandingSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useTemplatesData } from '@/hooks/useTemplatesData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useImportBatchesData } from '@/hooks/useImportBatchesData';
import { useLeadOperations } from '@/hooks/useLeadOperations';
import { useTemplateOperations } from '@/hooks/useTemplateOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import type { Lead } from '@/types/lead';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data fetching hooks
  const { data: leads = [], isLoading: leadsLoading } = useLeadsData();
  const { data: templates = [], isLoading: templatesLoading } = useTemplatesData();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesData();
  const { data: importBatches = [], isLoading: batchesLoading } = useImportBatchesData();

  // Operation hooks
  const { updateLead, importLeads } = useLeadOperations();
  const { saveTemplate } = useTemplateOperations();
  const { createCategory, updateCategory, deleteCategory } = useCategoryOperations();

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

  const handleSaveTemplate = useCallback((template: {
    name: string;
    subject: string;
    content: string;
    variables: string[];
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save templates",
        variant: "destructive",
      });
      return;
    }

    saveTemplate(template);
  }, [user, saveTemplate, toast]);

  const handleCreateCategory = useCallback((category: {
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

    createCategory(category);
  }, [user, createCategory, toast]);

  const handleUpdateCategory = useCallback((id: string, updates: any) => {
    if (!user) return;
    updateCategory({ id, updates });
  }, [user, updateCategory]);

  const handleDeleteCategory = useCallback((id: string) => {
    if (!user) return;
    deleteCategory(id);
  }, [user, deleteCategory]);

  const handleDeleteBatch = useCallback(async (batchId: string) => {
    queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  }, [queryClient]);

  const handleViewBatchLeads = useCallback((batchId: string) => {
    setActiveTab('dashboard');
  }, []);

  const handleUpdateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    if (!user) return;
    updateLead({ leadId, updates });
  }, [user, updateLead]);

  const handleSaveBranding = useCallback(async (branding: any) => {
    toast({
      title: "Branding saved",
      description: "Branding settings have been saved successfully",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <LeadsDashboard 
              leads={leads}
              templates={templates}
              categories={categories}
              importBatches={importBatches}
              branding={{
                companyName: '',
                companyLogo: '',
                companyWebsite: '',
                companyAddress: '',
                senderName: '',
                senderEmail: ''
              }}
              onUpdateLead={handleUpdateLead}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <EmailTemplateBuilder 
              onSaveTemplate={handleSaveTemplate}
              templates={templates}
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={categories}
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager 
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ImportHistory 
              leads={leads}
              importBatches={importBatches}
              categories={categories}
              onDeleteBatch={handleDeleteBatch}
              onViewBatchLeads={handleViewBatchLeads}
            />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <BrandingSettings 
              branding={{
                companyName: '',
                companyLogo: '',
                companyWebsite: '',
                companyAddress: '',
                senderName: '',
                senderEmail: ''
              }}
              onSave={handleSaveBranding}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
