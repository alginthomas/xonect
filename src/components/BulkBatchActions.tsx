
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X, Archive, Settings } from "lucide-react";
import { SmartDeletionDialog } from "./SmartDeletionDialog";
import type { ImportBatch } from "@/types/category";

interface BulkBatchActionsProps {
  selectedCount: number;
  selectedBatches: ImportBatch[];
  onClearSelection: () => void;
  onSmartDelete: (batchIds: string[], deletionType: 'cascade' | 'preserve' | 'soft') => void;
  className?: string;
}

export const BulkBatchActions: React.FC<BulkBatchActionsProps> = ({
  selectedCount,
  selectedBatches,
  onClearSelection,
  onSmartDelete,
  className = ""
}) => {
  const [showSmartDialog, setShowSmartDialog] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={`sticky top-20 z-10 bg-primary/5 border border-primary/20 rounded-md p-3 mb-4 flex items-center justify-between gap-4 ${className}`}>
        <span className="font-medium text-primary">{selectedCount} selected</span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSmartDialog(true)}
            className="text-destructive flex gap-1 items-center hover:bg-destructive/10"
          >
            <Settings className="h-4 w-4" />
            Smart Delete
          </Button>
          <Button variant="ghost" size="icon" onClick={onClearSelection} title="Clear Selection">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SmartDeletionDialog
        isOpen={showSmartDialog}
        onClose={() => setShowSmartDialog(false)}
        batches={selectedBatches}
        onConfirm={onSmartDelete}
      />
    </>
  );
};
