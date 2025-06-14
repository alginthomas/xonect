
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
  MoreHorizontal
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
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
  const [showRemarks, setShowRemarks] = useState(false);
  const [showFullRemarks, setShowFullRemarks] = useState(false);

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

  const handleRemarksUpdateWrapper = (remarks: string, remarksHistory: import('@/types/lead').RemarkEntry[]) => {
    onRemarksUpdate(remarks);
  };

  // Truncate remarks for preview - much more aggressive truncation
  const remarksPreview = lead.remarks && lead.remarks.length > 60 
    ? lead.remarks.substring(0, 60) + '...' 
    : lead.remarks;

  const hasLongRemarks = lead.remarks && lead.remarks.length > 60;

  return (
    <Card 
      className={`w-full max-w-full mb-3 sm:mb-4 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="p-4 sm:p-5">
        {/* Header with Avatar and Info */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
          {/* Selection indicator */}
          {selectionMode && (
            <div className="pt-1 flex-shrink-0">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-border bg-background'
              }`}>
                {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
              </div>
            </div>
          )}
          
          {/* Avatar */}
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm sm:text-base lg:text-lg font-semibold bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight mb-1 text-left truncate">
              {lead.firstName} {lead.lastName}
            </h3>
            <div className="space-y-1 text-left">
              <p className="text-sm sm:text-base text-muted-foreground font-medium truncate">
                {lead.company} • {lead.title}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {lead.email}
              </p>
            </div>
          </div>
        </div>

        {/* Status and Website Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm sm:text-base font-medium text-muted-foreground flex-shrink-0">Status:</span>
            <div className="min-w-0">
              <QuickStatusEditor
                status={lead.status}
                onChange={onStatusChange}
              />
            </div>
          </div>
          
          {lead.organizationWebsite && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 text-primary hover:bg-primary/10 border border-primary/20 rounded-lg flex-shrink-0 w-full sm:w-auto justify-center"
              onClick={handleWebsiteAction}
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-xs sm:text-sm font-medium">View Website</span>
            </Button>
          )}
        </div>

        {/* Compact Remarks Section - Fixed height and better spacing */}
        <div className="mb-4 sm:mb-5" onClick={(e) => e.stopPropagation()}>
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
            <div className="flex items-center gap-1">
              {!showRemarks && hasLongRemarks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowFullRemarks(!showFullRemarks)}
                >
                  {showFullRemarks ? 'Less' : 'More'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setShowRemarks(!showRemarks)}
              >
                {showRemarks ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Remarks Preview - Fixed max height */}
          {lead.remarks && !showRemarks && (
            <div className="bg-muted/20 rounded-lg p-2 border border-border/20 max-h-16 overflow-hidden">
              <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap line-clamp-3">
                {showFullRemarks ? lead.remarks : remarksPreview}
              </p>
            </div>
          )}
          
          {/* Full Remarks Editor - Controlled height */}
          {showRemarks && (
            <div className="bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto">
              <QuickRemarksCell
                remarks={lead.remarks || ''}
                remarksHistory={lead.remarksHistory || []}
                onUpdate={handleRemarksUpdateWrapper}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Call Button */}
          {lead.phone && (
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 h-11 sm:h-12 lg:h-14 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl min-w-0"
              onClick={handleCallAction}
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium text-primary">Call</span>
            </Button>
          )}

          {/* Copy Email Button */}
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 h-11 sm:h-12 lg:h-14 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl min-w-0"
            onClick={handleEmailAction}
          >
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium text-primary">Copy Email</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
