
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/types/lead';

interface QuickStatusEditorProps {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
  className?: string;
}

export const QuickStatusEditor: React.FC<QuickStatusEditorProps> = ({
  status,
  onChange,
  className = ""
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Opened': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'Clicked': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'Replied': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      case 'Qualified': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Unqualified': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Call Back': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Unresponsive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'Not Interested': return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      case 'Interested': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const allStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
    'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
    'Not Interested', 'Interested'
  ];

  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger className={`h-auto p-0 border-none shadow-none ${className}`}>
        <Badge className={`${getStatusColor(status)} cursor-pointer`}>
          {status}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {allStatuses.map((statusOption) => (
          <SelectItem key={statusOption} value={statusOption}>
            <Badge className={getStatusColor(statusOption)}>
              {statusOption}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
