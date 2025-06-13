
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import type { LeadStatus } from '@/types/lead';

interface QuickStatusEditorProps {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
  className?: string;
  websiteUrl?: string;
  showWebsiteButton?: boolean;
  compact?: boolean;
}

export const QuickStatusEditor: React.FC<QuickStatusEditorProps> = ({
  status,
  onChange,
  className = "",
  websiteUrl,
  showWebsiteButton = false,
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

  const openWebsite = () => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (showWebsiteButton && compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Select value={status} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-auto min-w-[80px] p-0 border-none shadow-none bg-transparent">
              <Badge className={`${getStatusColor(status)} cursor-pointer text-xs px-2 py-1`}>
                {status}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {allStatuses.map((statusOption) => (
                <SelectItem key={statusOption} value={statusOption}>
                  <Badge className={`${getStatusColor(statusOption)} text-xs`}>
                    {statusOption}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {websiteUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={openWebsite}
            className="h-8 px-3 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <Globe className="h-4 w-4 mr-2" />
            View Website
          </Button>
        )}
      </div>
    );
  }

  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger className={`h-auto p-0 border-none shadow-none ${className}`}>
        <Badge className={`${getStatusColor(status)} cursor-pointer ${compact ? 'text-xs px-2 py-1' : ''}`}>
          {status}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {allStatuses.map((statusOption) => (
          <SelectItem key={statusOption} value={statusOption}>
            <Badge className={`${getStatusColor(statusOption)} ${compact ? 'text-xs' : ''}`}>
              {statusOption}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
