
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Lead } from '@/types/lead';

interface BulkStatusUpdaterProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
  onUpdateStatus: (leadIds: string[], status: Lead['status']) => void;
}

export const BulkStatusUpdater: React.FC<BulkStatusUpdaterProps> = ({
  isOpen,
  onClose,
  leadIds,
  onUpdateStatus
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState<Lead['status'] | ''>('');

  const handleUpdateStatus = () => {
    if (selectedStatus) {
      onUpdateStatus(leadIds, selectedStatus);
      onClose();
      setSelectedStatus('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Update the status for {leadIds.length} selected leads.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedStatus} onValueChange={(value: Lead['status']) => setSelectedStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Opened">Opened</SelectItem>
              <SelectItem value="Clicked">Clicked</SelectItem>
              <SelectItem value="Replied">Replied</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Unqualified">Unqualified</SelectItem>
              <SelectItem value="Call Back">Call Back</SelectItem>
              <SelectItem value="Unresponsive">Unresponsive</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="Interested">Interested</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateStatus} disabled={!selectedStatus}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
