
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
  const [editValue, setEditValue] = useState(initialRemarks);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setEditValue(initialRemarks);
      setIsEditing(initialIsEditing);
      setShowHistory(false); // Reset history visibility when modal opens/re-opens
    }
  }, [open, initialRemarks, initialIsEditing]);

  useEffect(() => {
    if (open && isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [open, isEditing]);

  // Keyboard shortcuts for save/cancel
  useEffect(() => {
    if (!open || !isEditing) return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancelEditing();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [isEditing, editValue, open]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed && !initialRemarks) {
      return;
    }
    if (trimmed === initialRemarks) {
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
    setEditValue(initialRemarks);
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
      <DialogContent className="max-w-screen-sm w-full px-3 py-5 sm:p-6 rounded-2xl space-y-3 flex flex-col animate-fade-in">
        <DialogHeader>
          <QuickRemarksModalHeader
            isEditing={isEditing}
            remarksPresent={!!initialRemarks}
            latestHistoryEntry={latestHistoryEntry}
          />
        </DialogHeader>
        
        <div className="w-full min-h-20">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full min-h-[90px] max-h-[160px] text-base resize-none border-primary/30 focus:border-primary/50 whitespace-pre-wrap break-words shadow-sm"
              placeholder="Type a remark..."
              tabIndex={0}
              aria-label="Edit Remark"
            />
          ) : (
            <div className="w-full text-base whitespace-pre-wrap break-words font-normal py-2 min-h-[52px] max-h-44 overflow-x-auto overflow-y-auto border border-muted/10 rounded-lg px-2 bg-muted/10">
              {initialRemarks || <span className="text-muted-foreground italic">No remark. Click 'Edit' to add.</span>}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 mt-0">
          <QuickRemarksModalControls
            isEditing={isEditing}
            remarksHistoryCount={initialRemarksHistory.length}
            showHistory={showHistory}
            onSetIsEditing={setIsEditing}
            onToggleHistory={handleToggleHistory}
            onSave={handleSave}
            onCancelEditing={handleCancelEditing}
          />
          {!isEditing && showHistory && (
            <div className="w-full">
              <RemarkHistoryView
                remarksHistory={initialRemarksHistory}
                currentRemarkText={initialRemarks}
              />
            </div>
          )}
        </DialogFooter>
        {/* Mobile bar hint */}
        <div className="block sm:hidden text-xs text-center text-muted-foreground mt-2">
          Tap outside or swipe down to close
        </div>
      </DialogContent>
    </Dialog>
  );
};
