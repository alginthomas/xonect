
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Users, Eye, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';

interface ImportBatchCardProps {
  batch: ImportBatch;
  isSelected: boolean;
  onToggleSelection: () => void;
  onViewBatchLeads: (batchId: string, batchName: string) => void;
  onExportBatch: (batch: ImportBatch) => void;
  onDeleteBatch: (batchId: string, batchName: string) => void;
  getCategoryName: (categoryId?: string) => string;
  getBatchLeads: (batchId: string) => Lead[];
}

export const ImportBatchCard: React.FC<ImportBatchCardProps> = ({
  batch,
  isSelected,
  onToggleSelection,
  onViewBatchLeads,
  onExportBatch,
  onDeleteBatch,
  getCategoryName,
  getBatchLeads
}) => {
  const batchLeads = getBatchLeads(batch.id);
  
  const getBatchStats = () => {
    const contactedCount = batchLeads.filter(lead => lead.status === 'Contacted').length;
    const qualifiedCount = batchLeads.filter(lead => lead.status === 'Qualified').length;
    const totalLeads = batch.totalLeads || 0;
    const successfulImports = batch.successfulImports || 0;
    const successRate = totalLeads > 0 ? (successfulImports / totalLeads) * 100 : 0;

    return {
      contactedCount,
      qualifiedCount,
      successRate,
      engagementRate: batchLeads.length > 0 ? (contactedCount / batchLeads.length) * 100 : 0
    };
  };

  const stats = getBatchStats();

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Header with Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                className="mt-1"
              />
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{batch.name}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {getCategoryName(batch.categoryId)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(batch.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{batch.totalLeads || 0} leads</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewBatchLeads(batch.id, batch.name)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View ({batchLeads.length})
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExportBatch(batch)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Import Batch</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the import batch "{batch.name}"? 
                      This will also delete all {batchLeads.length} leads associated with this batch. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDeleteBatch(batch.id, batch.name)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Batch
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">{stats.contactedCount}</div>
              <div className="text-xs text-muted-foreground">Contacted</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">{stats.qualifiedCount}</div>
              <div className="text-xs text-muted-foreground">Qualified</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.successRate)}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-orange-600">{Math.round(stats.engagementRate)}%</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Import Success Rate</span>
              <span className="font-medium">{Math.round(stats.successRate)}%</span>
            </div>
            <Progress value={stats.successRate} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
