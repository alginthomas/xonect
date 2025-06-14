
import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Mail, Phone, Merge } from 'lucide-react';
import { findAdvancedDuplicates, type DuplicateMatch } from '@/utils/advancedDuplicateDetection';
import type { Lead } from '@/types/lead';

interface RealTimeDuplicateDetectorProps {
  formData: Partial<Lead>;
  existingLeads: Lead[];
  onShowDuplicates?: (matches: DuplicateMatch[]) => void;
  onMergeSuggestion?: (suggestedLead: Lead) => void;
  className?: string;
}

export const RealTimeDuplicateDetector: React.FC<RealTimeDuplicateDetectorProps> = ({
  formData,
  existingLeads,
  onShowDuplicates,
  onMergeSuggestion,
  className = ''
}) => {
  const [showMatches, setShowMatches] = useState(false);

  // Debounced duplicate detection
  const duplicateMatches = useMemo(() => {
    if (!formData.email && !formData.phone && !formData.firstName) {
      return [];
    }

    return findAdvancedDuplicates(formData, existingLeads, {
      emailThreshold: 0.85,
      nameThreshold: 0.8,
      phoneThreshold: 0.9,
      includeNameCompanyMatch: true
    });
  }, [formData, existingLeads]);

  useEffect(() => {
    if (duplicateMatches.length > 0) {
      onShowDuplicates?.(duplicateMatches);
    }
  }, [duplicateMatches, onShowDuplicates]);

  if (duplicateMatches.length === 0) {
    return null;
  }

  const highConfidenceMatches = duplicateMatches.filter(m => m.confidence >= 0.9);
  const mediumConfidenceMatches = duplicateMatches.filter(m => m.confidence >= 0.7 && m.confidence < 0.9);
  const lowConfidenceMatches = duplicateMatches.filter(m => m.confidence < 0.7);

  const getMatchIcon = (type: string) => {
    switch (type) {
      case 'email':
      case 'fuzzy_email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'name_company':
      case 'fuzzy_name':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    if (highConfidenceMatches.length > 0) return 'destructive';
    if (mediumConfidenceMatches.length > 0) return 'default';
    return 'default';
  };

  const getAlertTitle = () => {
    if (highConfidenceMatches.length > 0) {
      return 'Likely Duplicate Detected';
    }
    if (mediumConfidenceMatches.length > 0) {
      return 'Possible Duplicate Found';
    }
    return 'Similar Lead Found';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert variant={getAlertVariant()} className="border-l-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div className="font-medium">{getAlertTitle()}</div>
            
            <div className="text-sm">
              Found {duplicateMatches.length} potential match{duplicateMatches.length > 1 ? 'es' : ''} in your database.
              {highConfidenceMatches.length > 0 && (
                <span className="block text-red-600 font-medium mt-1">
                  {highConfidenceMatches.length} high confidence match{highConfidenceMatches.length > 1 ? 'es' : ''} detected.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMatches(!showMatches)}
              >
                {showMatches ? 'Hide' : 'Show'} Details
              </Button>
              
              {highConfidenceMatches.length > 0 && onMergeSuggestion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMergeSuggestion(highConfidenceMatches[0].existingLead)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Merge className="h-3 w-3 mr-1" />
                  Suggest Merge
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {showMatches && (
        <div className="space-y-2">
          {duplicateMatches.map((match, index) => (
            <div
              key={`${match.existingLead.id}-${index}`}
              className="flex items-center justify-between p-3 bg-muted rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1">
                  {getMatchIcon(match.matchType)}
                  <Badge 
                    variant={match.confidence >= 0.9 ? 'destructive' : match.confidence >= 0.7 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {(match.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {match.existingLead.firstName} {match.existingLead.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {match.existingLead.email} • {match.existingLead.company}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Match: {match.matchType.replace('_', ' ')} 
                    {match.existingLead.phone && ` • ${match.existingLead.phone}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {match.existingLead.status}
                </Badge>
                {onMergeSuggestion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMergeSuggestion(match.existingLead)}
                    className="h-8 w-8 p-0"
                  >
                    <Merge className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
