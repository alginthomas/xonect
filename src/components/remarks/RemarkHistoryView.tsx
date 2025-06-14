
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RemarkEntry } from '@/types/lead';

interface RemarkHistoryViewProps {
  remarksHistory: RemarkEntry[];
  currentRemarkText: string;
}

export const RemarkHistoryView: React.FC<RemarkHistoryViewProps> = ({ remarksHistory, currentRemarkText }) => {
  if (remarksHistory.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2 rounded-lg bg-muted/10 px-2 py-2 border border-muted max-h-40 overflow-y-auto">
      {remarksHistory
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((entry, idx) => (
          <div
            key={entry.id}
            className="p-2 rounded-md bg-white/80 dark:bg-white/10 border border-border/10"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="block text-xs text-foreground break-words font-medium w-full whitespace-pre-wrap">
                {entry.text}
              </span>
              {/* Show "Current" badge if this history entry's text matches the current main remark text AND it's the most recent entry in the sorted list */}
              {idx === 0 && currentRemarkText === entry.text && (
                <Badge variant="outline" className="h-5 px-2 text-xs ml-2 flex-shrink-0">
                  Current
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {format(new Date(entry.timestamp), 'MMM dd, yyyy • HH:mm')}
            </div>
          </div>
        ))}
    </div>
  );
};
