
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
  onCancelEditing: () => void;
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
      <div className="flex gap-3">
        <Button size="lg" className="px-5 py-2 text-base" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>
        <Button size="lg" variant="outline" className="px-5 py-2 text-base" onClick={onCancelEditing}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full justify-between items-center">
        <Button size="lg" className="px-5 py-2 text-base" onClick={() => onSetIsEditing(true)}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        {remarksHistoryCount > 0 && (
          <Button
            size="lg"
            variant={showHistory ? "default" : "outline"}
            onClick={onToggleHistory}
            className="px-4 py-2 text-base flex items-center"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Hide History' : 'Remarks History'}
            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
              {remarksHistoryCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
};
