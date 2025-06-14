
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  BarChart3
} from 'lucide-react';
import type { DuplicateReport } from '@/utils/advancedDuplicateDetection';

interface DuplicateAnalyticsViewProps {
  report: DuplicateReport;
  totalLeads: number;
  duplicateGroupsCount: number;
}

export const DuplicateAnalyticsView: React.FC<DuplicateAnalyticsViewProps> = ({
  report,
  totalLeads,
  duplicateGroupsCount
}) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Duplicate Detection Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mobile-optimized Match Types Breakdown */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Duplicates by Match Type</h4>
          <div className="space-y-2">
            {Object.entries(report.duplicatesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getMatchTypeIcon(type)}
                  <span className="font-medium text-sm truncate">{getMatchTypeLabel(type)}</span>
                </div>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{count} matches</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Mobile-optimized Quality Metrics */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Quality Metrics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-600">
                {((totalLeads - report.totalDuplicates) / totalLeads * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600">Unique Rate</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-red-600">
                {(report.totalDuplicates / totalLeads * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-red-600">Duplicate Rate</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-green-600">
                {duplicateGroupsCount > 0 ? (report.totalDuplicates / duplicateGroupsCount).toFixed(1) : '0'}
              </div>
              <div className="text-xs text-green-600">Avg per Group</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-purple-600">
                {report.qualityScore.toFixed(0)}
              </div>
              <div className="text-xs text-purple-600">Quality Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
