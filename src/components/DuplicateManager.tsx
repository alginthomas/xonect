
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getDuplicatePhoneStats, 
  getLeadsWithDuplicatePhones, 
  filterDuplicatePhoneNumbers 
} from '@/utils/phoneDeduplication';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onBulkAction: (action: 'delete' | 'merge', leadIds: string[]) => Promise<void>;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onBulkAction
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  const phoneStats = useMemo(() => getDuplicatePhoneStats(leads), [leads]);
  const duplicatePhoneLeads = useMemo(() => getLeadsWithDuplicatePhones(leads), [leads]);

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

  const handleBulkDelete = async () => {
    if (selectedDuplicates.size > 0) {
      await onBulkAction('delete', Array.from(selectedDuplicates));
      setSelectedDuplicates(new Set());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Duplicate Management</CardTitle>
          <CardDescription>
            Identify and manage duplicate leads based on phone numbers and emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{phoneStats.totalDuplicateGroups}</div>
              <div className="text-sm text-muted-foreground">Duplicate Phone Groups</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive">{phoneStats.totalDuplicateLeads}</div>
              <div className="text-sm text-muted-foreground">Total Duplicate Leads</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{phoneStats.averageDuplicatesPerGroup.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg. per Group</div>
            </div>
          </div>

          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="phone">Phone Number Duplicates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone" className="space-y-4">
              {duplicatePhoneLeads.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {selectedDuplicates.size} selected
                    </span>
                    <div className="space-x-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={selectedDuplicates.size === 0}
                      >
                        Delete Selected ({selectedDuplicates.size})
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {duplicatePhoneLeads.map(lead => (
                      <div key={lead.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedDuplicates.has(lead.id)}
                          onChange={(e) => handleSelectDuplicate(lead.id, e.target.checked)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                          <div className="text-sm text-muted-foreground">{lead.phone}</div>
                        </div>
                        <Badge variant="outline">{lead.company}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    No phone number duplicates found in your leads.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
