
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImport } from '@/components/CSVImport';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { Upload, Users, Mail, BarChart } from 'lucide-react';
import type { Lead, EmailTemplate } from '@/types/lead';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);

  const handleImportComplete = (importedLeads: Lead[]) => {
    setLeads(prev => [...prev, ...importedLeads]);
  };

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    ));
  };

  const handleSaveTemplate = (template: EmailTemplate) => {
    setEmailTemplates(prev => [...prev, template]);
  };

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
