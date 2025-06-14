
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { RemarkEntry } from '@/types/lead';

interface MobileRemarksHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remarksHistory: RemarkEntry[];
  currentRemark?: string;
}

export const MobileRemarksHistoryModal: React.FC<MobileRemarksHistoryModalProps> = ({
  open,
  onOpenChange,
  remarksHistory,
  currentRemark,
}) => {
  // Sort remarks by timestamp (newest first)
  const sortedRemarks = [...remarksHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bottom-0 top-auto translate-y-0 slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full rounded-t-3xl rounded-b-none border-0 p-6 max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Remarks History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {sortedRemarks.length > 0 ? (
            sortedRemarks.map((remark, index) => (
              <div
                key={remark.id}
                className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(remark.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Latest
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {remark.text}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No remarks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first remark to get started
              </p>
            </div>
          )}
        </div>

        {/* Swipe indicator */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
