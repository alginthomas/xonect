
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import type { RemarkEntry } from '@/types/lead';
import { QuickRemarksModalHeader } from './QuickRemarksModalHeader';
import { RemarkHistoryView } from './RemarkHistoryView';
import { QuickRemarksModalControls } from './QuickRemarksModalControls';
import { useIsMobile } from '@/hooks/use-mobile';

// Improved modal layout to ensure controls never overflow and better mobile support
interface QuickRemarksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRemarks: string;
  initialRemarksHistory: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  initialIsEditing?: boolean;
}

export const QuickRemarksModal: React.FC<QuickRemarksModalProps> = ({
  open,
  onOpenChange,
  initialRemarks,
  initialRemarksHistory,
  onUpdate,
  initialIsEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editValue, setEditValue] = useState(''); // Always start with empty string for new remarks
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open) {
      // Always start with empty textarea when adding new remarks
      setEditValue('');
      setIsEditing(initialIsEditing);
      setShowHistory(false);
    }
  }, [open, initialIsEditing]);

  useEffect(() => {
    if (open && isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Don't pre-select text since we want empty textarea
    }
  }, [open, isEditing]);

  useEffect(() => {
    if (!open || !isEditing) return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaCmd) && e.key === 'Enter') {
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancelEditing();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditing, editValue, open]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      // If empty, just close without saving
      setIsEditing(false);
      onOpenChange(false);
      return;
    }
    
    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: trimmed,
      timestamp: new Date()
    };
    const updatedHistory = [...initialRemarksHistory, newEntry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    onUpdate(trimmed, updatedHistory);
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleModalCloseIntent = () => {
    setIsEditing(false);
    setShowHistory(false);
    onOpenChange(false);
  };

  const handleToggleHistory = () => setShowHistory((v) => !v);

  const latestHistoryEntry = initialRemarksHistory.length > 0 
    ? [...initialRemarksHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
    : null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleModalCloseIntent(); }}>
      <DialogContent className={`w-full ${isMobile ? 'max-w-[95vw] mx-2 max-h-[90vh]' : 'max-w-screen-sm'} px-3 py-5 sm:p-6 rounded-2xl space-y-3 flex flex-col animate-fade-in`}>

        <DialogHeader>
          <QuickRemarksModalHeader
            isEditing={isEditing}
            remarksPresent={!!initialRemarks}
            latestHistoryEntry={latestHistoryEntry}
          />
        </DialogHeader>

        <div className="w-full flex-1 min-h-20">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className={`w-full ${isMobile ? 'min-h-[80px] max-h-[120px] text-sm' : 'min-h-[90px] max-h-[160px] text-base'} resize-none border-primary/30 focus:border-primary/50 whitespace-pre-wrap break-words shadow-sm`}
              placeholder="Type a new remark..."
              tabIndex={0}
              aria-label="Add New Remark"
            />
          ) : (
            <div className={`w-full ${isMobile ? 'text-sm' : 'text-base'} whitespace-pre-wrap break-words font-normal py-2 min-h-[52px] max-h-44 overflow-y-auto border border-muted/10 rounded-lg px-2 bg-muted/10`}>
              {initialRemarks || <span className="text-muted-foreground italic">No remark. Click 'Add New Remark' to add.</span>}
            </div>
          )}
        </div>

        {/* Controls are always at the bottom, never floating outside modal */}
        <DialogFooter className={`gap-2 mt-2 w-full ${isMobile ? 'flex-col space-y-2' : ''}`}>
          <QuickRemarksModalControls
            isEditing={isEditing}
            remarksHistoryCount={initialRemarksHistory.length}
            showHistory={showHistory}
            onSetIsEditing={setIsEditing}
            onToggleHistory={handleToggleHistory}
            onSave={handleSave}
            onCancelEditing={handleCancelEditing}
          />
        </DialogFooter>

        {/* History always within modal boundaries and scrollable if needed */}
        {!isEditing && showHistory && (
          <div className="w-full mt-2 max-h-40 overflow-y-auto">
            <RemarkHistoryView
              remarksHistory={initialRemarksHistory}
              currentRemarkText={initialRemarks}
            />
          </div>
        )}

        {isMobile && (
          <div className="text-xs text-center text-muted-foreground mt-2">
            Tap outside or swipe down to close
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
