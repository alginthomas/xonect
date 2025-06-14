
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle2, 
  Merge,
  Eye
} from 'lucide-react';
import { findAdvancedDuplicates, mergeLeads, type DuplicateMatch } from '@/utils/advancedDuplicateDetection';
import type { Lead } from '@/types/lead';

interface DuplicateGroupCardProps {
  group: Lead[];
  groupIndex: number;
  selectedDuplicates: Set<string>;
  onSelectDuplicate: (leadId: string, checked: boolean) => void;
  onMergeGroup: (group: Lead[]) => Promise<void>;
}

export const DuplicateGroupCard: React.FC<DuplicateGroupCardProps> = ({
  group,
  groupIndex,
  selectedDuplicates,
  onSelectDuplicate,
  onMergeGroup
}) => {
  const [showMergePreview, setShowMergePreview] = useState(false);
  
  const primaryLead = mergeLeads(group);
  const matches = findAdvancedDuplicates(group[0], group.slice(1));

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
      case 'fuzzy_email':
        return <Mail className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'phone':
        return <Phone className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'name_company':
      case 'fuzzy_name':
        return <Users className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Building className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Exact Email';
      case 'fuzzy_email':
        return 'Similar Email';
      case 'phone':
        return 'Phone Number';
      case 'name_company':
        return 'Name + Company';
      case 'fuzzy_name':
        return 'Similar Name';
      default:
        return 'Other';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <Card className="border-l-4 border-l-yellow-400">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Mobile-first header layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                Group {groupIndex + 1}
              </Badge>
              <span className="font-medium text-sm">{group.length} duplicates</span>
            </div>
            {matches[0] && (
              <Badge className={`${getConfidenceColor(matches[0].confidence)} border text-xs flex items-center gap-1`}>
                {getMatchTypeIcon(matches[0].matchType)}
                <span className="hidden xs:inline">{getMatchTypeLabel(matches[0].matchType)}</span>
                <span className="font-mono">
                  {(matches[0].confidence * 100).toFixed(0)}%
                </span>
              </Badge>
            )}
          </div>
          
          {/* Mobile-optimized action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMergePreview(!showMergePreview)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Preview Merge
            </Button>
            <Button
              size="sm"
              onClick={() => onMergeGroup(group)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
            >
              <Merge className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Auto Merge
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Mobile-optimized Merge Preview */}
        {showMergePreview && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Merged Result Preview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-medium">Name:</span>
                <div className="truncate">{primaryLead.firstName} {primaryLead.lastName}</div>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <div className="truncate">{primaryLead.email}</div>
              </div>
              <div>
                <span className="font-medium">Company:</span>
                <div className="truncate">{primaryLead.company}</div>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <div className="truncate">{primaryLead.phone || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile-optimized Individual Duplicates */}
        <div className="space-y-2">
          {group.map((lead, index) => (
            <div key={lead.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={selectedDuplicates.has(lead.id)}
                onChange={(e) => onSelectDuplicate(lead.id, e.target.checked)}
                className="rounded mt-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {/* Mobile-first lead info layout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{lead.firstName} {lead.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{lead.title}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                        {index === 0 ? 'Primary' : `Dup ${index}`}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {lead.completenessScore}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs truncate">{lead.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{lead.phone || 'No phone'}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs truncate">{lead.company}</div>
                      <div className="text-xs text-muted-foreground">{lead.industry || 'No industry'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
