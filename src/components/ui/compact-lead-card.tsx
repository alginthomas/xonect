
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Check,
  Globe,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Linkedin
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { MobileRemarksButtons } from '@/components/remarks/MobileRemarksButtons';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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

  const handleLinkedInAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.linkedin) {
      let url = lead.linkedin;
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

  const handleRemarksUpdateWrapper = (remarks: string, remarksHistory: import('@/types/lead').RemarkEntry[]) => {
    onRemarksUpdate(remarks);
  };

  return (
    <Card 
      className={`w-full max-w-full mb-3 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="p-3 sm:p-4">
        {/* Header with Avatar and Info - Optimized for small screens */}
        <div className="flex items-start gap-3 mb-4">
          {/* Selection indicator */}
          {selectionMode && (
            <div className="pt-1 flex-shrink-0">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-border bg-background'
              }`}>
                {isSelected && <Check className="h-3 w-3 sm:h-3 sm:w-3" />}
              </div>
            </div>
          )}
          
          {/* Avatar - Smaller on mobile */}
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm sm:text-base font-semibold bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Lead info - Better text sizing for small screens */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg leading-tight mb-1 text-left truncate">
              {lead.firstName} {lead.lastName}
            </h3>
            <div className="space-y-0.5 text-left">
              <p className="text-sm sm:text-base text-muted-foreground font-medium truncate">
                {lead.company}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {lead.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {lead.email}
              </p>
            </div>
          </div>
        </div>

        {/* Status Row - Compact for mobile */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">Status:</span>
          <div className="min-w-0">
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
          </div>
        </div>

        {/* Mobile Remarks Section */}
        {isMobile && (
          <div className="mb-3 sm:mb-4" onClick={(e) => e.stopPropagation()}>
            <MobileRemarksButtons
              remarks={lead.remarks || ''}
              remarksHistory={lead.remarksHistory || []}
              onUpdate={handleRemarksUpdateWrapper}
              className="w-full"
            />
          </div>
        )}

        {/* Desktop Remarks Section */}
        {!isMobile && (
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Remarks</span>
                {lead.remarksHistory && lead.remarksHistory.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {lead.remarksHistory.length}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto">
              <QuickRemarksCell
                remarks={lead.remarks || ''}
                remarksHistory={lead.remarksHistory || []}
                onUpdate={handleRemarksUpdateWrapper}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Website and LinkedIn Buttons - More compact on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Website Button */}
          {lead.organizationWebsite && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 sm:h-12 py-2 sm:py-3 text-xs sm:text-sm text-foreground hover:bg-muted/50 border border-border/30 rounded-lg font-medium"
              onClick={handleWebsiteAction}
            >
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Website</span>
            </Button>
          )}

          {/* LinkedIn Button */}
          {lead.linkedin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 sm:h-12 py-2 sm:py-3 text-xs sm:text-sm text-foreground hover:bg-muted/50 border border-border/30 rounded-lg font-medium"
              onClick={handleLinkedInAction}
            >
              <Linkedin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">LinkedIn</span>
            </Button>
          )}
        </div>

        {/* Action Buttons Row - More compact spacing on mobile */}
        <div className="flex gap-2 sm:gap-3">
          {/* Call Button */}
          {lead.phone && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-10 sm:h-12 py-2 sm:py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg min-w-0 font-medium"
              onClick={handleCallAction}
            >
              <Phone className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-primary truncate">Call</span>
            </Button>
          )}

          {/* Copy Email Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-10 sm:h-12 py-2 sm:py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg min-w-0 font-medium"
            onClick={handleEmailAction}
          >
            <Mail className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-primary truncate">Email</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
