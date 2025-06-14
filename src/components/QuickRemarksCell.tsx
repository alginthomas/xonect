
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, X, Edit3, Clock, History } from 'lucide-react';
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px] text-sm resize-none"
          placeholder="Add your remarks..."
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={handleSave} className="h-8 px-3 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-3 text-xs">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current/Latest Remark */}
      <div 
        className="cursor-pointer hover:bg-muted/50 rounded-lg p-3 group border border-border/40"
        onClick={handleClick}
      >
        {remarks ? (
          <div className="flex items-start gap-3">
            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">
                {remarks}
              </p>
              {remarksHistory.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(remarksHistory[remarksHistory.length - 1].timestamp, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
            <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Add remarks...</span>
            <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        )}
      </div>

      {/* Remarks History */}
      {remarksHistory.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Previous Remarks ({remarksHistory.length - 1})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(!showHistory);
              }}
            >
              {showHistory ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showHistory && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {remarksHistory.slice(0, -1).reverse().map((entry, index) => (
                <div key={entry.id} className="p-3 bg-muted/20 rounded-lg border border-border/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(entry.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{remarksHistory.length - index - 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
