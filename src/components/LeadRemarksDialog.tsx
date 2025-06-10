
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface LeadRemarksDialogProps {
  lead: Lead;
  onUpdateRemarks: (leadId: string, remarks: string) => void;
  children?: React.ReactNode;
}

export const LeadRemarksDialog: React.FC<LeadRemarksDialogProps> = ({
  lead,
  onUpdateRemarks,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [remarks, setRemarks] = useState(lead.remarks || '');

  const handleSave = () => {
    onUpdateRemarks(lead.id, remarks);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setRemarks(lead.remarks || '');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lead Remarks</DialogTitle>
          <DialogDescription>
            Add custom remarks and notes for {lead.firstName} {lead.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Add your remarks, notes, or follow-up actions..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Remarks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
