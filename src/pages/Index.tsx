
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AppleLayout from '@/layouts/AppleLayout';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { ColumnSettings } from '@/components/ColumnSettings';
import { AddLeadDialog } from '@/components/AddLeadDialog';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get active tab from URL, default to 'dashboard'
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  // Fetch leads
  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      console.log('Fetching leads...');
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      const leadsWithTransformedData = data.map(lead => ({
        ...lead,
        categoryId: lead.category_id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        companySize: lead.company_size,
        emailsSent: lead.emails_sent,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at)
      }));

      console.log('Fetched leads:', leadsWithTransformedData.length);
      return leadsWithTransformedData as Lead[];
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const transformedCategories = data.map(category => ({
        ...category,
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at)
      }));
      
      return transformedCategories as Category[];
    }
  });

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      console.log('Updating lead:', leadId, updates);
      
      const updateData: any = { ...updates };
      if (updates.categoryId !== undefined) {
        updateData.category_id = updates.categoryId;
        delete updateData.categoryId;
      }
      delete updateData.categories;

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: 'Lead updated',
        description: 'The lead has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      console.log('Deleting lead:', leadId);
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: 'Lead deleted',
        description: 'The lead has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpdateStatus = async (leadIds: string[], status: LeadStatus) => {
    try {
      console.log('Bulk updating lead status:', leadIds, status);
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .in('id', leadIds);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: 'Leads updated',
        description: `${leadIds.length} lead(s) status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leads. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      console.log('Bulk deleting leads:', leadIds);
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: 'Leads deleted',
        description: `${leadIds.length} lead(s) deleted successfully.`,
      });
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete leads. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddLead = () => {
    setAddLeadDialogOpen(true);
  };

  const handleNavigateToLeads = (filter?: any) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'leads');
    setSearchParams(newParams);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AnalyticsDashboard 
            leads={leads} 
            templates={[]}
            categories={categories}
            importBatches={[]}
            onNavigateToLeads={handleNavigateToLeads}
          />
        );
      case 'leads':
        return (
          <>
            <LeadsDashboard
              leads={leads}
              categories={categories}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
            />
            {/* Floating Action Button for mobile - only show on leads tab */}
            {isMobile && (
              <FloatingActionButton
                onClick={handleAddLead}
                label="Add Lead"
              />
            )}
          </>
        );
      case 'import':
        return (
          <CSVImport 
            onImportComplete={refetchLeads} 
            categories={categories}
            onCreateCategory={() => {}}
          />
        );
      case 'categories':
        return (
          <CategoryManager 
            categories={categories}
            onCreateCategory={() => {}}
            onUpdateCategory={() => {}}
            onDeleteCategory={() => {}}
          />
        );
      case 'templates':
        return (
          <EmailTemplateBuilder 
            onSaveTemplate={() => {}}
            templates={[]}
          />
        );
      case 'settings':
        return (
          <ColumnSettings 
            columns={[]}
            onToggleVisibility={() => {}}
            onReset={() => {}}
          />
        );
      default:
        return (
          <AnalyticsDashboard 
            leads={leads} 
            templates={[]}
            categories={categories}
            importBatches={[]}
            onNavigateToLeads={handleNavigateToLeads}
          />
        );
    }
  };

  return (
    <AppleLayout>
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      <AddLeadDialog
        isOpen={addLeadDialogOpen}
        onClose={() => setAddLeadDialogOpen(false)}
        categories={categories}
        onLeadAdded={refetchLeads}
      />
    </AppleLayout>
  );
};

export default Index;
