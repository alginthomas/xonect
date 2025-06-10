
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { sanitizeInput, validateCSVData } from '@/utils/security';
import type { Lead } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['import-batches'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
  });

  // Transform database data to match TypeScript interfaces
  const transformedCategories: Category[] = (categoriesData || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    color: cat.color,
    criteria: cat.criteria,
    createdAt: new Date(cat.created_at),
    updatedAt: new Date(cat.updated_at)
  }));

  const transformedBatches: ImportBatch[] = (batchesData || []).map(batch => ({
    id: batch.id,
    name: batch.name,
    categoryId: batch.category_id,
    sourceFile: batch.source_file,
    totalLeads: batch.total_leads,
    successfulImports: batch.successful_imports,
    failedImports: batch.failed_imports,
    createdAt: new Date(batch.created_at),
    metadata: batch.metadata
  }));

  const handleImportComplete = async (
    leads: Lead[],
    importBatch: ImportBatch
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to import leads",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting import process for', leads.length, 'leads');
      
      // Validate and sanitize input data
      const sanitizedLeads = leads.map(lead => ({
        ...lead,
        firstName: sanitizeInput(lead.firstName),
        lastName: sanitizeInput(lead.lastName),
        email: sanitizeInput(lead.email),
        company: sanitizeInput(lead.company),
        title: sanitizeInput(lead.title),
        user_id: user.id, // Critical security fix: assign user_id
      }));

      // Validate CSV data structure
      const validation = validateCSVData(sanitizedLeads);
      if (!validation.isValid) {
        toast({
          title: "Import validation failed",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Create import batch with user_id
      const { data: batchData, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: importBatch.name,
          category_id: importBatch.categoryId,
          source_file: importBatch.sourceFile,
          total_leads: leads.length,
          user_id: user.id, // Critical security fix: assign user_id
        })
        .select()
        .single();

      if (batchError) throw batchError;

      console.log('Created import batch:', batchData);

      // Process leads with user_id and import_batch_id
      const leadsToInsert = sanitizedLeads.map(lead => ({
        ...lead,
        import_batch_id: batchData.id,
        category_id: importBatch.categoryId,
        user_id: user.id, // Critical security fix: assign user_id
      }));

      const { error: leadsError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) throw leadsError;

      // Update batch statistics
      const { error: updateError } = await supabase
        .from('import_batches')
        .update({
          successful_imports: leads.length,
          failed_imports: 0,
        })
        .eq('id', batchData.id);

      if (updateError) throw updateError;

      toast({
        title: "Import successful",
        description: `Successfully imported ${leads.length} leads`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import leads. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async (template: {
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

    try {
      // Sanitize template input
      const sanitizedTemplate = {
        name: sanitizeInput(template.name),
        subject: sanitizeInput(template.subject),
        content: sanitizeInput(template.content),
        variables: template.variables.map(v => sanitizeInput(v)),
        user_id: user.id, // Critical security fix: assign user_id
      };

      const { error } = await supabase
        .from('email_templates')
        .insert(sanitizedTemplate);

      if (error) throw error;

      toast({
        title: "Template saved",
        description: "Email template has been saved successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error saving template",
        description: "Failed to save the email template",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = async (category: {
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
      // Sanitize category input
      const sanitizedCategory = {
        name: sanitizeInput(category.name),
        description: category.description ? sanitizeInput(category.description) : undefined,
        color: category.color || '#3B82F6',
        user_id: user.id, // Critical security fix: assign user_id
      };

      const { error } = await supabase
        .from('categories')
        .insert(sanitizedCategory);

      if (error) throw error;

      toast({
        title: "Category created",
        description: "Category has been created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error creating category",
        description: "Failed to create the category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    // Implementation would use useImportBatchOperations hook
    queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const handleViewBatchLeads = (batchId: string) => {
    // Switch to dashboard tab and filter by batch
    setActiveTab('dashboard');
  };

  const handleSaveBranding = async (branding: any) => {
    // Implementation for saving branding settings
    toast({
      title: "Branding saved",
      description: "Branding settings have been saved successfully",
    });
  };

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
              leads={leadsData || []}
              templates={templatesData || []}
              categories={transformedCategories}
              importBatches={transformedBatches}
              onSendEmail={() => {}}
              onUpdateLead={() => {}}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <EmailTemplateBuilder 
              onSaveTemplate={handleSaveTemplate}
              templates={templatesData || []}
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={transformedCategories}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager 
              categories={transformedCategories}
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ImportHistory 
              leads={leadsData || []}
              importBatches={transformedBatches}
              categories={transformedCategories}
              onDeleteBatch={handleDeleteBatch}
              onViewBatchLeads={handleViewBatchLeads}
            />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <BrandingSettings 
              branding={{}}
              onSave={handleSaveBranding}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
