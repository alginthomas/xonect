import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImport } from '@/components/CSVImport';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { CategoryManager } from '@/components/CategoryManager';
import { BrandingSettings } from '@/components/BrandingSettings';
import Header from '@/components/Header';
import { Upload, Users, Mail, BarChart, Tag, Building2, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

const Index = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        organizationWebsite: lead.organization_website || '',
        organizationFounded: lead.organization_founded || undefined,
        department: lead.department || '',
        personalEmail: lead.personal_email || '',
        photoUrl: lead.photo_url || '',
        twitterUrl: lead.twitter_url || '',
        facebookUrl: lead.facebook_url || '',
        tags: lead.tags || [],
        status: lead.status,
        emailsSent: lead.emails_sent,
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
        createdAt: new Date(lead.created_at),
        completenessScore: lead.completeness_score,
        categoryId: lead.category_id || undefined,
      }));

      console.log('Loaded leads with organizationWebsite:', transformedLeads.map(l => ({
        name: `${l.firstName} ${l.lastName}`,
        website: l.organizationWebsite
      })));

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
        organization_website: lead.organizationWebsite || null,
        organization_founded: lead.organizationFounded || null,
        department: lead.department || null,
        personal_email: lead.personalEmail || null,
        photo_url: lead.photoUrl || null,
        twitter_url: lead.twitterUrl || null,
        facebook_url: lead.facebookUrl || null,
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
      if (updates.organizationWebsite !== undefined) supabaseUpdates.organization_website = updates.organizationWebsite;
      if (updates.organizationFounded !== undefined) supabaseUpdates.organization_founded = updates.organizationFounded;
      if (updates.department !== undefined) supabaseUpdates.department = updates.department;
      if (updates.personalEmail !== undefined) supabaseUpdates.personal_email = updates.personalEmail;
      if (updates.photoUrl !== undefined) supabaseUpdates.photo_url = updates.photoUrl;
      if (updates.twitterUrl !== undefined) supabaseUpdates.twitter_url = updates.twitterUrl;
      if (updates.facebookUrl !== undefined) supabaseUpdates.facebook_url = updates.facebookUrl;
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

  // Mobile tab navigation items
  const tabItems = [
    { value: 'dashboard', label: 'Dashboard', icon: BarChart },
    { value: 'import', label: 'Import', icon: Upload },
    { value: 'leads', label: 'Leads', icon: Users },
    { value: 'categories', label: 'Categories', icon: Tag },
    { value: 'templates', label: 'Templates', icon: Mail },
    { value: 'branding', label: 'Branding', icon: Building2 },
  ];

  // Mobile navigation component
  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.value}
                    variant={activeTab === item.value ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(item.value);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Lead Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your leads and campaigns
            </p>
          </div>
          <MobileNavigation />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Lead Management Dashboard
          </h1>
          <p className="text-lg xl:text-xl text-muted-foreground">
            Import, organize, and nurture your leads with personalized email campaigns
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value} 
                  value={item.value} 
                  className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm"
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="md:hidden mb-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 p-1">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.value}
                      variant={activeTab === item.value ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap"
                      onClick={() => setActiveTab(item.value)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            <TabsContent value="dashboard" className="mt-0">
              <LeadsDashboard 
                leads={leads}
                templates={emailTemplates}
                categories={categories}
                branding={branding}
                onUpdateLead={handleUpdateLead}
              />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <CSVImport 
                onImportComplete={handleImportComplete}
                categories={categories}
              />
            </TabsContent>

            <TabsContent value="leads" className="mt-0">
              <LeadsDashboard 
                leads={leads}
                templates={emailTemplates}
                categories={categories}
                branding={branding}
                onUpdateLead={handleUpdateLead}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <CategoryManager
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <EmailTemplateBuilder 
                onSaveTemplate={handleSaveTemplate}
                templates={emailTemplates}
              />
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              <BrandingSettings 
                branding={branding}
                onSave={handleSaveBranding}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
