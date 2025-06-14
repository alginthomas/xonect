
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, X, Edit3, Clock, History, ChevronDown, ChevronUp } from 'lucide-react';
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

  console.log('QuickRemarksCell props:', { remarks, remarksHistory: remarksHistory.length });

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {remarks ? 'Edit Remarks' : 'Add Remarks'}
            </span>
          </div>
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] text-sm resize-none"
            placeholder="Enter your remarks..."
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={handleSave} className="h-8 px-3 text-xs">
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
      {/* Current/Latest Remark */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Current Remarks</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={remarks ? handleEditClick : handleAddClick}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {remarks ? 'Edit' : 'Add'}
          </Button>
        </div>
        
        <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
          {remarks ? (
            <div className="space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                {remarks}
              </p>
              {remarksHistory.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last updated: {format(remarksHistory[remarksHistory.length - 1].timestamp, 'MMM dd, yyyy • HH:mm')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">No remarks added yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Remarks History */}
      {remarksHistory.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Previous Remarks
              </span>
              <Badge variant="secondary" className="text-xs h-5">
                {remarksHistory.length - 1}
              </Badge>
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
              {showHistory ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
          
          {showHistory && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {remarksHistory.slice(0, -1).reverse().map((entry, index) => (
                <div key={entry.id} className="p-3 bg-muted/10 rounded-lg border border-border/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(entry.timestamp, 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                    <Badge variant="outline" className="text-xs h-4">
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
      
      {/* Show Single Entry History */}
      {remarksHistory.length === 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Remarks History
            </span>
            <Badge variant="secondary" className="text-xs h-5">
              1 entry
            </Badge>
          </div>
          <div className="p-3 bg-muted/10 rounded-lg border border-border/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3" />
              <span>{format(remarksHistory[0].timestamp, 'MMM dd, yyyy • HH:mm')}</span>
              <Badge variant="outline" className="text-xs h-4 ml-auto">
                #1
              </Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{remarksHistory[0].text}</p>
          </div>
        </div>
      )}
    </div>
  );
};
