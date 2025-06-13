
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, Users } from 'lucide-react';
import type { Lead } from '@/types/lead';
import { getPhoneDuplicateCount, normalizePhoneNumber } from '@/utils/phoneDeduplication';

interface PhoneDuplicateIndicatorProps {
  lead: Lead;
  allLeads: Lead[];
  variant?: 'badge' | 'icon';
  size?: 'sm' | 'md';
}

export const PhoneDuplicateIndicator: React.FC<PhoneDuplicateIndicatorProps> = ({
  lead,
  allLeads,
  variant = 'badge',
  size = 'sm'
}) => {
  if (!lead.phone) return null;

  const duplicateCount = getPhoneDuplicateCount(lead.phone, allLeads);
  
  if (duplicateCount <= 1) return null;

  const normalizedPhone = normalizePhoneNumber(lead.phone);
  const duplicateLeads = allLeads.filter(l => 
    l.phone && normalizePhoneNumber(l.phone) === normalizedPhone
  );

  const tooltipContent = (
    <div className="space-y-2">
      <div className="font-medium">
        {duplicateCount} leads share this phone number:
      </div>
      <div className="text-xs space-y-1">
        {duplicateLeads.slice(0, 5).map(dup => (
          <div key={dup.id} className={`flex items-center gap-2 ${dup.id === lead.id ? 'font-medium text-primary' : ''}`}>
            <span>{dup.firstName} {dup.lastName}</span>
            <span className="text-muted-foreground">at {dup.company}</span>
          </div>
        ))}
        {duplicateLeads.length > 5 && (
          <div className="text-muted-foreground">
            +{duplicateLeads.length - 5} more...
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center justify-center">
              <Users className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-orange-500`} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`
              ${size === 'sm' ? 'text-xs px-1 py-0' : 'text-xs px-2 py-1'}
              bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 cursor-help
            `}
          >
            <Phone className={`${size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
            {duplicateCount}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
