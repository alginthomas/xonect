
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { ImportBatch } from '@/types/category';

interface ImportStatsOverviewProps {
  importBatches: ImportBatch[];
  categories: any[];
}

export const ImportStatsOverview: React.FC<ImportStatsOverviewProps> = ({
  importBatches,
  categories
}) => {
  const totalBatches = importBatches.length;
  const totalImportedLeads = importBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
  const averageSuccessRate = totalBatches > 0 
    ? Math.round(importBatches.reduce((sum, batch) => {
        const totalLeads = batch.totalLeads || 0;
        const successfulImports = batch.successfulImports || 0;
        return sum + (totalLeads > 0 ? (successfulImports / totalLeads) * 100 : 0);
      }, 0) / totalBatches) 
    : 0;
  const activeCategories = new Set(importBatches.map(batch => batch.categoryId).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">{totalBatches}</div>
            <p className="text-sm font-medium">Total Batches</p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">{totalImportedLeads}</div>
            <p className="text-sm font-medium">Imported Leads</p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">{averageSuccessRate}%</div>
            <p className="text-sm font-medium">Avg Success Rate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600">{activeCategories}</div>
            <p className="text-sm font-medium">Active Categories</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
