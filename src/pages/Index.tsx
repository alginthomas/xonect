
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImport } from '@/components/CSVImport';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { Upload, Users, Mail, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Lead, EmailTemplate } from '@/types/lead';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load leads from Supabase
  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match our Lead interface
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
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match our EmailTemplate interface
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadLeads(), loadEmailTemplates()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleImportComplete = async (importedLeads: Lead[]) => {
    try {
      // Transform leads to match Supabase schema
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
      }));

      const { error } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (error) throw error;

      // Reload leads from database
      await loadLeads();
      
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
    try {
      // Transform updates to match Supabase schema
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

      const { error } = await supabase
        .from('leads')
        .update(supabaseUpdates)
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
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
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
        });

      if (error) throw error;

      // Reload templates from database
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

  if (loading) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Lead Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Import, organize, and nurture your leads with personalized email campaigns
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <LeadsDashboard 
              leads={leads}
              onUpdateLead={handleUpdateLead}
            />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <CSVImport onImportComplete={handleImportComplete} />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsDashboard 
              leads={leads}
              onUpdateLead={handleUpdateLead}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <EmailTemplateBuilder 
              onSaveTemplate={handleSaveTemplate}
              templates={emailTemplates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
