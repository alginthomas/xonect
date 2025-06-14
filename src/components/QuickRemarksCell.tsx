
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, X, Edit3, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Helper function to ensure we have a proper remarks history structure
  const getNormalizedRemarksHistory = (): RemarkEntry[] => {
    // If we have current remarks but no history, create a legacy entry
    if (remarks && (!remarksHistory || remarksHistory.length === 0)) {
      return [{
        id: 'legacy-' + crypto.randomUUID(),
        text: remarks,
        timestamp: new Date() // Use current date as fallback for legacy remarks
      }];
    }

    // If we have current remarks and history, ensure the current remark is in history
    if (remarks && remarksHistory && remarksHistory.length > 0) {
      const latestEntry = remarksHistory[remarksHistory.length - 1];
      if (latestEntry?.text !== remarks) {
        // Current remarks don't match latest history entry, add it
        return [...remarksHistory, {
          id: 'current-' + crypto.randomUUID(),
          text: remarks,
          timestamp: new Date()
        }];
      }
    }

    return remarksHistory || [];
  };

  const handleSave = () => {
    if (!editValue.trim()) return;

    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: editValue.trim(),
      timestamp: new Date()
    };

    const normalizedHistory = getNormalizedRemarksHistory();
    const updatedHistory = [...normalizedHistory, newEntry];
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

  // Get the most recent timestamp from normalized history
  const getMostRecentTimestamp = () => {
    const normalizedHistory = getNormalizedRemarksHistory();
    if (normalizedHistory.length === 0) return null;
    const sortedHistory = [...normalizedHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedHistory[0].timestamp;
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[60px] text-sm resize-none border-primary/20 focus:border-primary/40"
          placeholder="Add your remarks..."
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

  const normalizedHistory = getNormalizedRemarksHistory();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Remark */}
      <div className="relative group">
        {remarks ? (
          <div className="bg-muted/10 rounded-lg p-3 border border-border/20 hover:bg-muted/20 transition-colors">
            <p className="text-sm mb-2 leading-relaxed break-words">{remarks}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getMostRecentTimestamp() && format(new Date(getMostRecentTimestamp()!), 'MMM dd, yyyy • HH:mm')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-full bg-muted/5 border border-dashed border-border/30 rounded-lg p-3 text-left hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Add remarks...</span>
            </div>
          </button>
        )}
      </div>

      {/* History Toggle */}
      {normalizedHistory.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowHistory(!showHistory);
          }}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {showHistory ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide History
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show History
              <Badge variant="secondary" className="ml-2 text-xs h-4 px-1.5">
                {normalizedHistory.length - 1}
              </Badge>
            </>
          )}
        </Button>
      )}

      {/* History */}
      {showHistory && normalizedHistory.length > 1 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground px-1">Previous Remarks</div>
          {normalizedHistory
            .slice(0, -1)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry) => (
              <div key={entry.id} className="bg-muted/5 rounded-md p-2 border border-border/10">
                <p className="text-xs mb-1 leading-relaxed break-words">{entry.text}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {format(new Date(entry.timestamp), 'MMM dd, yyyy • HH:mm')}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
