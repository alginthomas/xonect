import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const Index = () => {
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
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
    fetchTemplates();
    fetchCategories();
    fetchImportBatches();
    fetchBranding();
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
        setLeads(data);
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
        setTemplates(data);
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
        setCategories(data);
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
        setImportBatches(data);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching import batches',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .limit(1)

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        setBranding(data[0] as BrandingData);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching branding settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
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
            onSelectBatch={handleBatchSelect}
            selectedBatchId={selectedBatchId}
          />
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
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
                    <ImportHistory onSelectBatch={handleBatchSelect} />
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
                  <CategoryManager />
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
                  <EmailTemplateBuilder />
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
                  <BrandingSettings />
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
