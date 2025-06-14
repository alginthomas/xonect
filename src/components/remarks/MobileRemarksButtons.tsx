
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, History } from 'lucide-react';
import { MobileAddRemarkModal } from './MobileAddRemarkModal';
import { MobileRemarksHistoryModal } from './MobileRemarksHistoryModal';
import type { RemarkEntry } from '@/types/lead';

interface MobileRemarksButtonsProps {
  remarks: string;
  remarksHistory: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  className?: string;
}

export const MobileRemarksButtons: React.FC<MobileRemarksButtonsProps> = ({
  remarks,
  remarksHistory,
  onUpdate,
  className = "",
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleSaveRemark = (text: string) => {
    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text,
      timestamp: new Date()
    };
    
    const updatedHistory = [...remarksHistory, newEntry].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    onUpdate(text, updatedHistory);
  };

  const historyCount = remarksHistory.length;

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Add Remark Button */}
      <Button
        size="lg"
        className="flex-1 h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        variant="ghost"
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="h-5 w-5 mr-2" />
        <span className="text-base font-medium">Add Remark</span>
      </Button>

      {/* History Button */}
      <Button
        size="lg"
        variant="ghost"
        className="px-4 h-12 rounded-xl bg-muted/50 hover:bg-muted/70 border border-border/30"
        onClick={() => setShowHistoryModal(true)}
        disabled={historyCount === 0}
      >
        <History className="h-5 w-5" />
        {historyCount > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-2 h-5 min-w-5 px-1.5 text-xs bg-primary/20 text-primary border-0"
          >
            {historyCount}
          </Badge>
        )}
      </Button>

      {/* Modals */}
      <MobileAddRemarkModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleSaveRemark}
      />

      <MobileRemarksHistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        remarksHistory={remarksHistory}
        currentRemark={remarks}
      />
    </div>
  );
};
