
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, History, Save, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Mobile-first layout: stack buttons for better touch interaction
  if (isEditing) {
    return (
      <div className={`flex w-full ${isMobile ? 'flex-col gap-2' : 'gap-3 justify-end'}`}>
        <Button 
          size={isMobile ? "default" : "lg"} 
          className={`${isMobile ? 'w-full h-11' : 'px-5 py-2'} text-base`} 
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>
        <Button 
          size={isMobile ? "default" : "lg"} 
          variant="outline" 
          className={`${isMobile ? 'w-full h-11' : 'px-5 py-2'} text-base`} 
          onClick={onCancelEditing}
        >
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isMobile ? 'flex-col gap-2' : 'gap-3 justify-end'}`}>
      <Button 
        size={isMobile ? "default" : "lg"} 
        className={`${isMobile ? 'w-full h-11' : 'px-5 py-2'} text-base`} 
        onClick={() => onSetIsEditing(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Remark
      </Button>
      {remarksHistoryCount > 0 && (
        <Button
          size={isMobile ? "default" : "lg"}
          variant={showHistory ? "default" : "outline"}
          onClick={onToggleHistory}
          className={`${isMobile ? 'w-full h-11' : 'px-4 py-2'} text-base flex items-center ${isMobile ? 'justify-center' : ''}`}
        >
          <History className="h-4 w-4 mr-2" />
          {showHistory ? 'Hide History' : 'Show History'}
          <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
            {remarksHistoryCount}
          </Badge>
        </Button>
      )}
    </div>
  );
};
