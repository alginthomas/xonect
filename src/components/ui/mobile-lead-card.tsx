
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Linkedin, Globe, Mail, Phone, MapPin, Building } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface MobileLeadCardProps {
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

export const MobileLeadCard: React.FC<MobileLeadCardProps> = ({
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
    <Card className={`mobile-lead-card transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header with selection and name */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {showSelection && (
              <div className="mt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="rounded-full h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {lead.firstName} {lead.lastName}
              </h3>
              {lead.title && lead.company && (
                <p className="text-sm text-muted-foreground truncate">
                  {lead.title} at {lead.company}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${getStatusColor(lead.status)} text-xs font-medium`}>
            {lead.status}
          </Badge>
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

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-muted-foreground">{lead.email}</span>
          </div>
          
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">{lead.phone}</span>
            </div>
          )}

          {lead.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">{lead.location}</span>
            </div>
          )}

          {lead.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">{lead.company}</span>
            </div>
          )}
        </div>

        {/* Links Section */}
        {(lead.linkedin || lead.organizationWebsite) && (
          <div className="flex items-center gap-3 pt-2 border-t">
            {lead.linkedin && (
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="h-3 w-3" />
                <span>LinkedIn</span>
                <ExternalLink className="h-2 w-2" />
              </a>
            )}
            {lead.organizationWebsite && (
              <a
                href={lead.organizationWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Globe className="h-3 w-3" />
                <span>Website</span>
                <ExternalLink className="h-2 w-2" />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailClick}
            className="flex-1 text-xs h-8"
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-xs h-8"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
