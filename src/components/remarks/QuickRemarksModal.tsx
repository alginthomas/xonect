
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
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Apple-style responsive modal with improved mobile UX
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
  const [editValue, setEditValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open) {
      setEditValue('');
      setIsEditing(initialIsEditing);
      setShowHistory(false);
    }
  }, [open, initialIsEditing]);

  useEffect(() => {
    if (open && isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open, isEditing]);

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
  }, [isEditing, editValue, open]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
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
      <DialogContent 
        className={`
          ${isMobile 
            ? 'fixed inset-x-2 bottom-0 top-auto h-[85vh] max-h-[85vh] w-auto max-w-none rounded-t-3xl rounded-b-none data-[state=open]:slide-in-from-bottom-[100%] data-[state=closed]:slide-out-to-bottom-[100%]' 
            : 'max-w-md'
          } 
          p-0 gap-0 flex flex-col overflow-hidden border-0 shadow-2xl
        `}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Mobile header with close button - Apple style */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModalCloseIntent}
              className="text-blue-600 font-medium"
            >
              Cancel
            </Button>
            <h3 className="font-semibold text-lg">
              {isEditing ? 'Add Remark' : 'Remarks'}
            </h3>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-blue-600 font-medium"
                disabled={!editValue.trim()}
              >
                Save
              </Button>
            )}
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalCloseIntent}
                className="p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <DialogHeader className="p-6 pb-3">
            <QuickRemarksModalHeader
              isEditing={isEditing}
              remarksPresent={!!initialRemarks}
              latestHistoryEntry={latestHistoryEntry}
            />
          </DialogHeader>
        )}

        {/* Content area */}
        <div className="flex-1 px-4 pb-4 overflow-y-auto min-h-0">
          {!isMobile && latestHistoryEntry && !isEditing && (
            <div className="text-xs flex items-center gap-1 text-muted-foreground mb-3">
              Last updated: {latestHistoryEntry.timestamp.toLocaleDateString()}
            </div>
          )}

          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className={`
                w-full resize-none border-0 shadow-none focus-visible:ring-0 p-0
                ${isMobile ? 'min-h-[120px] text-base' : 'min-h-[100px] text-sm'}
                bg-transparent placeholder:text-muted-foreground/60
              `}
              placeholder="Type your remark here..."
              tabIndex={0}
              aria-label="Add New Remark"
            />
          ) : (
            <div className={`w-full ${isMobile ? 'text-base' : 'text-sm'} whitespace-pre-wrap break-words py-2`}>
              {initialRemarks || (
                <span className="text-muted-foreground italic">
                  No remarks yet. Tap "Add Remark" to get started.
                </span>
              )}
            </div>
          )}

          {/* History section */}
          {!isEditing && showHistory && (
            <div className="mt-4 pt-4 border-t">
              <RemarkHistoryView
                remarksHistory={initialRemarksHistory}
                currentRemarkText={initialRemarks}
              />
            </div>
          )}
        </div>

        {/* Controls footer - Desktop only */}
        {!isMobile && (
          <DialogFooter className="p-6 pt-3 gap-2">
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
        )}

        {/* Mobile controls */}
        {isMobile && !isEditing && (
          <div className="p-4 border-t bg-background/95 backdrop-blur space-y-3">
            <Button 
              onClick={() => setIsEditing(true)}
              className="w-full h-12 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Add Remark
            </Button>
            {initialRemarksHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={handleToggleHistory}
                className="w-full h-11 text-base rounded-xl"
              >
                {showHistory ? 'Hide' : 'Show'} History ({initialRemarksHistory.length})
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
