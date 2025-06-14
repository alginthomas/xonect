
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, X, Edit3, Clock, ChevronDown, ChevronUp, History } from 'lucide-react';
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
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editValue.trim()) return;

    // Create new entry with current timestamp
    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: editValue.trim(),
      timestamp: new Date()
    };

    // Append the new entry to the existing history
    const updatedHistory = [...remarksHistory, newEntry];
    onUpdate(editValue.trim(), updatedHistory);
    setEditValue('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue('');
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(remarks);
    setIsEditing(true);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue('');
    setIsEditing(true);
  };

  // Get the most recent timestamp from history
  const getMostRecentTimestamp = () => {
    if (remarksHistory.length === 0) return null;
    const sortedHistory = [...remarksHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedHistory[0].timestamp;
  };

  const handleToggleHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHistory(!showHistory);
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[80px] max-h-[120px] text-sm resize-none border-primary/20 focus:border-primary/40 whitespace-pre-wrap break-words overflow-wrap-anywhere"
          placeholder="Add your remarks..."
          style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="h-8 px-3 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-3 text-xs">
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Remark Display with Edit Button */}
      <div className="relative group">
        {remarks ? (
          <div className="bg-muted/10 rounded-lg p-3 border border-border/20 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere flex-1" 
                 style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                {remarks}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-6 w-6 p-0 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                title="Edit remarks"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            
            {getMostRecentTimestamp() && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {format(new Date(getMostRecentTimestamp()!), 'MMM dd, yyyy • HH:mm')}</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-full bg-muted/5 border border-dashed border-border/30 rounded-lg p-3 text-left hover:bg-muted/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Add remarks...</span>
              </div>
              <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
            </div>
          </button>
        )}
      </div>

      {/* History Section */}
      {remarksHistory.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleHistory}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground w-full justify-between"
          >
            <div className="flex items-center gap-1">
              <History className="h-3 w-3" />
              <span>Remarks History</span>
              {remarksHistory.length > 1 && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1.5">
                  {remarksHistory.length}
                </Badge>
              )}
            </div>
            {showHistory ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>

          {/* History Items */}
          {showHistory && remarksHistory.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {remarksHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry, index) => (
                  <div key={entry.id} className="bg-muted/5 rounded-md p-3 border border-border/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere flex-1" 
                         style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                        {entry.text}
                      </p>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5 flex-shrink-0">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{format(new Date(entry.timestamp), 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
