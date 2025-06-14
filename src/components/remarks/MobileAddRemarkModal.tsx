
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, X } from 'lucide-react';
import type { RemarkEntry } from '@/types/lead';

interface MobileAddRemarkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (text: string) => void;
}

export const MobileAddRemarkModal: React.FC<MobileAddRemarkModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [remarkText, setRemarkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setRemarkText('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = remarkText.trim();
    if (trimmed) {
      onSave(trimmed);
      setRemarkText('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setRemarkText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bottom-0 top-auto translate-y-0 slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full rounded-t-3xl rounded-b-none border-0 p-6 max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Add New Remark
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Textarea
            ref={textareaRef}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Enter your remark..."
            className="min-h-[120px] text-base border-2 border-border/20 focus:border-primary/40 rounded-xl resize-none"
            rows={5}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 text-base rounded-xl border-2"
              onClick={handleCancel}
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-base rounded-xl"
              onClick={handleSave}
              disabled={!remarkText.trim()}
            >
              <Save className="h-5 w-5 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Swipe indicator */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
