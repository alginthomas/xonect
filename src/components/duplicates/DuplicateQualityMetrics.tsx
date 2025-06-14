
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Sparkles } from 'lucide-react';
import type { DuplicateReport } from '@/utils/advancedDuplicateDetection';

interface DuplicateQualityMetricsProps {
  report: DuplicateReport;
  totalLeads: number;
  duplicateGroupsCount: number;
}

export const DuplicateQualityMetrics: React.FC<DuplicateQualityMetricsProps> = ({
  report,
  totalLeads,
  duplicateGroupsCount
}) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Enhanced Duplicate Detection</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Advanced AI-powered duplicate detection
            </CardDescription>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-primary">{report.qualityScore.toFixed(0)}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Data Quality</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile-first stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{duplicateGroupsCount}</div>
            <div className="text-xs sm:text-sm text-blue-600">Duplicate Groups</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{report.totalDuplicates}</div>
            <div className="text-xs sm:text-sm text-red-600">Total Duplicates</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{totalLeads - report.totalDuplicates}</div>
            <div className="text-xs sm:text-sm text-green-600">Unique Leads</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{Object.keys(report.duplicatesByType).length}</div>
            <div className="text-xs sm:text-sm text-purple-600">Match Types</div>
          </div>
        </div>

        {/* Quality Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Data Quality Score</span>
            <span className={`font-medium ${report.qualityScore >= 80 ? 'text-green-600' : report.qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {report.qualityScore.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={report.qualityScore} 
            className="h-2"
          />
        </div>

        {/* Mobile-optimized Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-xs sm:text-sm">Recommendations:</h4>
            <div className="space-y-1">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
