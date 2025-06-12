
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppleLayout from '@/layouts/AppleLayout';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { CSVImport } from '@/components/CSVImport';
import { ImportHistory } from '@/components/ImportHistory';
import { CategoryManager } from '@/components/CategoryManager';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { BrandingSettings } from '@/components/BrandingSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Users, 
  Tag, 
  Mail, 
  Settings, 
  FileSpreadsheet,
  TrendingUp,
  Target,
  Calendar,
  Building
} from 'lucide-react';

// Mock data - replace with actual data fetching
const mockLeads = [];
const mockTemplates = [];
const mockCategories = [];
const mockImportBatches = [];

const mockBranding = {
  companyName: 'Your Company',
  companyLogo: '',
  companyWebsite: 'https://yourcompany.com',
  companyAddress: '123 Business St, City, State 12345',
  senderName: 'Your Name',
  senderEmail: 'you@yourcompany.com'
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the current tab from URL params, default to 'dashboard'
  const currentTab = searchParams.get('tab') || 'dashboard';

  // Handle batch filter from URL
  useEffect(() => {
    const batchParam = searchParams.get('batch');
    if (batchParam) {
      setSelectedBatchId(batchParam);
      // If we have a batch filter and we're not on the leads tab, switch to it
      if (currentTab !== 'leads') {
        setSearchParams({ tab: 'leads', batch: batchParam });
      }
    } else {
      setSelectedBatchId(null);
    }
  }, [searchParams, currentTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    
    // If switching away from leads tab, clear batch filter
    if (value !== 'leads') {
      newParams.delete('batch');
      setSelectedBatchId(null);
    }
    
    setSearchParams(newParams);
  };

  const handleViewBatchLeads = (batchId: string) => {
    console.log('Switching to leads view for batch:', batchId);
    setSelectedBatchId(batchId);
    setSearchParams({ tab: 'leads', batch: batchId });
  };

  // Mock handlers - replace with actual implementations
  const handleUpdateLead = async (leadId: string, updates: any) => {
    console.log('Update lead:', leadId, updates);
  };

  const handleDeleteLead = async (leadId: string) => {
    console.log('Delete lead:', leadId);
  };

  const handleBulkUpdateStatus = async (leadIds: string[], status: any) => {
    console.log('Bulk update status:', leadIds, status);
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    console.log('Bulk delete:', leadIds);
  };

  const handleSendEmail = async (leadId: string) => {
    console.log('Send email to lead:', leadId);
  };

  const handleDeleteBatch = async (batchId: string) => {
    console.log('Delete batch:', batchId);
  };

  const handleCreateCategory = async (categoryData: any) => {
    console.log('Create category:', categoryData);
  };

  const handleUpdateCategory = async (id: string, updates: any) => {
    console.log('Update category:', id, updates);
  };

  const handleDeleteCategory = async (id: string) => {
    console.log('Delete category:', id);
  };

  const handleImportComplete = () => {
    console.log('Import completed');
  };

  const handleSaveTemplate = async (templateData: any) => {
    console.log('Save template:', templateData);
  };

  const handleSaveBranding = async (brandingData: any) => {
    console.log('Save branding:', brandingData);
  };

  // Calculate some basic stats for the overview
  const stats = {
    totalLeads: mockLeads.length,
    newLeads: mockLeads.filter(lead => lead.status === 'New').length,
    contactedLeads: mockLeads.filter(lead => lead.status === 'Contacted').length,
    qualifiedLeads: mockLeads.filter(lead => lead.status === 'Qualified').length,
    totalBatches: mockImportBatches.length,
    totalCategories: mockCategories.length,
    totalTemplates: mockTemplates.length
  };

  return (
    <AppleLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage your leads, import data, and track your outreach campaigns
            {selectedBatchId && (
              <Badge variant="secondary" className="ml-2">
                Filtered by batch
              </Badge>
            )}
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
              {selectedBatchId && <Badge variant="secondary" className="ml-1">Filtered</Badge>}
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeads}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    All contacts
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.newLeads}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Ready to contact
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.contactedLeads}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    Outreach sent
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Hot prospects
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Leads
                  </CardTitle>
                  <CardDescription>
                    Upload CSV files to add new leads to your database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleTabChange('import')} 
                    className="w-full"
                  >
                    Import New Leads
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Import History
                  </CardTitle>
                  <CardDescription>
                    View and manage your previous imports ({stats.totalBatches} batches)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImportHistory
                    leads={mockLeads}
                    importBatches={mockImportBatches}
                    categories={mockCategories}
                    onDeleteBatch={handleDeleteBatch}
                    onViewBatchLeads={handleViewBatchLeads}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Categories
                  </CardTitle>
                  <CardDescription>
                    Organize your leads with custom categories ({stats.totalCategories} active)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabChange('categories')} 
                    className="w-full"
                  >
                    Manage Categories
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <LeadsDashboard
              leads={mockLeads}
              templates={mockTemplates}
              categories={mockCategories}
              importBatches={mockImportBatches}
              branding={mockBranding}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
              onSendEmail={handleSendEmail}
              selectedBatchId={selectedBatchId}
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="import">
            <CSVImport 
              onImportComplete={handleImportComplete}
              categories={mockCategories}
              onCreateCategory={handleCreateCategory}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager
              categories={mockCategories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateBuilder
              onSaveTemplate={handleSaveTemplate}
              templates={mockTemplates}
            />
          </TabsContent>

          <TabsContent value="settings">
            <BrandingSettings
              branding={mockBranding}
              onSave={handleSaveBranding}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppleLayout>
  );
};

export default Index;
