import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { ImportHistory } from '@/components/ImportHistory';
import { BrandingSettings } from '@/components/BrandingSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['import-batches'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const handleImportComplete = async (
    leads: any[],
    fileName: string,
    categoryId?: string
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
      
      // Create import batch with user_id
      const { data: batchData, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: fileName,
          category_id: categoryId,
          source_file: fileName,
          total_leads: leads.length,
          user_id: user.id, // Critical security fix: assign user_id
        })
        .select()
        .single();

      if (batchError) throw batchError;

      console.log('Created import batch:', batchData);

      // Process leads with user_id
      const leadsToInsert = leads.map(lead => ({
        ...lead,
        import_batch_id: batchData.id,
        category_id: categoryId,
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
      const { error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          user_id: user.id, // Critical security fix: assign user_id
        });

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
      const { error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id, // Critical security fix: assign user_id
        });

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
            <LeadsDashboard />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <EmailTemplateBuilder onSaveTemplate={handleSaveTemplate} />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={categoriesData || []}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager 
              categories={categoriesData || []} 
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ImportHistory batches={batchesData || []} />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <BrandingSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
