import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImport } from '@/components/CSVImport';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { CategoryManager } from '@/components/CategoryManager';
import { BrandingSettings } from '@/components/BrandingSettings';
import Header from '@/components/Header';
import { Upload, Users, Mail, BarChart, Tag, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

const Index = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState({
    companyName: 'XONECT powered by Thomas & Niyogi',
    companyLogo: '',
    companyWebsite: '',
    companyAddress: '',
    senderName: '',
    senderEmail: '',
  });
  const { toast } = useToast();

  // Load categories from Supabase
  const loadCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedCategories: Category[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        color: category.color,
        criteria: (category.criteria as Record<string, any>) || {},
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at),
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error loading categories",
        description: "Failed to load categories from database",
        variant: "destructive",
      });
    }
  };

  // Load import batches from Supabase
  const loadImportBatches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedBatches: ImportBatch[] = (data || []).map(batch => ({
        id: batch.id,
        name: batch.name,
        categoryId: batch.category_id || undefined,
        sourceFile: batch.source_file || undefined,
        totalLeads: batch.total_leads,
        successfulImports: batch.successful_imports,
        failedImports: batch.failed_imports,
        createdAt: new Date(batch.created_at),
        metadata: (batch.metadata as Record<string, any>) || {},
      }));

      setImportBatches(transformedBatches);
    } catch (error) {
      console.error('Error loading import batches:', error);
    }
  };

  // Load leads from Supabase (updated to include user filtering)
  const loadLeads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        seniority: lead.seniority,
        companySize: lead.company_size,
        industry: lead.industry || '',
        location: lead.location || '',
        phone: lead.phone || '',
        linkedin: lead.linkedin || '',
        tags: lead.tags || [],
        status: lead.status,
        emailsSent: lead.emails_sent,
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
        createdAt: new Date(lead.created_at),
        completenessScore: lead.completeness_score,
        categoryId: lead.category_id || undefined,
      }));

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error loading leads",
        description: "Failed to load leads from database",
        variant: "destructive",
      });
    }
  };

  // Load email templates from Supabase
  const loadEmailTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTemplates: EmailTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
        variables: template.variables || [],
        createdAt: new Date(template.created_at),
        lastUsed: template.last_used ? new Date(template.last_used) : undefined,
      }));

      setEmailTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error loading email templates:', error);
      toast({
        title: "Error loading templates",
        description: "Failed to load email templates from database",
        variant: "destructive",
      });
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([loadLeads(), loadEmailTemplates(), loadCategories(), loadImportBatches()]);
        setLoading(false);
      };
      
      loadData();
    }
  }, [user]);

  const handleImportComplete = async (importedLeads: Lead[], importBatch: ImportBatch) => {
    if (!user) return;
    
    try {
      // First, save the import batch with user_id
      const { data: batchData, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: importBatch.name,
          category_id: importBatch.categoryId || null,
          source_file: importBatch.sourceFile || null,
          total_leads: importBatch.totalLeads,
          successful_imports: importBatch.successfulImports,
          failed_imports: importBatch.failedImports,
          metadata: importBatch.metadata,
          user_id: user.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Transform leads to match Supabase schema and include batch ID and user_id
      const leadsToInsert = importedLeads.map(lead => ({
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        seniority: lead.seniority,
        company_size: lead.companySize,
        industry: lead.industry || null,
        location: lead.location || null,
        phone: lead.phone || null,
        linkedin: lead.linkedin || null,
        tags: lead.tags,
        status: lead.status,
        emails_sent: lead.emailsSent,
        completeness_score: lead.completenessScore,
        category_id: lead.categoryId || null,
        import_batch_id: batchData.id,
        user_id: user.id,
      }));

      const { error: leadsError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) throw leadsError;

      // Reload data from database
      await Promise.all([loadLeads(), loadImportBatches()]);
      
      toast({
        title: "Import successful",
        description: `Imported ${importedLeads.length} leads successfully`,
      });
    } catch (error) {
      console.error('Error saving leads:', error);
      toast({
        title: "Import failed",
        description: "Failed to save leads to database",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!user) return;
    
    try {
      const supabaseUpdates: any = {};
      if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.company !== undefined) supabaseUpdates.company = updates.company;
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.seniority !== undefined) supabaseUpdates.seniority = updates.seniority;
      if (updates.companySize !== undefined) supabaseUpdates.company_size = updates.companySize;
      if (updates.industry !== undefined) supabaseUpdates.industry = updates.industry;
      if (updates.location !== undefined) supabaseUpdates.location = updates.location;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.linkedin !== undefined) supabaseUpdates.linkedin = updates.linkedin;
      if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.emailsSent !== undefined) supabaseUpdates.emails_sent = updates.emailsSent;
      if (updates.completenessScore !== undefined) supabaseUpdates.completeness_score = updates.completenessScore;
      if (updates.lastContactDate !== undefined) supabaseUpdates.last_contact_date = updates.lastContactDate?.toISOString();
      if (updates.categoryId !== undefined) supabaseUpdates.category_id = updates.categoryId;

      const { error } = await supabase
        .from('leads')
        .update(supabaseUpdates)
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));

      toast({
        title: "Lead updated",
        description: "Lead information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Update failed",
        description: "Failed to update lead in database",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          user_id: user.id,
        });

      if (error) throw error;

      await loadEmailTemplates();
      
      toast({
        title: "Template saved",
        description: `Email template "${template.name}" has been saved successfully`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Save failed",
        description: "Failed to save template to database",
        variant: "destructive",
      });
    }
  };

  // Category management functions
  const handleCreateCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          color: categoryData.color,
          criteria: categoryData.criteria,
          user_id: user.id,
        });

      if (error) {
        // Handle specific duplicate key error for this user
        if (error.code === '23505' && error.message.includes('categories_user_name_unique')) {
          toast({
            title: "Category Already Exists",
            description: `A category with the name "${categoryData.name}" already exists in your account`,
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      await loadCategories();
      
      toast({
        title: "Category created",
        description: `Category "${categoryData.name}" has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;
    
    try {
      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.color !== undefined) supabaseUpdates.color = updates.color;
      if (updates.criteria !== undefined) supabaseUpdates.criteria = updates.criteria;

      const { error } = await supabase
        .from('categories')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadCategories();
      
      toast({
        title: "Category updated",
        description: "Category has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Update failed",
        description: "Failed to update category",
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

      await loadCategories();
      
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleSaveBranding = (brandingData: typeof branding) => {
    setBranding(brandingData);
    // You can also save this to localStorage or a database
    localStorage.setItem('emailBranding', JSON.stringify(brandingData));
  };

  // Load branding settings on mount
  useEffect(() => {
    const savedBranding = localStorage.getItem('emailBranding');
    if (savedBranding) {
      setBranding(JSON.parse(savedBranding));
    }
  }, []);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Lead Management Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Import, organize, and nurture your leads with personalized email campaigns
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <LeadsDashboard 
              leads={leads}
              templates={emailTemplates}
              categories={categories}
              branding={branding}
              onUpdateLead={handleUpdateLead}
            />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsDashboard 
              leads={leads}
              templates={emailTemplates}
              categories={categories}
              branding={branding}
              onUpdateLead={handleUpdateLead}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryManager
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <EmailTemplateBuilder 
              onSaveTemplate={handleSaveTemplate}
              templates={emailTemplates}
            />
          </TabsContent>

          <TabsContent value="branding" className="mt-6">
            <BrandingSettings 
              branding={branding}
              onSave={handleSaveBranding}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
