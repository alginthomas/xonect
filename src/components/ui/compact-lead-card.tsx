
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Linkedin, Globe, Mail, Phone, MapPin, Building } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface CompactLeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onSendEmail: () => void;
  showSelection?: boolean;
  categoryName?: string;
  categoryColor?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Qualified':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Unqualified':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const CompactLeadCard: React.FC<CompactLeadCardProps> = ({
  lead,
  isSelected,
  onSelect,
  onEdit,
  onSendEmail,
  showSelection = false,
  categoryName,
  categoryColor,
}) => {
  const handleEmailClick = () => {
    window.location.href = `mailto:${lead.email}`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardContent className="p-3 space-y-2">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="rounded-full h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {lead.firstName} {lead.lastName}
              </h4>
            </div>
          </div>
          <Badge className={`${getStatusColor(lead.status)} text-xs`}>
            {lead.status}
          </Badge>
        </div>

        {/* Company and Title */}
        {(lead.title || lead.company) && (
          <div className="text-xs text-muted-foreground truncate">
            {lead.title && lead.company ? `${lead.title} at ${lead.company}` : lead.title || lead.company}
          </div>
        )}

        {/* Contact Info */}
        <div className="text-xs text-muted-foreground truncate">
          {lead.email}
        </div>

        {/* Category */}
        {categoryName && (
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: categoryColor, color: categoryColor }}
          >
            {categoryName}
          </Badge>
        )}

        {/* Links and Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            {lead.linkedin && (
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="h-3 w-3" />
              </a>
            )}
            {lead.organizationWebsite && (
              <a
                href={lead.organizationWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Globe className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEmailClick}
              className="h-6 w-6 p-0"
            >
              <Mail className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-6 w-6 p-0"
            >
              <span className="text-xs">✏️</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
