import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Merge, Mail } from 'lucide-react';
import { findAdvancedDuplicates } from '@/utils/advancedDuplicateDetection';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

interface DuplicateBulkActionsProps {
  selectedDuplicates: Set<string>;
  duplicateGroups: Lead[][];
  onClearSelection: () => void;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
  onMergeGroup: (group: Lead[]) => Promise<void>;
}

export const DuplicateBulkActions: React.FC<DuplicateBulkActionsProps> = ({
  selectedDuplicates,
  duplicateGroups,
  onClearSelection,
  onBulkDelete,
  onMergeGroup
}) => {
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState({ processed: 0, total: 0 });
  const { toast } = useToast();

  const handleAutoMergeHighConfidence = async () => {
    setIsMerging(true);
    const highConfidenceGroups = duplicateGroups.filter(group => {
      const matches = findAdvancedDuplicates(group[0], group.slice(1));
      return matches[0]?.confidence >= 0.9;
    });
    setMergeProgress({ processed: 0, total: highConfidenceGroups.length });
    for (let i = 0; i < highConfidenceGroups.length; i++) {
      await onMergeGroup(highConfidenceGroups[i]);
      setMergeProgress(prev => ({ ...prev, processed: prev.processed + 1 }));
    }
    setIsMerging(false);
    toast({
      title: 'Auto-merge Complete',
      description: `Merged ${highConfidenceGroups.length} high-confidence duplicate group${highConfidenceGroups.length !== 1 ? 's' : ''}.`,
      variant: 'default'
    });
  };

  const handleMergeEmailMatches = () => {
    const emailDuplicates = duplicateGroups.filter(group => {
      const matches = findAdvancedDuplicates(group[0], group.slice(1));
      return matches[0]?.matchType === 'email';
    });
    emailDuplicates.forEach(onMergeGroup);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bulk Duplicate Actions</CardTitle>
        <CardDescription className="text-sm">
          Perform actions on multiple duplicates at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedDuplicates.size} leads selected
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearSelection}
              disabled={selectedDuplicates.size === 0 || isMerging}
              className="w-full sm:w-auto text-xs"
            >
              Clear Selection
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                onBulkDelete(Array.from(selectedDuplicates));
                onClearSelection();
              }}
              disabled={selectedDuplicates.size === 0 || isMerging}
              className="w-full sm:w-auto text-xs"
            >
              Delete Selected ({selectedDuplicates.size})
            </Button>
          </div>
        </div>

        {/* Progress Feedback for Auto-Merge */}
        {isMerging && (
          <div className="flex flex-col gap-2 items-center py-2">
            <Progress value={mergeProgress.total ? (mergeProgress.processed / mergeProgress.total) * 100 : 0} className="w-full max-w-md" />
            <span className="text-xs text-muted-foreground">
              Merging... ({mergeProgress.processed}/{mergeProgress.total})
            </span>
          </div>
        )}

        {/* Mobile-optimized Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleAutoMergeHighConfidence}
              className="justify-start text-xs sm:text-sm h-auto py-3"
              disabled={isMerging}
            >
              {isMerging ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Merging... ({mergeProgress.processed}/{mergeProgress.total})
                </span>
              ) : (
                <>
                  <Merge className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span>Auto-merge High Confidence (90%+)</span>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMergeEmailMatches}
              className="justify-start text-xs sm:text-sm h-auto py-3"
              disabled={isMerging}
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span>Merge Exact Email Matches</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
