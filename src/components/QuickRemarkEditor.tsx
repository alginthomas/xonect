
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, Clock, User, Phone } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface QuickRemarkEditorProps {
  lead: Lead;
  onUpdateRemarks: (leadId: string, remarks: string) => void;
  className?: string;
}

const QUICK_TEMPLATES = [
  "Follow up in 1 week",
  "Interested - needs more info",
  "Not responsive",
  "Potential customer",
  "Wrong contact",
  "Budget constraints"
];

export const QuickRemarkEditor: React.FC<QuickRemarkEditorProps> = ({
  lead,
  onUpdateRemarks,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [remarks, setRemarks] = useState(lead.remarks || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateRemarks(lead.id, remarks.trim());
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setRemarks(lead.remarks || '');
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTemplateSelect = (template: string) => {
    setRemarks(template);
    onUpdateRemarks(lead.id, template);
    setIsOpen(false);
  };

  const hasRemarks = lead.remarks && lead.remarks.trim().length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${hasRemarks ? "text-primary" : ""} ${className}`}
        >
          <MessageSquare className="h-4 w-4" />
          {hasRemarks && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Quick Remark</h4>
            <div className="text-xs text-muted-foreground">
              {lead.firstName} {lead.lastName}
            </div>
          </div>

          {hasRemarks && !isEditing && (
            <div className="bg-muted/50 p-2 rounded-md text-sm">
              <div className="font-medium text-xs text-muted-foreground mb-1">Current remark:</div>
              <div>{lead.remarks}</div>
            </div>
          )}

          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add your remark..."
                  className="text-sm"
                />
                <div className="flex gap-1 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-7 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="h-7 px-2"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full text-left justify-start h-8"
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                {hasRemarks ? "Edit remark" : "Add remark"}
              </Button>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Quick templates:</div>
              <div className="grid grid-cols-1 gap-1">
                {QUICK_TEMPLATES.map((template) => (
                  <Button
                    key={template}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="justify-start h-7 text-xs px-2"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
