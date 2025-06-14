
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Check,
  Globe
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { copyEmailOnly } from '@/utils/emailUtils';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface CompactLeadCardProps {
  lead: Lead;
  categories: Category[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: LeadStatus) => void;
  onRemarksUpdate: (remarks: string) => void;
  onEmailClick: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
  selectionMode?: boolean;
}

export const CompactLeadCard: React.FC<CompactLeadCardProps> = ({
  lead,
  categories,
  isSelected,
  onSelect,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  selectionMode = false
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleCallAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const handleEmailAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyEmailOnly(lead.email);
  };

  const handleWebsiteAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.organizationWebsite) {
      let url = lead.organizationWebsite;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect(!isSelected);
    } else {
      onViewDetails();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectionMode) {
      const timer = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        onSelect(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <Card 
      className={`mb-4 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="p-6">
        {/* Header with Avatar and Info */}
        <div className="flex items-start gap-4 mb-6">
          {/* Selection indicator */}
          {selectionMode && (
            <div className="pt-1 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-border bg-background'
              }`}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </div>
          )}
          
          {/* Avatar */}
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl leading-tight mb-1 text-left">
              {lead.firstName} {lead.lastName}
            </h3>
            <div className="space-y-1 text-left">
              <p className="text-base text-muted-foreground font-medium">
                {lead.company} • {lead.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {lead.email}
              </p>
            </div>
          </div>
        </div>

        {/* Status and Website Row */}
        <div className="flex items-center justify-between mb-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-muted-foreground">Status:</span>
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
          </div>
          
          {lead.organizationWebsite && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-4 text-primary hover:bg-primary/10"
              onClick={handleWebsiteAction}
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">View Website</span>
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Call Button */}
          {lead.phone && (
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 h-14 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl"
              onClick={handleCallAction}
            >
              <Phone className="h-5 w-5 mr-3 text-primary" />
              <span className="text-base font-medium text-primary">Call</span>
            </Button>
          )}

          {/* Copy Email Button */}
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 h-14 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl"
            onClick={handleEmailAction}
          >
            <Mail className="h-5 w-5 mr-3 text-primary" />
            <span className="text-base font-medium text-primary">Copy Email</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
