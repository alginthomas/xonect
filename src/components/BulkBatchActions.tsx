
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

interface BulkBatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  className?: string;
}

export const BulkBatchActions: React.FC<BulkBatchActionsProps> = ({
  selectedCount, onClearSelection, onBulkDelete, className = ""
}) => {
  if (selectedCount === 0) return null;
  return (
    <div className={`sticky top-20 z-10 bg-primary/5 border border-primary/20 rounded-md p-3 mb-4 flex items-center justify-between gap-4 ${className}`}>
      <span className="font-medium text-primary">{selectedCount} selected</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBulkDelete} className="text-destructive flex gap-1 items-center">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearSelection} title="Clear Selection">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
