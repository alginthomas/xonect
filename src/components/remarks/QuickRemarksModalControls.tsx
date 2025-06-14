
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, History, Save, X } from 'lucide-react';

interface QuickRemarksModalControlsProps {
  isEditing: boolean;
  remarksHistoryCount: number;
  showHistory: boolean;
  onSetIsEditing: (editing: boolean) => void;
  onToggleHistory: () => void;
  onSave: () => void;
  onCancelEditing: () => void; // Specifically for canceling edit mode
}

export const QuickRemarksModalControls: React.FC<QuickRemarksModalControlsProps> = ({
  isEditing,
  remarksHistoryCount,
  showHistory,
  onSetIsEditing,
  onToggleHistory,
  onSave,
  onCancelEditing,
}) => {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>
          <Save className="h-3 w-3 mr-1" /> Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancelEditing}>
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full justify-between">
        <Button size="sm" onClick={() => onSetIsEditing(true)}>
          <Edit3 className="h-3 w-3 mr-1" />
          Edit
        </Button>
        {remarksHistoryCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleHistory}
          >
            <History className="h-3 w-3 mr-1" />
            {showHistory ? 'Hide History' : 'Remarks History'}
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {remarksHistoryCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
};
