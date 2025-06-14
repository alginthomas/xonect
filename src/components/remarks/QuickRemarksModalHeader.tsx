
import React from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { RemarkEntry } from '@/types/lead';

interface QuickRemarksModalHeaderProps {
  isEditing: boolean;
  remarksPresent: boolean;
  latestHistoryEntry?: RemarkEntry | null;
}

export const QuickRemarksModalHeader: React.FC<QuickRemarksModalHeaderProps> = ({
  isEditing,
  remarksPresent,
  latestHistoryEntry,
}) => {
  return (
    <>
      <DialogTitle className="flex items-center gap-3">
        {isEditing ? 'Edit Remark' : 'Quick Remark'}
      </DialogTitle>
      {!isEditing && remarksPresent && latestHistoryEntry && (
        <div className="text-xs flex items-center gap-1 text-muted-foreground pt-2">
          <Clock className="h-3 w-3" />
          Last updated:&nbsp;
          {format(new Date(latestHistoryEntry.timestamp), 'MMM dd, yyyy • HH:mm')}
        </div>
      )}
    </>
  );
};
