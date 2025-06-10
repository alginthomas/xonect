
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Lead } from '@/types/lead';

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: Lead['status'];
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
}

export const LeadStatusSelect: React.FC<LeadStatusSelectProps> = ({
  leadId,
  currentStatus,
  onStatusChange,
}) => {
  const statusOptions: { value: Lead['status']; label: string; color: string }[] = [
    { value: 'New', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'Contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Opened', label: 'Opened', color: 'bg-green-100 text-green-800' },
    { value: 'Clicked', label: 'Clicked', color: 'bg-purple-100 text-purple-800' },
    { value: 'Replied', label: 'Replied', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'Qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { value: 'Unqualified', label: 'Unqualified', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(leadId, value as Lead['status'])}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
