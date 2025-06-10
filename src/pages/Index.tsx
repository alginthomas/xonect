import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { BrandingSettings } from '@/components/BrandingSettings';
import { ImportHistory } from '@/components/ImportHistory';
import AppleLayout from '@/layouts/AppleLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface BrandingData {
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyAddress: string;
  senderName: string;
  senderEmail: string;
}

// Helper function to safely convert date strings to Date objects
const safeDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [branding, setBranding] = useState<BrandingData>({
    companyName: '',
    companyLogo: '',
    companyWebsite: '',
    companyAddress: '',
    senderName: '',
    senderEmail: '',
  });
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Determine which tab should be active based on the current route
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) return tab;
    
    switch (location.pathname) {
      case '/':
        return 'dashboard';
      case '/leads':
        return 'leads';
      case '/import':
        return 'import';
      case '/categories':
        return 'categories';
      case '/templates':
        return 'templates';
      case '/settings':
        return 'settings';
      default:
        return 'dashboard';
    }
  };

  // Handle tab changes and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/?tab=${value}`, { replace: true });
  };

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  useEffect(() => {
    fetchLeads();
    fetchTemplates();
    fetchCategories();
    fetchImportBatches();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Transform snake_case to camelCase and convert dates safely
        const transformedLeads: Lead[] = data.map(lead => ({
          id: lead.id,
          firstName: lead.first_name,
          lastName: lead.last_name,
          email: lead.email,
          company: lead.company,
          title: lead.title,
          phone: lead.phone || '',
          linkedin: lead.linkedin || '',
          status: lead.status,
          createdAt: safeDate(lead.created_at),
          categoryId: lead.category_id,
          companySize: lead.company_size,
          seniority: lead.seniority,
          emailsSent: lead.emails_sent || 0,
          lastContactDate: lead.last_contact_date ? safeDate(lead.last_contact_date) : undefined,
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
          tags: lead.tags || []
        }));
        setLeads(transformedLeads);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching leads',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Transform snake_case to camelCase and convert dates safely
        const transformedTemplates: EmailTemplate[] = data.map(template => ({
          id: template.id,
          name: template.name,
          subject: template.subject,
          content: template.content,
          variables: template.variables || [],
          createdAt: safeDate(template.created_at),
          lastUsed: template.last_used ? safeDate(template.last_used) : undefined
        }));
        setTemplates(transformedTemplates);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching email templates',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Transform snake_case to camelCase and convert dates safely
        const transformedCategories: Category[] = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          color: category.color || '#3B82F6',
          criteria: (typeof category.criteria === 'object' && category.criteria !== null) 
            ? category.criteria as Record<string, any> 
            : {},
          createdAt: safeDate(category.created_at),
          updatedAt: safeDate(category.updated_at)
        }));
        setCategories(transformedCategories);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching categories',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchImportBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Transform snake_case to camelCase and convert dates safely
        const transformedBatches: ImportBatch[] = data.map(batch => ({
          id: batch.id,
          name: batch.name,
          categoryId: batch.category_id,
          totalLeads: batch.total_leads || 0,
          successfulImports: batch.successful_imports || 0,
          failedImports: batch.failed_imports || 0,
          createdAt: safeDate(batch.created_at),
          sourceFile: batch.source_file || '',
          metadata: (typeof batch.metadata === 'object' && batch.metadata !== null) 
            ? batch.metadata as Record<string, any> 
            : {}
        }));
        setImportBatches(transformedBatches);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching import batches',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      // Transform camelCase to snake_case for Supabase
      const supabaseUpdates: any = {};
      Object.keys(updates).forEach(key => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        let value = updates[key as keyof Lead];
        
        // Convert Date objects to ISO strings for Supabase
        if (value instanceof Date) {
          value = value.toISOString();
        }
        
        supabaseUpdates[snakeKey] = value;
      });

      const { error } = await supabase
        .from('leads')
        .update(supabaseUpdates)
        .eq('id', leadId);

      if (error) {
        throw new Error(error.message);
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, ...updates } : lead
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error updating lead',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImportComplete = () => {
    fetchLeads();
    fetchImportBatches();
  };

  const handleBatchSelect = (batchId: string | null) => {
    setSelectedBatchId(batchId);
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('import_batches')
        .delete()
        .eq('id', batchId);

      if (error) {
        throw new Error(error.message);
      }

      setImportBatches(prev => prev.filter(batch => batch.id !== batchId));
      fetchLeads(); // Refresh leads as they might be affected
    } catch (error: any) {
      toast({
        title: 'Error deleting batch',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewBatchLeads = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description || '',
          color: categoryData.color || '#3B82F6',
          criteria: categoryData.criteria || {}
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const transformedCategory: Category = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          color: data.color || '#3B82F6',
          criteria: (typeof data.criteria === 'object' && data.criteria !== null) 
            ? data.criteria as Record<string, any> 
            : {},
          createdAt: safeDate(data.created_at),
          updatedAt: safeDate(data.updated_at)
        };
        setCategories(prev => [transformedCategory, ...prev]);
      }
    } catch (error: any) {
      toast({
        title: 'Error creating category',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          criteria: updates.criteria
        })
        .eq('id', categoryId);

      if (error) {
        throw new Error(error.message);
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw new Error(error.message);
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error: any) {
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          name: templateData.name,
          subject: templateData.subject,
          content: templateData.content,
          variables: templateData.variables || []
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const transformedTemplate: EmailTemplate = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          content: data.content,
          variables: data.variables || [],
          createdAt: safeDate(data.created_at),
          lastUsed: data.last_used ? safeDate(data.last_used) : undefined
        };
        setTemplates(prev => [transformedTemplate, ...prev]);
      }
    } catch (error: any) {
      toast({
        title: 'Error saving template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveBranding = async (brandingData: BrandingData) => {
    setBranding(brandingData);
    toast({
      title: 'Branding saved',
      description: 'Your branding settings have been updated.',
    });
  };

  return (
    <AppleLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage your leads, track engagement, and grow your business.
          </p>
        </div>

        {selectedBatchId ? (
          <ImportHistory 
            leads={leads}
            importBatches={importBatches}
            categories={categories}
            onDeleteBatch={handleDeleteBatch}
            onViewBatchLeads={handleViewBatchLeads}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-6 lg:grid-cols-6 bg-muted rounded-xl p-1">
                <TabsTrigger value="dashboard" className="rounded-lg font-medium">Dashboard</TabsTrigger>
                <TabsTrigger value="leads" className="rounded-lg font-medium">Leads</TabsTrigger>
                <TabsTrigger value="import" className="rounded-lg font-medium">Import</TabsTrigger>
                <TabsTrigger value="categories" className="rounded-lg font-medium">Categories</TabsTrigger>
                <TabsTrigger value="templates" className="rounded-lg font-medium">Templates</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg font-medium">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <LeadsDashboard
                leads={leads}
                templates={templates}
                categories={categories}
                importBatches={importBatches}
                branding={branding}
                onUpdateLead={handleUpdateLead}
                selectedBatchId={selectedBatchId}
              />
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <Card className="apple-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">All Leads</CardTitle>
                  <CardDescription>
                    View and manage all your leads in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadsDashboard
                    leads={leads}
                    templates={templates}
                    categories={categories}
                    importBatches={importBatches}
                    branding={branding}
                    onUpdateLead={handleUpdateLead}
                    selectedBatchId={selectedBatchId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="apple-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Import Leads</CardTitle>
                    <CardDescription>
                      Upload a CSV file to import new leads into your system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CSVImport 
                      categories={categories} 
                      onImportComplete={handleImportComplete}
                      onCreateCategory={handleCreateCategory}
                    />
                  </CardContent>
                </Card>

                <Card className="apple-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Import History</CardTitle>
                    <CardDescription>
                      View and manage your previous imports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImportHistory 
                      leads={leads}
                      importBatches={importBatches}
                      categories={categories}
                      onDeleteBatch={handleDeleteBatch}
                      onViewBatchLeads={handleViewBatchLeads}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card className="apple-card">
                <CardHeader>
                  <CardTitle className="text-xl">Lead Categories</CardTitle>
                  <CardDescription>
                    Organize your leads with custom categories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryManager 
                    categories={categories}
                    onCreateCategory={handleCreateCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card className="apple-card">
                <CardHeader>
                  <CardTitle className="text-xl">Email Templates</CardTitle>
                  <CardDescription>
                    Create and manage email templates for your campaigns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailTemplateBuilder 
                    onSaveTemplate={handleSaveTemplate}
                    templates={templates}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="apple-card">
                <CardHeader>
                  <CardTitle className="text-xl">Brand Settings</CardTitle>
                  <CardDescription>
                    Customize your company branding for email communications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BrandingSettings 
                    branding={branding}
                    onSave={handleSaveBranding}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppleLayout>
  );
};

export default Index;
