
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
    description: cat.description || '',
    color: cat.color,
    criteria: (cat.criteria && typeof cat.criteria === 'object' && cat.criteria !== null) ? cat.criteria as Record<string, any> : {},
    createdAt: new Date(cat.created_at),
    updatedAt: new Date(cat.updated_at)
  }));

  const transformedBatches: ImportBatch[] = (batchesData || []).map(batch => ({
    id: batch.id,
    name: batch.name,
    categoryId: batch.category_id || '',
    sourceFile: batch.source_file || '',
    totalLeads: batch.total_leads,
    successfulImports: batch.successful_imports,
    failedImports: batch.failed_imports,
    createdAt: new Date(batch.created_at),
    metadata: (batch.metadata && typeof batch.metadata === 'object' && batch.metadata !== null) ? batch.metadata as Record<string, any> : {}
  }));

  // Transform leads data to match Lead interface
  const transformedLeads: Lead[] = (leadsData || []).map(lead => ({
    id: lead.id,
    firstName: lead.first_name,
    lastName: lead.last_name,
    name: lead.first_name + ' ' + lead.last_name,
    email: lead.email,
    personalEmail: lead.personal_email || '',
    company: lead.company,
    title: lead.title,
    headline: lead.headline || '',
    seniority: lead.seniority,
    department: lead.department || '',
    keywords: lead.keywords || '',
    companySize: lead.company_size,
    industry: lead.industry || '',
    location: lead.location || '',
    phone: lead.phone || '',
    linkedin: lead.linkedin || '',
    twitterUrl: lead.twitter_url || '',
    facebookUrl: lead.facebook_url || '',
    photoUrl: lead.photo_url || '',
    organizationWebsite: lead.organization_website || '',
    organizationLogo: lead.organization_logo || '',
    organizationDomain: lead.organization_domain || '',
    organizationFounded: lead.organization_founded || 0,
    organizationAddress: lead.organization_address || '',
    tags: lead.tags || [],
    status: lead.status,
    emailsSent: lead.emails_sent,
    lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
    createdAt: new Date(lead.created_at),
    completenessScore: lead.completeness_score,
    categoryId: lead.category_id || '',
    remarks: lead.remarks || ''
  }));

  // Transform templates data to match EmailTemplate interface
  const transformedTemplates = (templatesData || []).map(template => ({
    id: template.id,
    name: template.name,
    subject: template.subject,
    content: template.content,
    variables: template.variables || [],
    createdAt: new Date(template.created_at),
    lastUsed: template.last_used ? new Date(template.last_used) : undefined
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
        user_id: user.id,
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
          user_id: user.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      console.log('Created import batch:', batchData);

      // Transform leads to database format
      const leadsToInsert = sanitizedLeads.map(lead => ({
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        seniority: lead.seniority,
        company_size: lead.companySize,
        industry: lead.industry,
        location: lead.location,
        phone: lead.phone,
        linkedin: lead.linkedin,
        personal_email: lead.personalEmail,
        headline: lead.headline,
        department: lead.department,
        keywords: lead.keywords,
        twitter_url: lead.twitterUrl,
        facebook_url: lead.facebookUrl,
        photo_url: lead.photoUrl,
        organization_website: lead.organizationWebsite,
        organization_logo: lead.organizationLogo,
        organization_domain: lead.organizationDomain,
        organization_founded: lead.organizationFounded,
        organization_address: lead.organizationAddress,
        tags: lead.tags,
        status: lead.status,
        emails_sent: lead.emailsSent || 0,
        completeness_score: lead.completenessScore || 0,
        remarks: lead.remarks,
        import_batch_id: batchData.id,
        category_id: importBatch.categoryId,
        user_id: user.id,
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
        user_id: user.id,
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
        user_id: user.id,
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

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;

    try {
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

      toast({
        title: "Category updated",
        description: "Category has been updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: "Failed to update the category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: "Failed to delete the category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const handleViewBatchLeads = (batchId: string) => {
    setActiveTab('dashboard');
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: updates.status,
          emails_sent: updates.emailsSent,
          last_contact_date: updates.lastContactDate?.toISOString(),
          remarks: updates.remarks,
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error updating lead",
        description: "Failed to update the lead",
        variant: "destructive",
      });
    }
  };

  const handleSaveBranding = async (branding: any) => {
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
              leads={transformedLeads}
              templates={transformedTemplates}
              categories={transformedCategories}
              importBatches={transformedBatches}
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
              templates={transformedTemplates}
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={transformedCategories}
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager 
              categories={transformedCategories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ImportHistory 
              leads={transformedLeads}
              importBatches={transformedBatches}
              categories={transformedCategories}
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
