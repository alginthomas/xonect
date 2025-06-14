
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MessageSquare, Save, X, Edit3, Clock, History, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { RemarkEntry } from '@/types/lead';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing, showModal]);

  // Only show ellipsis; show icon if trimmed or if hovered
  const isLong = remarks.length > 50 || remarks.includes('\n');
  const showViewIcon = isLong || remarks.length > 0;

  // Handler: Viewing in modal
  const handleViewFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
    setEditValue(remarks);
    setIsEditing(false);
    setShowHistory(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(remarks);
    setIsEditing(true);
    setShowModal(true);
    setShowHistory(false);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    // Prepare new remark entry
    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: trimmed,
      timestamp: new Date()
    };
    const updatedHistory = [...remarksHistory, newEntry];
    onUpdate(trimmed, updatedHistory);
    setIsEditing(false);
    setShowModal(false);
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
    setShowModal(false);
    setShowHistory(false);
  };

  const handleToggleHistory = () => setShowHistory((v) => !v);

  // Table (cell) view: always one line, ellipsis, view button
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {remarks ? (
        <>
          <div
            className="flex-1 min-w-0 cursor-pointer group"
            onClick={isLong ? handleViewFull : undefined}
            style={{ maxWidth: 260 }}
            title={remarks}
          >
            {/* One line, ellipsis */}
            <span className="block text-sm line-clamp-1 break-all truncate pr-7 transition-colors">
              {remarks}
            </span>
          </div>
          {showViewIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 ml-[-1.5rem] opacity-70 hover:opacity-100 transition-opacity"
              onClick={handleViewFull}
              aria-label="View full remark"
              tabIndex={0}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {/* Always allow edit */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
            aria-label="Edit remarks"
            tabIndex={0}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left opacity-70 hover:opacity-100"
          onClick={handleEditClick}
        >
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add remarks...
          </span>
        </Button>
      )}

      {/* MODAL for full remark/editor/history */}
      <Dialog open={showModal} onOpenChange={v => { if (!v) handleCancel(); }}>
        <DialogContent className="max-w-lg w-full p-6 rounded-2xl space-y-2">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Remark' : 'Quick Remark'}
            </DialogTitle>
            {!isEditing && remarks && (
              <div className="text-xs flex items-center gap-1 text-muted-foreground pt-2">
                <Clock className="h-3 w-3" />
                Last updated:&nbsp;
                {remarksHistory.length > 0
                  ? format(
                      new Date(
                        [...remarksHistory].sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        )[0].timestamp
                      ),
                      'MMM dd, yyyy • HH:mm'
                    )
                  : ''}
              </div>
            )}
          </DialogHeader>
          {/* Content */}
          <div>
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="min-h-[80px] max-h-[120px] text-sm resize-none border-primary/20 focus:border-primary/40 whitespace-pre-wrap break-words"
                placeholder="Edit your remark..."
              />
            ) : (
              <div className="text-base whitespace-pre-wrap break-words font-normal py-2 min-h-[48px] max-h-40 overflow-y-auto">
                {remarks}
              </div>
            )}
          </div>
          {/* View/Edit controls */}
          <DialogFooter className="flex flex-col gap-2">
            {!isEditing ? (
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full justify-between">
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {remarksHistory.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleToggleHistory}
                    >
                      <History className="h-3 w-3 mr-1" />
                      {showHistory ? 'Hide History' : 'Remarks History'}
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {remarksHistory.length}
                      </Badge>
                    </Button>
                  )}
                </div>
                {/* REMARK HISTORY */}
                {showHistory && remarksHistory.length > 0 && (
                  <div className="w-full space-y-2 rounded-lg bg-muted/10 px-2 py-2 border border-muted max-h-40 overflow-y-auto">
                    {remarksHistory
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      )
                      .map((entry, idx) => (
                        <div
                          key={entry.id}
                          className="p-2 rounded-md bg-white/80 dark:bg-white/10 border border-border/10"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="block text-xs text-foreground break-words font-medium">
                              {entry.text}
                            </span>
                            {idx === 0 && (
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
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
