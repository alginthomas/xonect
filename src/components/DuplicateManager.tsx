
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Trash2, Users, Mail, Building2 } from 'lucide-react';
import { getLeadsWithDuplicatePhones, getLeadsWithDuplicateEmails, filterDuplicatePhoneNumbers, filterDuplicateEmails } from '@/utils/phoneDeduplication';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onDeleteLeads: (leadIds: string[]) => Promise<void>;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onDeleteLeads
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  // Find leads with duplicate phones
  const duplicatePhoneLeads = useMemo(() => {
    const result = getLeadsWithDuplicatePhones(leads);
    return Array.isArray(result) ? result : [];
  }, [leads]);

  // Find leads with duplicate emails
  const duplicateEmailLeads = useMemo(() => {
    const result = getLeadsWithDuplicateEmails(leads);
    return Array.isArray(result) ? result : [];
  }, [leads]);

  // Find leads with duplicate companies
  const duplicateCompanyLeads = useMemo(() => {
    const companyGroups = leads.reduce((acc, lead) => {
      if (lead.company && lead.company.trim()) {
        const company = lead.company.toLowerCase().trim();
        if (!acc[company]) acc[company] = [];
        acc[company].push(lead);
      }
      return acc;
    }, {} as Record<string, Lead[]>);

    const result = Object.values(companyGroups).filter(group => group.length > 1).flat();
    return Array.isArray(result) ? result : [];
  }, [leads]);

  const handleSelectDuplicate = (leadId: string, checked: boolean) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleRemoveDuplicates = async () => {
    if (selectedDuplicates.size > 0) {
      await onDeleteLeads(Array.from(selectedDuplicates));
      setSelectedDuplicates(new Set());
    }
  };

  const renderDuplicateGroup = (duplicateLeads: Lead[], type: 'phone' | 'email' | 'company') => {
    if (!Array.isArray(duplicateLeads) || duplicateLeads.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No duplicates found</div>;
    }

    const groupBy = type === 'phone' ? 'phone' : type === 'email' ? 'email' : 'company';
    const groups = duplicateLeads.reduce((acc, lead) => {
      const key = lead[groupBy] || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    return (
      <div className="space-y-4">
        {Object.entries(groups).map(([key, groupLeads]) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{key}</CardTitle>
              <CardDescription>
                {groupLeads.length} duplicate{groupLeads.length > 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDuplicates.has(lead.id)}
                      onChange={(e) => handleSelectDuplicate(lead.id, e.target.checked)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email} • {lead.company}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{lead.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Duplicate Management</h2>
          <p className="text-muted-foreground">
            Find and manage duplicate leads in your database
          </p>
        </div>
        {selectedDuplicates.size > 0 && (
          <Button onClick={handleRemoveDuplicates} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove {selectedDuplicates.size} Selected
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{duplicateEmailLeads.length}</p>
                <p className="text-sm text-muted-foreground">Duplicate Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{duplicatePhoneLeads.length}</p>
                <p className="text-sm text-muted-foreground">Duplicate Phones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{duplicateCompanyLeads.length}</p>
                <p className="text-sm text-muted-foreground">Duplicate Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email Duplicates</TabsTrigger>
          <TabsTrigger value="phone">Phone Duplicates</TabsTrigger>
          <TabsTrigger value="company">Company Duplicates</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          {renderDuplicateGroup(duplicateEmailLeads, 'email')}
        </TabsContent>

        <TabsContent value="phone" className="space-y-4">
          {renderDuplicateGroup(duplicatePhoneLeads, 'phone')}
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          {renderDuplicateGroup(duplicateCompanyLeads, 'company')}
        </TabsContent>
      </Tabs>
    </div>
  );
};
