import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppleLayout from '@/layouts/AppleLayout';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { DuplicateManager } from '@/components/DuplicateManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { BrandingSettings } from '@/components/BrandingSettings';
import { ImportHistory } from '@/components/ImportHistory';
import { useToast } from '@/hooks/use-toast';
import { useImportBatchOperations } from '@/hooks/useImportBatchOperations';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead, EmailTemplate, RemarkEntry, ActivityEntry } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

const Index = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { handleDeleteBatch } = useImportBatchOperations();
  const { user } = useAuth();

  // Set active tab from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const batchId = urlParams.get('batch');
    if (tab) {
      console.log('Setting active tab from URL:', tab);
      setActiveTab(tab);
    }
    if (batchId) {
      console.log('Setting selected batch from URL:', batchId);
      setSelectedBatchId(batchId);
    }
  }, []);

  // Fetch leads with enhanced debugging and proper type mapping
  const { data: leads = [], isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      console.log('🔍 Fetching leads...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('👤 Current session:', sessionData.session?.user?.id);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Leads query result:', { data, error });
      console.log('📈 Number of leads returned:', data?.length || 0);
      
      if (error) {
        console.error('❌ Error fetching leads:', error);
        throw error;
      }
      
      // Map database fields to TypeScript interface with proper type handling
      const mappedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        industry: lead.industry || '',
        location: lead.location || '',
        phone: lead.phone || '',
        linkedin: lead.linkedin || '',
        status: lead.status,
        categoryId: lead.category_id,
        importBatchId: lead.import_batch_id,
        seniority: lead.seniority,
        companySize: lead.company_size,
        emailsSent: lead.emails_sent,
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
        completenessScore: lead.completeness_score,
        remarks: lead.remarks || '',
        tags: lead.tags || [],
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at),
        userId: lead.user_id,
        organizationWebsite: lead.organization_website || '',
        department: lead.department || '',
        personalEmail: lead.personal_email || '',
        photoUrl: lead.photo_url || '',
        twitterUrl: lead.twitter_url || '',
        facebookUrl: lead.facebook_url || '',
        organizationFounded: lead.organization_founded,
        remarksHistory: Array.isArray(lead.remarks_history) 
          ? (lead.remarks_history as any[]).map((entry: any) => ({
              id: entry.id,
              text: entry.text,
              timestamp: typeof entry.timestamp === 'string' ? new Date(entry.timestamp) : entry.timestamp
            }))
          : [],
        activityLog: Array.isArray(lead.activity_log) 
          ? (lead.activity_log as unknown as ActivityEntry[]) 
          : []
      }));
      
      console.log('🔄 Mapped leads:', mappedLeads);
      return mappedLeads;
    },
    enabled: !!user
  });

  // Fetch categories with proper type mapping
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🏷️ Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      console.log('📊 Categories query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }
      
      // Map database fields to TypeScript interface with proper type handling
      const mappedCategories: Category[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        color: category.color,
        criteria: typeof category.criteria === 'object' && category.criteria !== null ? category.criteria as Record<string, any> : {},
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at)
      }));
      
      console.log('🔄 Mapped categories:', mappedCategories);
      return mappedCategories;
    },
    enabled: !!user
  });

  // Fetch import batches with proper type mapping and link checking
  const { data: importBatches = [], refetch: refetchImportBatches } = useQuery({
    queryKey: ['import_batches'],
    queryFn: async () => {
      console.log('📦 Fetching import batches...');
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Import batches query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching import batches:', error);
        throw error;
      }
      
      // Map database fields to TypeScript interface with proper type handling
      const mappedBatches: ImportBatch[] = (data || []).map(batch => ({
        id: batch.id,
        name: batch.name,
        categoryId: batch.category_id,
        sourceFile: batch.source_file,
        totalLeads: batch.total_leads || 0,
        successfulImports: batch.successful_imports || 0,
        failedImports: batch.failed_imports || 0,
        createdAt: new Date(batch.created_at),
        metadata: typeof batch.metadata === 'object' && batch.metadata !== null ? batch.metadata as Record<string, any> : {}
      }));
      
      // Check linking between batches and leads for debugging
      console.log('🔗 Checking batch-to-leads linking...');
      for (const batch of mappedBatches) {
        const linkedLeads = leads.filter(lead => lead.importBatchId === batch.id);
        console.log(`📦 Batch "${batch.name}" (${batch.id}) has ${linkedLeads.length} linked leads in current data`);
        
        // Also check directly in database
        const { data: dbLinkedLeads } = await supabase
          .from('leads')
          .select('id, first_name, last_name')
          .eq('import_batch_id', batch.id);
        
        console.log(`🔍 Batch "${batch.name}" has ${dbLinkedLeads?.length || 0} leads linked in database:`, dbLinkedLeads);
      }
      
      console.log('🔄 Mapped import batches:', mappedBatches);
      return mappedBatches;
    },
    enabled: !!user
  });

  // Fetch email templates with proper type mapping
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ['email_templates'],
    queryFn: async () => {
      console.log('📧 Fetching email templates...');
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      console.log('📊 Email templates query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching email templates:', error);
        throw error;
      }
      
      // Map database fields to TypeScript interface
      const mappedTemplates: EmailTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
        variables: template.variables || [],
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        lastUsed: template.last_used ? new Date(template.last_used) : undefined
      }));
      
      console.log('🔄 Mapped email templates:', mappedTemplates);
      return mappedTemplates;
    },
    enabled: !!user
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

  const transformLead = (lead: any): Lead => ({
    id: lead.id,
    firstName: lead.first_name,
    lastName: lead.last_name,
    email: lead.email,
    company: lead.company,
    title: lead.title,
    phone: lead.phone || '',
    linkedin: lead.linkedin || '',
    status: lead.status,
    createdAt: new Date(lead.created_at),
    categoryId: lead.category_id,
    companySize: lead.company_size,
    seniority: lead.seniority,
    emailsSent: lead.emails_sent || 0,
    lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
    completenessScore: lead.completeness_score || 0,
    industry: lead.industry || '',
    location: lead.location || '',
    department: lead.department || '',
    personalEmail: lead.personal_email || '',
    photoUrl: lead.photo_url || '',
    twitterUrl: lead.twitter_url || '',
    facebookUrl: lead.facebook_url || '',
    organizationWebsite: lead.organization_website || '',
    organizationFounded: lead.organization_founded,
    remarks: lead.remarks || '',
    tags: lead.tags || [],
    importBatchId: lead.import_batch_id || undefined,
    remarksHistory: Array.isArray(lead.remarks_history) ? lead.remarks_history.map((entry: any) => ({
      id: entry.id,
      text: entry.text,
      timestamp: new Date(entry.timestamp)
    })) : [],
    activityLog: Array.isArray(lead.activity_log) ? lead.activity_log.map((entry: any) => ({
      id: entry.id,
      type: entry.type,
      description: entry.description,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      timestamp: new Date(entry.timestamp),
      userId: entry.userId
    })) : []
  });

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const updateData: any = {};
      
      // Map lead fields to database column names
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.linkedin !== undefined) updateData.linkedin = updates.linkedin;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.companySize !== undefined) updateData.company_size = updates.companySize;
      if (updates.seniority !== undefined) updateData.seniority = updates.seniority;
      if (updates.emailsSent !== undefined) updateData.emails_sent = updates.emailsSent;
      if (updates.lastContactDate !== undefined) updateData.last_contact_date = updates.lastContactDate?.toISOString();
      if (updates.completenessScore !== undefined) updateData.completeness_score = updates.completenessScore;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.department !== undefined) updateData.department = updates.department;
      if (updates.personalEmail !== undefined) updateData.personal_email = updates.personalEmail;
      if (updates.photoUrl !== undefined) updateData.photo_url = updates.photoUrl;
      if (updates.twitterUrl !== undefined) updateData.twitter_url = updates.twitterUrl;
      if (updates.facebookUrl !== undefined) updateData.facebook_url = updates.facebookUrl;
      if (updates.organizationWebsite !== undefined) updateData.organization_website = updates.organizationWebsite;
      if (updates.organizationFounded !== undefined) updateData.organization_founded = updates.organizationFounded;
      if (updates.remarks !== undefined) updateData.remarks = updates.remarks;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.remarksHistory !== undefined) {
        updateData.remarks_history = updates.remarksHistory.map(entry => ({
          id: entry.id,
          text: entry.text,
          timestamp: entry.timestamp.toISOString()
        }));
      }
      if (updates.activityLog !== undefined) {
        updateData.activity_log = updates.activityLog.map(entry => ({
          id: entry.id,
          type: entry.type,
          description: entry.description,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          timestamp: entry.timestamp.toISOString(),
          userId: entry.userId
        }));
      }

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh the leads data from the database
      await refetchLeads();

      console.log('Lead updated successfully:', leadId, updates);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
      .eq('user_id', user.id);

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
    if (!user) return;

    const { error } = await supabase
      .from('leads')
      .update({ status })
      .in('id', leadIds)
      .eq('user_id', user.id);

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
    if (!user) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', leadIds)
      .eq('user_id', user.id);

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
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        criteria: categoryData.criteria,
        user_id: user.id
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

    refetchCategories();
    toast({
      title: 'Category created',
      description: 'Category has been created successfully'
    });
  };

  const handleDeleteBatchWrapper = async (batchId: string, batchName?: string) => {
    const success = await handleDeleteBatch(batchId, batchName);
    if (success) {
      refetchLeads();
      refetchImportBatches();
    }
  };

  const handleBulkAction = async (action: 'delete' | 'merge', leadIds: string[]) => {
    if (action === 'delete') {
      await handleBulkDelete(leadIds);
    }
    // Merge functionality would be implemented here
  };

  const handleSaveTemplate = (template: EmailTemplate) => {
    refetchTemplates();
  };

  // Debug output
  console.log('📊 Current data state:', {
    leads: leads.length,
    categories: categories.length,
    importBatches: importBatches.length,
    templates: templates.length,
    leadsLoading,
    leadsError,
    selectedBatchId,
    user: user?.id,
    activeTab
  });

  if (!user) {
    return null; // Let AuthProvider handle the redirect to auth page
  }

  return (
    <AppleLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <AnalyticsDashboard 
          leads={leads} 
          templates={templates}
          categories={categories}
          importBatches={importBatches}
          onNavigateToLeads={(filter) => {
            setActiveTab('leads');
          }}
        />
      )}

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
        <AnalyticsDashboard 
          leads={leads} 
          templates={templates}
          categories={categories}
          importBatches={importBatches}
          onNavigateToLeads={(filter) => {
            setActiveTab('leads');
          }}
        />
      )}

      {activeTab === 'import' && (
        <CSVImport 
          categories={categories}
          onImportComplete={() => {
            refetchLeads();
            refetchImportBatches();
          }}
          onCreateCategory={handleCreateCategory}
          existingLeads={leads}
          importBatches={importBatches}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryManager 
          categories={categories}
          onRefresh={() => {
            refetchCategories();
            refetchLeads();
          }}
        />
      )}

      {activeTab === 'duplicates' && (
        <DuplicateManager 
          leads={leads}
          onBulkAction={handleBulkAction}
        />
      )}

      {activeTab === 'templates' && (
        <EmailTemplateBuilder 
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
        />
      )}

      {activeTab === 'branding' && (
        <BrandingSettings 
          branding={branding}
          onSave={(updatedBranding) => {
            console.log('Updated branding:', updatedBranding);
            toast({
              title: 'Branding updated',
              description: 'Your branding settings have been saved'
            });
          }}
        />
      )}

      {activeTab === 'history' && (
        <ImportHistory 
          leads={leads}
          importBatches={importBatches}
          categories={categories}
          onDeleteBatch={handleDeleteBatchWrapper}
          onViewBatchLeads={setSelectedBatchId}
        />
      )}
    </AppleLayout>
  );
};

export default Index;
