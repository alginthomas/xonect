
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
      case 'Qualified': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Unqualified': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger className={`h-auto p-0 border-none shadow-none ${className}`}>
        <Badge className={`${getStatusColor(status)} cursor-pointer`}>
          {status}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="New">
          <Badge className="bg-blue-100 text-blue-800">New</Badge>
        </SelectItem>
        <SelectItem value="Contacted">
          <Badge className="bg-yellow-100 text-yellow-800">Contacted</Badge>
        </SelectItem>
        <SelectItem value="Qualified">
          <Badge className="bg-green-100 text-green-800">Qualified</Badge>
        </SelectItem>
        <SelectItem value="Unqualified">
          <Badge className="bg-red-100 text-red-800">Unqualified</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
