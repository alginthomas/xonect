import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, User, Download, MessageSquare, Mail, Upload, FolderOpen } from 'lucide-react';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { CategoryManager } from '@/components/CategoryManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { BrandingSettings } from '@/components/BrandingSettings';
import { ImportHistory } from '@/components/ImportHistory';
import { MobileNavigation } from '@/components/MobileNavigation';
import { MobileLeadsList } from '@/components/ui/mobile-leads-list';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { AddLeadDialog } from '@/components/AddLeadDialog';
import AppleLayout from '@/layouts/AppleLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImportBatchOperations } from '@/hooks/useImportBatchOperations';
import { useIsMobile } from '@/hooks/use-mobile';
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

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const { toast } = useToast();
  const { deleteBatch, loading } = useImportBatchOperations();

  // Determine which tab should be active based on the current route
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const batch = searchParams.get('batch');
    
    // If there's a batch parameter, set it as selected and go to dashboard
    if (batch) {
      setSelectedBatchId(batch);
      console.log('Setting selected batch ID from URL:', batch);
      return 'dashboard';
    }
    
    // Return the tab from URL or default to dashboard
    return tab || 'dashboard';
  };

  // Handle tab changes and update URL
  const handleTabChange = (value: string) => {
    console.log('Changing tab to:', value);
    setActiveTab(value);
    
    // Clear selected batch when changing tabs unless staying on dashboard
    if (value !== 'dashboard') {
      setSelectedBatchId(null);
    }
    
    // Update URL with current tab
    const searchParams = new URLSearchParams(location.search);
    
    // Set the new tab
    searchParams.set('tab', value);
    
    // Only clear other params if not on leads tab
    if (value !== 'leads') {
      // Remove leads-specific params when navigating away from leads
      ['search', 'status', 'category', 'seniority', 'companySize', 'location', 'industry', 'dataFilter', 'page', 'pageSize', 'sort'].forEach(param => {
        searchParams.delete(param);
      });
    }
    
    // Navigate to the new URL
    const newUrl = `/?${searchParams.toString()}`;
    console.log('Navigating to:', newUrl);
    navigate(newUrl, { replace: true });
  };

  // Initialize active tab from URL on component mount and location changes
  useEffect(() => {
    const newActiveTab = getActiveTab();
    console.log('Setting active tab from URL:', newActiveTab);
    setActiveTab(newActiveTab);
  }, [location.search]);

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
          tags: lead.tags || [],
          importBatchId: lead.import_batch_id || undefined,
        }));
        
        console.log('Fetched leads with import batch IDs:', transformedLeads.filter(l => l.importBatchId).length);
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

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        throw new Error(error.message);
      }

      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      toast({
        title: 'Lead deleted',
        description: 'Lead has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpdateStatus = async (leadIds: string[], status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified') => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .in('id', leadIds);

      if (error) {
        throw new Error(error.message);
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          leadIds.includes(lead.id) ? { ...lead, status } : lead
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error updating leads',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds);

      if (error) {
        throw new Error(error.message);
      }

      setLeads(prevLeads => prevLeads.filter(lead => !leadIds.includes(lead.id)));
    } catch (error: any) {
      toast({
        title: 'Error deleting leads',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async (leadId: string) => {
    // Update the lead to track email sent
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      handleUpdateLead(leadId, { 
        emailsSent: lead.emailsSent + 1,
        lastContactDate: new Date(),
        status: 'Contacted'
      });
    }
  };

  const handleViewDetails = (lead: Lead) => {
    navigate(`/lead/${lead.id}`);
  };

  const handleImportComplete = () => {
    fetchLeads();
    fetchImportBatches();
  };

  const handleBatchSelect = (batchId: string | null) => {
    setSelectedBatchId(batchId);
  };

  const handleDeleteBatch = async (batchId: string) => {
    const success = await deleteBatch(batchId);
    if (success) {
      setImportBatches(prev => prev.filter(batch => batch.id !== batchId));
      fetchLeads(); // Refresh leads as they might be affected
    }
  };

  const handleViewBatchLeads = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'You must be logged in to create categories.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description || '',
          color: categoryData.color || '#3B82F6',
          criteria: categoryData.criteria || {},
          user_id: user.id // Add the user_id field
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
        
        toast({
          title: 'Category created',
          description: `Category "${data.name}" has been created successfully.`,
        });
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

  const handleNavigateToLeads = (filter?: any) => {
    console.log('Navigate to leads with filter:', filter);
    
    // Build search params with filter if provided
    const searchParams = new URLSearchParams();
    searchParams.set('tab', 'leads');
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    
    const newUrl = `/?${searchParams.toString()}`;
    console.log('Navigating to leads:', newUrl);
    navigate(newUrl, { replace: true });
    
    setActiveTab('leads');
  };

  const handleAddLead = () => {
    setIsAddLeadDialogOpen(true);
  };

  const handleLeadAdded = () => {
    fetchLeads();
  };

  const renderContent = () => {
    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsContent value="dashboard" className={isMobile ? "h-full px-4 pt-4" : "space-y-6 lg:space-y-8"}>
          <AnalyticsDashboard
            leads={leads}
            templates={templates}
            categories={categories}
            importBatches={importBatches}
            onNavigateToLeads={handleNavigateToLeads}
          />
        </TabsContent>

        <TabsContent value="leads" className={isMobile ? "h-full" : "space-y-6 lg:space-y-8"}>
          {isMobile ? (
            // Mobile Leads View - Full height
            <MobileLeadsList
              leads={leads}
              categories={categories}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onEmailClick={handleSendEmail}
              onViewDetails={handleViewDetails}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
            />
          ) : (
            // Desktop Leads View - Card layout
            <Card className="apple-card">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="text-lg lg:text-xl">All Leads</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  View and manage all your leads in one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 lg:px-6">
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
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className={isMobile ? "h-full" : "space-y-8 lg:space-y-10"}>
          {isMobile ? (
            // Mobile-optimized import page with proper padding
            <div className="h-full flex flex-col bg-background">
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h1 className="text-xl font-semibold mb-2">Import Leads</h1>
                    <p className="text-sm text-muted-foreground px-4">
                      Upload CSV files to import your leads
                    </p>
                  </div>
                  
                  <CSVImport 
                    categories={categories} 
                    onImportComplete={handleImportComplete}
                    onCreateCategory={handleCreateCategory}
                  />
                  
                  <div className="pt-6">
                    <ImportHistory 
                      leads={leads}
                      importBatches={importBatches}
                      categories={categories}
                      onDeleteBatch={handleDeleteBatch}
                      onViewBatchLeads={handleViewBatchLeads}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Desktop import page
            <div className="max-w-full">
              <CSVImport 
                categories={categories} 
                onImportComplete={handleImportComplete}
                onCreateCategory={handleCreateCategory}
              />
              
              <div className="mt-10 lg:mt-12">
                <ImportHistory 
                  leads={leads}
                  importBatches={importBatches}
                  categories={categories}
                  onDeleteBatch={handleDeleteBatch}
                  onViewBatchLeads={handleViewBatchLeads}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className={isMobile ? "h-full" : "space-y-6 lg:space-y-8"}>
          {isMobile ? (
            // Mobile-optimized categories page with proper padding
            <div className="h-full flex flex-col bg-background">
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h1 className="text-xl font-semibold mb-2">Lead Categories</h1>
                    <p className="text-sm text-muted-foreground px-4">
                      Organize your leads with custom categories
                    </p>
                  </div>
                  
                  <CategoryManager 
                    categories={categories}
                    onCreateCategory={handleCreateCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Desktop categories page
            <Card className="apple-card">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Lead Categories</CardTitle>
                <CardDescription className="text-sm lg:text-base">
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
          )}
        </TabsContent>

        <TabsContent value="templates" className={isMobile ? "h-full px-4 pt-4 pb-6" : "space-y-6 lg:space-y-8"}>
          <Card className="apple-card">
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Email Templates</CardTitle>
              <CardDescription className="text-sm lg:text-base">
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

        <TabsContent value="settings" className={isMobile ? "h-full px-4 pt-4 pb-6" : "space-y-6 lg:space-y-8"}>
          <Card className="apple-card">
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Brand Settings</CardTitle>
              <CardDescription className="text-sm lg:text-base">
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
    );
  };

  return (
    <AppleLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      {/* Desktop content */}
      {!isMobile && (
        <div className="space-y-6">
          {renderContent()}
        </div>
      )}

      {/* Mobile content - with proper padding */}
      {isMobile && (
        <div className="flex flex-col h-full bg-background">
          {activeTab === 'leads' ? (
            <>
              <MobileLeadsList
                leads={leads}
                categories={categories}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onEmailClick={handleSendEmail}
                onViewDetails={handleViewDetails}
                onBulkUpdateStatus={handleBulkUpdateStatus}
                onBulkDelete={handleBulkDelete}
              />
              <FloatingActionButton onClick={handleAddLead} />
            </>
          ) : (
            renderContent()
          )}
        </div>
      )}

      <AddLeadDialog
        isOpen={isAddLeadDialogOpen}
        onClose={() => setIsAddLeadDialogOpen(false)}
        categories={categories}
        onLeadAdded={handleLeadAdded}
      />
    </AppleLayout>
  );
}
