import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, AlertTriangle, Users, Phone, Mail, Trash2, Check, Eye, RotateCcw } from 'lucide-react';
import { findAllDuplicatesInDatabase, getDeduplicationPlan } from '@/utils/duplicateDetection';
import { formatPhoneWithCountry, getCountryFromPhoneNumber } from '@/utils/phoneUtils';
import { filterDuplicatePhoneNumbers, getLeadsWithDuplicatePhones } from '@/utils/phoneDeduplication';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onDeduplicateLeads: (leadsToKeep: Lead[], leadsToRemove: Lead[]) => Promise<void>;
  onViewLead: (leadId: string) => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onDeduplicateLeads,
  onViewLead
}) => {
  const [activeTab, setActiveTab] = useState('email');
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<{
    emailDuplicateGroups: Lead[][];
    phoneDuplicateGroups: Lead[][];
    allDuplicateLeads: Lead[];
  } | null>(null);
  const [deduplicationPlan, setDeduplicationPlan] = useState<{
    leadsToKeep: Lead[];
    leadsToRemove: Lead[];
  } | null>(null);

  // Find duplicates when leads change
  useEffect(() => {
    if (leads.length > 0) {
      const results = findAllDuplicatesInDatabase(leads);
      setDuplicateResults(results);
      
      // Generate deduplication plan
      if (activeTab === 'email') {
        const plan = getDeduplicationPlan(results.emailDuplicateGroups);
        setDeduplicationPlan(plan);
      } else {
        const plan = getDeduplicationPlan(results.phoneDuplicateGroups);
        setDeduplicationPlan(plan);
      }
    }
  }, [leads, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (duplicateResults) {
      // Update deduplication plan based on selected tab
      if (value === 'email') {
        const plan = getDeduplicationPlan(duplicateResults.emailDuplicateGroups);
        setDeduplicationPlan(plan);
      } else {
        const plan = getDeduplicationPlan(duplicateResults.phoneDuplicateGroups);
        setDeduplicationPlan(plan);
      }
    }
  };

  const handleDeduplicate = async () => {
    if (!deduplicationPlan) return;
    
    setIsProcessing(true);
    try {
      await onDeduplicateLeads(deduplicationPlan.leadsToKeep, deduplicationPlan.leadsToRemove);
      // Success notification would be handled by the parent component
    } catch (error) {
      console.error('Error deduplicating leads:', error);
      // Error notification would be handled by the parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const getDuplicateGroups = () => {
    if (!duplicateResults) return [];
    return activeTab === 'email' ? duplicateResults.emailDuplicateGroups : duplicateResults.phoneDuplicateGroups;
  };

  const renderDuplicateGroups = () => {
    const groups = getDuplicateGroups();
    
    if (groups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Check className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">No duplicates found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {activeTab === 'email' ? 'All email addresses are unique' : 'All phone numbers are unique'}
          </p>
        </div>
      );
    }
    
    return groups.map((group, groupIndex) => (
      <Card key={groupIndex} className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {activeTab === 'email' ? 'Email Duplicate Group' : 'Phone Duplicate Group'} #{groupIndex + 1}
              </CardTitle>
              <CardDescription>
                {group.length} leads with {activeTab === 'email' ? 'the same email address' : 'the same phone number'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {activeTab === 'email' ? group[0].email : formatPhoneWithCountry(group[0].phone || '')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <ScrollArea className="h-[240px]">
            <div className="space-y-4">
              {group.map((lead, leadIndex) => {
                const isKeeper = deduplicationPlan?.leadsToKeep.some(l => l.id === lead.id);
                const countryInfo = lead.phone ? getCountryFromPhoneNumber(lead.phone) : null;
                
                return (
                  <div key={lead.id} className={`p-3 rounded-md border ${isKeeper ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {isKeeper && <Badge variant="success" className="mr-2 px-1 py-0">Keep</Badge>}
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {lead.title} {lead.company ? `at ${lead.company}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => onViewLead(lead.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          {countryInfo?.flag} {lead.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        Created: {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-3 flex justify-between items-center border-t">
          <div className="text-sm text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 inline-block mr-1 text-amber-500" />
            System will keep the lead with the most complete data
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Duplicate Manager</h2>
          <p className="text-muted-foreground">
            Find and merge duplicate leads to keep your database clean
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="default" 
            onClick={handleDeduplicate}
            disabled={!deduplicationPlan || deduplicationPlan.leadsToRemove.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove {deduplicationPlan?.leadsToRemove.length || 0} Duplicates
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Duplicate Summary</CardTitle>
            <CardDescription>
              Overview of duplicate leads in your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {duplicateResults?.allDuplicateLeads.length || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Total Duplicate Leads
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Mail className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {duplicateResults?.emailDuplicateGroups.length || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Email Duplicate Groups
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Phone className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {duplicateResults?.phoneDuplicateGroups.length || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Phone Duplicate Groups
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Duplicates</TabsTrigger>
            <TabsTrigger value="phone">Phone Duplicates</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-6 space-y-4">
            {renderDuplicateGroups()}
          </TabsContent>
          <TabsContent value="phone" className="mt-6 space-y-4">
            {renderDuplicateGroups()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
