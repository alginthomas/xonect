
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


  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed && !initialRemarks) { // Don't save if new and empty
      // Closing modal or staying in edit mode is an option. For now, just return.
      return;
    }
    if (trimmed === initialRemarks) { // If content is unchanged
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
    setIsEditing(false); // Exit edit mode
    onOpenChange(false); // Close modal
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditValue(initialRemarks); // Reset edit value to what it was before editing started
    // If modal should close on canceling edit, call onOpenChange(false)
    // For now, just exits edit mode, stays in modal.
  };
  
  const handleModalCloseIntent = () => {
    // This is called when the Dialog signals a close (e.g., overlay click, Esc key)
    setIsEditing(false); // Ensure edit mode is exited
    setShowHistory(false); // Reset history view
    onOpenChange(false); // Propagate close
  };

  const handleToggleHistory = () => setShowHistory((v) => !v);

  const latestHistoryEntry = initialRemarksHistory.length > 0 
    ? [...initialRemarksHistory].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
    : null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleModalCloseIntent(); }}>
      <DialogContent className="max-w-lg w-full p-6 rounded-2xl space-y-2">
        <DialogHeader>
          <QuickRemarksModalHeader
            isEditing={isEditing}
            remarksPresent={!!initialRemarks}
            latestHistoryEntry={latestHistoryEntry}
          />
        </DialogHeader>
        
        <div className="w-full">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full min-h-[80px] max-h-[120px] text-sm resize-none border-primary/20 focus:border-primary/40 whitespace-pre-wrap break-words"
              placeholder="Edit your remark..."
            />
          ) : (
            <div className="w-full text-base whitespace-pre-wrap break-words font-normal py-2 min-h-[48px] max-h-40 overflow-y-auto">
              {initialRemarks || <span className="text-muted-foreground italic">No remark. Click 'Edit' to add.</span>}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
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
            <RemarkHistoryView
              remarksHistory={initialRemarksHistory}
              currentRemarkText={initialRemarks}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
