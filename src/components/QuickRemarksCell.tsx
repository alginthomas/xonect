
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, X, Edit3, Clock } from 'lucide-react';
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-20 text-xs"
          placeholder="Add remarks..."
          autoFocus
        />
        <div className="flex gap-1">
          <Button size="sm" variant="default" onClick={handleSave} className="h-6 px-2 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2 text-xs">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-muted/50 rounded p-1 group ${className}`}
      onClick={handleClick}
    >
      {remarks ? (
        <div className="flex items-start gap-2">
          <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {remarks}
            </p>
            {remarksHistory.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-2 w-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {format(remarksHistory[remarksHistory.length - 1].timestamp, 'MMM dd, HH:mm')}
                </span>
              </div>
            )}
          </div>
          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span className="text-xs">Add remarks...</span>
          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};
