
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { RemarkEntry } from '@/types/lead';

interface SimpleRemarksListProps {
  remarks: string;
  remarksHistory?: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  className?: string;
}

export const SimpleRemarksList: React.FC<SimpleRemarksListProps> = ({
  remarks,
  remarksHistory = [],
  onUpdate,
  className = "",
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newRemarkValue, setNewRemarkValue] = useState('');

  // Sort remarks by timestamp (newest first)
  const sortedRemarks = [...remarksHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleEdit = (entry: RemarkEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.text);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editValue.trim()) return;

    const updatedHistory = remarksHistory.map(entry =>
      entry.id === editingId
        ? { ...entry, text: editValue.trim() }
        : entry
    );

    // Update the current remarks if we're editing the latest entry
    const latestEntry = sortedRemarks[0];
    const newRemarks = latestEntry?.id === editingId ? editValue.trim() : remarks;

    onUpdate(newRemarks, updatedHistory);
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (entryId: string) => {
    const updatedHistory = remarksHistory.filter(entry => entry.id !== entryId);
    
    // If we deleted the latest entry, update current remarks
    const latestEntry = sortedRemarks[0];
    let newRemarks = remarks;
    
    if (latestEntry?.id === entryId) {
      const newLatest = updatedHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      newRemarks = newLatest?.text || '';
    }

    onUpdate(newRemarks, updatedHistory);
  };

  const handleAddNew = () => {
    if (!newRemarkValue.trim()) return;

    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: newRemarkValue.trim(),
      timestamp: new Date()
    };

    const updatedHistory = [...remarksHistory, newEntry];
    onUpdate(newRemarkValue.trim(), updatedHistory);
    setNewRemarkValue('');
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewRemarkValue('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Remarks List */}
      {sortedRemarks.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedRemarks.map((entry) => (
            <div key={entry.id} className="p-3 bg-muted/20 rounded-lg border">
              {editingId === entry.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="min-h-[60px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1 whitespace-pre-wrap break-words">
                      {entry.text}
                    </p>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy • HH:mm')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Remark */}
      {isAdding ? (
        <div className="space-y-2 p-3 bg-muted/10 rounded-lg border border-dashed">
          <Textarea
            value={newRemarkValue}
            onChange={(e) => setNewRemarkValue(e.target.value)}
            placeholder="Add a new remark..."
            className="min-h-[60px] resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" onClick={handleAddNew}>
              Add Remark
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelAdd}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add remark
        </Button>
      )}

      {/* Empty State */}
      {sortedRemarks.length === 0 && !isAdding && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No remarks yet</p>
        </div>
      )}
    </div>
  );
};
