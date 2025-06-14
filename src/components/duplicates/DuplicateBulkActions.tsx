
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Merge, Mail } from 'lucide-react';
import { findAdvancedDuplicates } from '@/utils/advancedDuplicateDetection';
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
  const handleAutoMergeHighConfidence = () => {
    duplicateGroups.forEach(group => {
      const matches = findAdvancedDuplicates(group[0], group.slice(1));
      if (matches[0]?.confidence >= 0.9) {
        onMergeGroup(group);
      }
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
              disabled={selectedDuplicates.size === 0}
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
              disabled={selectedDuplicates.size === 0}
              className="w-full sm:w-auto text-xs"
            >
              Delete Selected ({selectedDuplicates.size})
            </Button>
          </div>
        </div>

        {/* Mobile-optimized Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleAutoMergeHighConfidence}
              className="justify-start text-xs sm:text-sm h-auto py-3"
            >
              <Merge className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span>Auto-merge High Confidence (90%+)</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMergeEmailMatches}
              className="justify-start text-xs sm:text-sm h-auto py-3"
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
