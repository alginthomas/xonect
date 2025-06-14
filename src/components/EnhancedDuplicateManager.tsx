
import React, { useState, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { findAdvancedDuplicates, generateDuplicateReport, mergeLeads } from '@/utils/advancedDuplicateDetection';
import { DuplicateQualityMetrics } from '@/components/duplicates/DuplicateQualityMetrics';
import { DuplicateGroupCard } from '@/components/duplicates/DuplicateGroupCard';
import { DuplicateAnalyticsView } from '@/components/duplicates/DuplicateAnalyticsView';
import { DuplicateBulkActions } from '@/components/duplicates/DuplicateBulkActions';
import type { Lead } from '@/types/lead';

interface EnhancedDuplicateManagerProps {
  leads: Lead[];
  onBulkAction: (action: 'delete' | 'merge', leadIds: string[]) => Promise<void>;
  onMergeLeads?: (leadsToMerge: Lead[], keepLead: Lead) => Promise<void>;
}

export const EnhancedDuplicateManager: React.FC<EnhancedDuplicateManagerProps> = ({
  leads,
  onBulkAction,
  onMergeLeads
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  // Generate comprehensive duplicate analysis
  const duplicateAnalysis = useMemo(() => {
    const report = generateDuplicateReport(leads);
    const groups: Lead[][] = [];
    const processedIds = new Set<string>();

    // Find duplicate groups
    leads.forEach(lead => {
      if (processedIds.has(lead.id)) return;

      const matches = findAdvancedDuplicates(lead, leads.filter(l => l.id !== lead.id));
      if (matches.length > 0) {
        const group = [lead, ...matches.map(m => m.existingLead)];
        const uniqueGroup = group.filter(l => !processedIds.has(l.id));
        
        if (uniqueGroup.length > 1) {
          groups.push(uniqueGroup);
          uniqueGroup.forEach(l => processedIds.add(l.id));
        }
      }
    });

    return { report, groups };
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

  const handleMergeGroup = async (group: Lead[]) => {
    if (group.length < 2) return;
    
    try {
      const mergedLead = mergeLeads(group);
      const idsToRemove = group.filter(l => l.id !== mergedLead.id).map(l => l.id);
      
      if (onMergeLeads) {
        await onMergeLeads(group, mergedLead);
      } else {
        await onBulkAction('delete', idsToRemove);
      }
      
      setSelectedDuplicates(new Set());
    } catch (error) {
      console.error('Error merging leads:', error);
    }
  };

  const handleClearSelection = () => {
    setSelectedDuplicates(new Set());
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    await onBulkAction('delete', leadIds);
    setSelectedDuplicates(new Set());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile-optimized Header with Quality Score */}
      <div className="p-3 sm:p-6 border-b bg-background">
        <DuplicateQualityMetrics 
          report={duplicateAnalysis.report}
          totalLeads={leads.length}
          duplicateGroupsCount={duplicateAnalysis.groups.length}
        />
      </div>

      {/* Mobile-optimized Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="groups" className="flex-1 flex flex-col">
          <div className="px-3 sm:px-6 py-2 border-b">
            <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
              <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="bulk" className="text-xs sm:text-sm">Bulk Actions</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="groups" className="p-3 sm:p-6 space-y-3 sm:space-y-4 mt-0">
              {duplicateAnalysis.groups.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {duplicateAnalysis.groups.map((group, groupIndex) => (
                    <DuplicateGroupCard
                      key={groupIndex}
                      group={group}
                      groupIndex={groupIndex}
                      selectedDuplicates={selectedDuplicates}
                      onSelectDuplicate={handleSelectDuplicate}
                      onMergeGroup={handleMergeGroup}
                    />
                  ))}
                </div>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Great! No duplicate groups found in your leads database.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="p-3 sm:p-6 space-y-4 mt-0">
              <DuplicateAnalyticsView 
                report={duplicateAnalysis.report}
                totalLeads={leads.length}
                duplicateGroupsCount={duplicateAnalysis.groups.length}
              />
            </TabsContent>

            <TabsContent value="bulk" className="p-3 sm:p-6 space-y-4 mt-0">
              <DuplicateBulkActions
                selectedDuplicates={selectedDuplicates}
                duplicateGroups={duplicateAnalysis.groups}
                onClearSelection={handleClearSelection}
                onBulkDelete={handleBulkDelete}
                onMergeGroup={handleMergeGroup}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
