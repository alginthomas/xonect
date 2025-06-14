
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
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editValue.trim()) return;

    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: editValue.trim(),
      timestamp: new Date()
    };

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

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
          placeholder="Add your remarks..."
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Remark */}
      <div className="relative group">
        {remarks ? (
          <div className="bg-muted/20 rounded-md p-2 border border-border/20 hover:bg-muted/30 transition-colors">
            <p className="text-sm mb-1">{remarks}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {remarksHistory.length > 0 && format(remarksHistory[remarksHistory.length - 1].timestamp, 'MMM dd')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-5 px-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-full bg-muted/10 border border-dashed border-border/30 rounded-md p-2 text-left hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span className="text-sm">Add remarks...</span>
            </div>
          </button>
        )}
      </div>

      {/* History Toggle */}
      {remarksHistory.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowHistory(!showHistory);
          }}
          className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showHistory ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              History
              <Badge variant="secondary" className="ml-1 text-xs h-3 px-1">
                {remarksHistory.length - 1}
              </Badge>
            </>
          )}
        </Button>
      )}

      {/* History */}
      {showHistory && remarksHistory.length > 1 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {remarksHistory.slice(0, -1).reverse().map((entry) => (
            <div key={entry.id} className="bg-muted/10 rounded-md p-2 border border-border/10">
              <p className="text-xs mb-1">{entry.text}</p>
              <div className="text-xs text-muted-foreground">
                {format(entry.timestamp, 'MMM dd, HH:mm')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
