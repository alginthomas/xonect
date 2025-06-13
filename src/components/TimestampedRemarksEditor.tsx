
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Save, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { RemarkEntry } from '@/types/lead';

interface TimestampedRemarksEditorProps {
  remarks?: string;
  remarksHistory?: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  className?: string;
}

export const TimestampedRemarksEditor: React.FC<TimestampedRemarksEditorProps> = ({
  remarks,
  remarksHistory = [],
  onUpdate,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRemark, setNewRemark] = useState('');

  const handleSave = () => {
    if (!newRemark.trim()) return;

    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: newRemark.trim(),
      timestamp: new Date()
    };

    const updatedHistory = [...remarksHistory, newEntry];
    const updatedRemarks = newRemark.trim();

    onUpdate(updatedRemarks, updatedHistory);
    setNewRemark('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewRemark('');
    setIsEditing(false);
  };

  return (
    <div className={className}>
      {/* Current Remark Display */}
      {remarks && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Current Remark:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 px-2 text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Add New
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{remarks}</p>
        </div>
      )}

      {/* Add New Remark */}
      {!remarks && !isEditing && (
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="w-full justify-start mb-3"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Remark
        </Button>
      )}

      {/* Editing Interface */}
      {isEditing && (
        <div className="space-y-3 mb-3">
          <Textarea
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            placeholder="Add your remark..."
            className="min-h-[80px] text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1 justify-center">
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 justify-center">
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Remarks History */}
      {remarksHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Remarks History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {remarksHistory.map((entry, index) => (
              <div key={entry.id}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(entry.timestamp, 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm">{entry.text}</p>
                </div>
                {index < remarksHistory.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
