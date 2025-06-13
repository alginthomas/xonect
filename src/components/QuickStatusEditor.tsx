
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { LeadStatus } from '@/types/lead';

interface QuickStatusEditorProps {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
  className?: string;
  websiteUrl?: string;
  onWebsiteClick?: () => void;
  compact?: boolean;
}

export const QuickStatusEditor: React.FC<QuickStatusEditorProps> = ({
  status,
  onChange,
  className = "",
  websiteUrl,
  onWebsiteClick,
  compact = false
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

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWebsiteClick) {
      onWebsiteClick();
    } else if (websiteUrl) {
      const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={status} onValueChange={onChange}>
        <SelectTrigger className="h-auto p-0 border-none shadow-none bg-transparent">
          <Badge className={`${getStatusColor(status)} cursor-pointer ${compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}`}>
            {status}
          </Badge>
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {allStatuses.map((statusOption) => (
            <SelectItem key={statusOption} value={statusOption} className="py-1">
              <Badge className={`${getStatusColor(statusOption)} ${compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}`}>
                {statusOption}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {websiteUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWebsiteClick}
          className={`shrink-0 ${compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} hover:bg-blue-50 text-blue-600`}
          title="View Website"
        >
          <ExternalLink className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
      )}
    </div>
  );
};
