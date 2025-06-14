
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, Database, TrendingDown, Archive, Lightbulb } from 'lucide-react';
import { format, differenceInDays, subMonths } from 'date-fns';
import type { ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';

interface CleanupSuggestionsProps {
  importBatches: ImportBatch[];
  leads: Lead[];
  onApplySuggestion: (suggestion: CleanupSuggestion) => void;
  className?: string;
}

interface CleanupSuggestion {
  id: string;
  type: 'old_batches' | 'low_performance' | 'duplicate_batches' | 'unused_batches';
  title: string;
  description: string;
  batchIds: string[];
  severity: 'low' | 'medium' | 'high';
  estimatedSavings: {
    storage: string;
    leadCount: number;
  };
  action: string;
}

export const CleanupSuggestions: React.FC<CleanupSuggestionsProps> = ({
  importBatches,
  leads,
  onApplySuggestion,
  className = ""
}) => {
  const suggestions = useMemo(() => {
    const suggestions: CleanupSuggestion[] = [];
    const now = new Date();
    
    // Find old batches (>6 months)
    const oldBatches = importBatches.filter(batch => 
      differenceInDays(now, new Date(batch.createdAt)) > 180
    );
    
    if (oldBatches.length > 0) {
      const totalLeads = oldBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
      suggestions.push({
        id: 'old_batches',
        type: 'old_batches',
        title: 'Archive Old Import Batches',
        description: `${oldBatches.length} batches are older than 6 months and may no longer be actively used.`,
        batchIds: oldBatches.map(b => b.id),
        severity: 'medium',
        estimatedSavings: {
          storage: `${Math.round(totalLeads * 0.5)}KB`,
          leadCount: totalLeads
        },
        action: 'Archive batches'
      });
    }

    // Find low-performing batches (low success rate)
    const lowPerformanceBatches = importBatches.filter(batch => {
      const successRate = batch.totalLeads > 0 
        ? (batch.successfulImports || 0) / batch.totalLeads * 100 
        : 0;
      return successRate < 20 && batch.totalLeads > 10;
    });

    if (lowPerformanceBatches.length > 0) {
      const totalLeads = lowPerformanceBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
      suggestions.push({
        id: 'low_performance',
        type: 'low_performance',
        title: 'Review Low-Performance Batches',
        description: `${lowPerformanceBatches.length} batches have success rates below 20%. Consider reviewing data quality.`,
        batchIds: lowPerformanceBatches.map(b => b.id),
        severity: 'low',
        estimatedSavings: {
          storage: `${Math.round(totalLeads * 0.3)}KB`,
          leadCount: totalLeads
        },
        action: 'Review batches'
      });
    }

    // Find potential duplicate batches (same name pattern)
    const duplicateGroups = importBatches.reduce((groups, batch) => {
      const nameKey = batch.name.toLowerCase().replace(/\d+/g, '').trim();
      if (!groups[nameKey]) groups[nameKey] = [];
      groups[nameKey].push(batch);
      return groups;
    }, {} as Record<string, ImportBatch[]>);

    const duplicateBatches = Object.values(duplicateGroups)
      .filter(group => group.length > 1)
      .flat()
      .slice(1); // Keep the first one

    if (duplicateBatches.length > 0) {
      const totalLeads = duplicateBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
      suggestions.push({
        id: 'duplicate_batches',
        type: 'duplicate_batches',
        title: 'Merge Duplicate Batches',
        description: `Found ${duplicateBatches.length} potentially duplicate batches with similar names.`,
        batchIds: duplicateBatches.map(b => b.id),
        severity: 'medium',
        estimatedSavings: {
          storage: `${Math.round(totalLeads * 0.8)}KB`,
          leadCount: totalLeads
        },
        action: 'Merge duplicates'
      });
    }

    // Find unused batches (no recent lead activity) - Fixed property names
    const unusedBatches = importBatches.filter(batch => {
      const batchLeads = leads.filter(lead => 
        lead.categoryId === batch.categoryId || 
        lead.importBatchId === batch.id
      );
      const hasRecentActivity = batchLeads.some(lead => 
        lead.lastContactDate && 
        differenceInDays(now, new Date(lead.lastContactDate)) < 90
      );
      return !hasRecentActivity && batchLeads.length > 0;
    });

    if (unusedBatches.length > 0) {
      const totalLeads = unusedBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
      suggestions.push({
        id: 'unused_batches',
        type: 'unused_batches',
        title: 'Archive Inactive Batches',
        description: `${unusedBatches.length} batches have no lead activity in the last 90 days.`,
        batchIds: unusedBatches.map(b => b.id),
        severity: 'low',
        estimatedSavings: {
          storage: `${Math.round(totalLeads * 0.4)}KB`,
          leadCount: totalLeads
        },
        action: 'Archive inactive'
      });
    }

    return suggestions;
  }, [importBatches, leads]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'old_batches': return <Clock className="h-4 w-4" />;
      case 'low_performance': return <TrendingDown className="h-4 w-4" />;
      case 'duplicate_batches': return <Database className="h-4 w-4" />;
      case 'unused_batches': return <Archive className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Lightbulb className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">All Clean!</h3>
          <p className="text-muted-foreground text-center">
            No cleanup suggestions at the moment. Your import data is well organized.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Cleanup Suggestions
        </CardTitle>
        <CardDescription>
          Automated recommendations to optimize your import data storage and organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(suggestion.type)}
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={getSeverityColor(suggestion.severity)}
                    >
                      {suggestion.severity} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>💾 Estimated savings: {suggestion.estimatedSavings.storage}</span>
                    <span>📊 {suggestion.estimatedSavings.leadCount} leads affected</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="shrink-0"
                >
                  {suggestion.action}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
