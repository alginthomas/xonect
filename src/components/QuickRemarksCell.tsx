
import React, { useState } from 'react';
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
      <div className={`space-y-3 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[80px] text-sm resize-none"
          placeholder="Enter remarks..."
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="h-7 px-3 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-3 text-xs">
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
          <div className="bg-muted/30 rounded-md p-3 border border-border/30">
            <p className="text-sm leading-relaxed mb-2">{remarks}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {remarksHistory.length > 0 && format(remarksHistory[remarksHistory.length - 1].timestamp, 'MMM dd, HH:mm')}
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
            className="w-full bg-muted/20 border border-dashed border-border/40 rounded-md p-3 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
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
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {showHistory ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide history
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show history
              <Badge variant="secondary" className="ml-2 text-xs h-4">
                {remarksHistory.length - 1}
              </Badge>
            </>
          )}
        </Button>
      )}

      {/* History */}
      {showHistory && remarksHistory.length > 1 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {remarksHistory.slice(0, -1).reverse().map((entry, index) => (
            <div key={entry.id} className="bg-muted/10 rounded-md p-2 border border-border/20">
              <p className="text-xs text-foreground mb-1">{entry.text}</p>
              <div className="text-xs text-muted-foreground">
                {format(entry.timestamp, 'MMM dd, yyyy • HH:mm')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
