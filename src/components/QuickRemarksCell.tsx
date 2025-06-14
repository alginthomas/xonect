
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RemarkEntry } from '@/types/lead';
import { SimpleRemarksList } from './remarks/SimpleRemarksList';

interface QuickRemarksCellProps {
  remarks: string;
  remarksHistory?: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  className?: string;
}

export const QuickRemarksCell: React.FC<QuickRemarksCellProps> = ({
  remarks,
  remarksHistory = [],
  onUpdate,
  className = "",
}) => {
  const [showDialog, setShowDialog] = useState(false);

  // Truncate with ellipsis and a tooltip for overflow
  const TRUNCATE_LENGTH = 50;
  const isLong = remarks.length > TRUNCATE_LENGTH || remarks.includes('\n');
  const truncated = remarks.length > TRUNCATE_LENGTH
    ? `${remarks.slice(0, TRUNCATE_LENGTH)}...`
    : remarks;

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Preview or Add button */}
      {remarks ? (
        <>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleViewClick}
            style={{ maxWidth: 240 }}
            title={remarks}
          >
            <span className="block text-sm line-clamp-1 break-all truncate pr-2 transition-colors">
              {isLong ? truncated : remarks}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 opacity-80 hover:opacity-100 transition-opacity"
            onClick={handleViewClick}
            aria-label="View remarks"
            tabIndex={0}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left opacity-90 hover:opacity-100"
          onClick={handleViewClick}
        >
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add remark...
          </span>
        </Button>
      )}

      {/* Simple Dialog with Remarks List */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Remarks</DialogTitle>
          </DialogHeader>
          <SimpleRemarksList
            remarks={remarks}
            remarksHistory={remarksHistory}
            onUpdate={onUpdate}
            className="mt-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
