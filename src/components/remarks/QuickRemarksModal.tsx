
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
import { X, ChevronDown } from 'lucide-react';
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

  const handleModalClose = () => {
    setIsEditing(false);
    setShowHistory(false);
    onOpenChange(false);
  };

  const handleToggleHistory = () => setShowHistory((v) => !v);

  const latestHistoryEntry = initialRemarksHistory.length > 0 
    ? [...initialRemarksHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile 
            ? 'fixed inset-x-0 bottom-0 top-auto h-[90vh] max-h-[90vh] w-full max-w-none rounded-t-[28px] rounded-b-none border-0 p-0 shadow-2xl bg-white dark:bg-gray-900' 
            : 'max-w-md rounded-2xl border-0 shadow-xl bg-white dark:bg-gray-900'
          } 
          flex flex-col overflow-hidden
        `}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Mobile drag indicator */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Mobile header with close button - Apple style */}
        {isMobile && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModalClose}
              className="text-blue-600 hover:text-blue-700 font-medium text-base px-0"
            >
              Cancel
            </Button>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {isEditing ? 'Add Remark' : 'Remarks'}
            </h3>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-blue-600 hover:text-blue-700 font-semibold text-base px-0"
                disabled={!editValue.trim()}
              >
                Save
              </Button>
            )}
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <DialogHeader className="p-6 pb-4">
            <QuickRemarksModalHeader
              isEditing={isEditing}
              remarksPresent={!!initialRemarks}
              latestHistoryEntry={latestHistoryEntry}
            />
          </DialogHeader>
        )}

        {/* Content area */}
        <div className={`flex-1 overflow-y-auto min-h-0 ${isMobile ? 'px-6' : 'px-6'}`}>
          {!isMobile && latestHistoryEntry && !isEditing && (
            <div className="text-xs flex items-center gap-1 text-gray-500 mb-4">
              Last updated: {latestHistoryEntry.timestamp.toLocaleDateString()}
            </div>
          )}

          {isEditing ? (
            <div className={`${isMobile ? 'mt-2' : 'mt-0'}`}>
              <Textarea
                ref={textareaRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className={`
                  w-full resize-none border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent
                  ${isMobile ? 'min-h-[200px] text-base leading-relaxed' : 'min-h-[120px] text-sm'}
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                `}
                placeholder="What would you like to note about this lead?"
                tabIndex={0}
                aria-label="Add New Remark"
              />
            </div>
          ) : (
            <div className={`w-full whitespace-pre-wrap break-words ${isMobile ? 'text-base leading-relaxed py-4' : 'text-sm py-2'}`}>
              {initialRemarks || (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">💭</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    No remarks yet
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Tap "Add Remark" to get started
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History section */}
          {!isEditing && showHistory && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <RemarkHistoryView
                remarksHistory={initialRemarksHistory}
                currentRemarkText={initialRemarks}
              />
            </div>
          )}
        </div>

        {/* Controls footer - Desktop only */}
        {!isMobile && (
          <DialogFooter className="p-6 pt-4 gap-3">
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
          <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <Button 
              onClick={() => setIsEditing(true)}
              className="w-full h-14 text-base font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Add Remark
            </Button>
            {initialRemarksHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={handleToggleHistory}
                className="w-full h-12 text-base rounded-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="flex items-center justify-center gap-2">
                  {showHistory ? 'Hide' : 'Show'} History ({initialRemarksHistory.length})
                  <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </span>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
