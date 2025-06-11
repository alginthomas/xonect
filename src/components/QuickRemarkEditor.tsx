
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, Clock } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface QuickRemarkEditorProps {
  lead: Lead;
  onUpdateRemarks: (leadId: string, remarks: string) => void;
  isInline?: boolean;
}

const QUICK_TEMPLATES = [
  "Follow up in 1 week",
  "Interested - needs more info",
  "Not responsive",
  "Hot lead - priority contact",
  "Budget concerns",
  "Decision maker identified",
  "Send proposal",
  "Schedule call"
];

export const QuickRemarkEditor: React.FC<QuickRemarkEditorProps> = ({
  lead,
  onUpdateRemarks,
  isInline = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRemarks, setTempRemarks] = useState(lead.remarks || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (tempRemarks !== (lead.remarks || '')) {
      setIsSaving(true);
      try {
        await onUpdateRemarks(lead.id, tempRemarks);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempRemarks(lead.remarks || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTemplateSelect = (template: string) => {
    const newRemarks = tempRemarks ? `${tempRemarks}. ${template}` : template;
    setTempRemarks(newRemarks);
    if (isInline) {
      onUpdateRemarks(lead.id, newRemarks);
      setIsEditing(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (isInline) {
    return (
      <div className="group relative">
        {!isEditing ? (
          <div 
            className="flex items-center gap-2 cursor-pointer min-h-[32px] py-1 px-2 rounded hover:bg-muted/50 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {lead.remarks ? (
              <>
                <MessageSquare className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {truncateText(lead.remarks)}
                </span>
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-xs text-muted-foreground/70 italic">
                  Click to add remark
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={tempRemarks}
              onChange={(e) => setTempRemarks(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              placeholder="Add a quick remark..."
              className="h-7 text-xs"
              disabled={isSaving}
            />
            {isSaving && <Clock className="h-3 w-3 text-muted-foreground animate-spin" />}
          </div>
        )}
        
        {isEditing && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                <MessageSquare className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2" align="start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Templates:</p>
                {QUICK_TEMPLATES.map((template, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 text-xs"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  // Popover version for the existing table actions
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`h-8 w-8 p-0 ${lead.remarks ? "text-primary" : ""}`}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Remark</p>
            <Input
              value={tempRemarks}
              onChange={(e) => setTempRemarks(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a remark..."
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Quick Templates:</p>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_TEMPLATES.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 justify-start"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Clock className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
