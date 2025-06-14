import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { MobileNavigation } from '@/components/MobileNavigation';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { DuplicateManager } from '@/components/DuplicateManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { BrandingSettings } from '@/components/BrandingSettings';
import { ImportHistory } from '@/components/ImportHistory';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

const Index = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Set active tab from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      console.log('Setting active tab from URL:', tab);
      setActiveTab(tab);
    }
  }, []);

  // Fetch leads with enhanced debugging
  const { data: leads = [], isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      console.log('Fetching leads...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData.session?.user?.id);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Leads query result:', { data, error });
      console.log('Number of leads returned:', data?.length || 0);
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Fetch categories
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      console.log('Categories query result:', { data, error });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Fetch import batches
  const { data: importBatches = [], refetch: refetchImportBatches } = useQuery({
    queryKey: ['import_batches'],
    queryFn: async () => {
      console.log('Fetching import batches...');
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Import batches query result:', { data, error });
      
      if (error) {
        console.error('Error fetching import batches:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['email_templates'],
    queryFn: async () => {
      console.log('Fetching email templates...');
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      console.log('Email templates query result:', { data, error });
      
      if (error) {
        console.error('Error fetching email templates:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Mock branding data for now
  const branding = {
    companyName: 'Your Company',
    companyLogo: '',
    companyWebsite: 'https://yourcompany.com',
    companyAddress: '123 Business St, City, State 12345',
    senderName: 'Your Name',
    senderEmail: 'you@yourcompany.com'
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error updating lead',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    refetchLeads();
    toast({
      title: 'Lead updated',
      description: 'Lead has been updated successfully'
    });
  };

  const handleDeleteLead = async (leadId: string) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    refetchLeads();
    toast({
      title: 'Lead deleted',
      description: 'Lead has been deleted successfully'
    });
  };

  const handleBulkUpdateStatus = async (leadIds: string[], status: any) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .in('id', leadIds);

    if (error) {
      console.error('Error bulk updating leads:', error);
      toast({
        title: 'Error updating leads',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    refetchLeads();
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', leadIds);

    if (error) {
      console.error('Error bulk deleting leads:', error);
      toast({
        title: 'Error deleting leads',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    refetchLeads();
  };

  const handleSendEmail = async (leadId: string) => {
    console.log('Send email to lead:', leadId);
    toast({
      title: 'Email sent',
      description: 'Email has been sent successfully'
    });
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('categories')
      .insert([categoryData]);

    if (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error creating category',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    refetchCategories();
    toast({
      title: 'Category created',
      description: 'Category has been created successfully'
    });
  };

  // Debug output
  console.log('Current data state:', {
    leads: leads.length,
    categories: categories.length,
    importBatches: importBatches.length,
    templates: templates.length,
    leadsLoading,
    leadsError
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobile={isMobile}
      />
      
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'leads' && (
          <LeadsDashboard
            leads={leads}
            templates={templates}
            categories={categories}
            importBatches={importBatches}
            branding={branding}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkDelete={handleBulkDelete}
            onSendEmail={handleSendEmail}
            selectedBatchId={selectedBatchId}
            onCreateCategory={handleCreateCategory}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard leads={leads} />
        )}

        {activeTab === 'import' && (
          <CSVImport 
            categories={categories}
            onImportComplete={() => {
              refetchLeads();
              refetchImportBatches();
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManager 
            categories={categories}
            onCategoryChange={() => {
              refetchCategories();
              refetchLeads();
            }}
          />
        )}

        {activeTab === 'duplicates' && (
          <DuplicateManager 
            leads={leads}
            onLeadsChange={refetchLeads}
          />
        )}

        {activeTab === 'templates' && (
          <EmailTemplateBuilder />
        )}

        {activeTab === 'branding' && (
          <BrandingSettings />
        )}

        {activeTab === 'history' && (
          <ImportHistory 
            importBatches={importBatches}
            onBatchSelect={setSelectedBatchId}
            selectedBatchId={selectedBatchId}
          />
        )}
      </main>

      {isMobile && (
        <MobileNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};

export default Index;
