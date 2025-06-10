
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Trash2, Download, Eye, Calendar, Users, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface ImportHistoryProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  categories: Category[];
  onDeleteBatch: (batchId: string) => void;
  onViewBatchLeads: (batchId: string) => void;
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({
  leads,
  importBatches,
  categories,
  onDeleteBatch,
  onViewBatchLeads
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'leads'>('date');
  const { toast } = useToast();

  const filteredBatches = useMemo(() => {
    let filtered = importBatches.filter(batch =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'leads':
        return filtered.sort((a, b) => b.totalLeads - a.totalLeads);
      default:
        return filtered;
    }
  }, [importBatches, searchQuery, sortBy]);

  const getBatchLeads = (batchId: string) => {
    return leads.filter(lead => lead.categoryId === batchId || 
      importBatches.find(batch => batch.id === batchId)?.categoryId === lead.categoryId);
  };

  const getBatchStats = (batch: ImportBatch) => {
    const batchLeads = getBatchLeads(batch.id);
    const contactedCount = batchLeads.filter(lead => lead.status === 'Contacted').length;
    const qualifiedCount = batchLeads.filter(lead => lead.status === 'Qualified').length;
    const successRate = batch.totalLeads > 0 ? (batch.successfulImports / batch.totalLeads) * 100 : 0;
    
    return {
      contactedCount,
      qualifiedCount,
      successRate,
      engagementRate: batchLeads.length > 0 ? (contactedCount / batchLeads.length) * 100 : 0
    };
  };

  const handleExportBatch = (batch: ImportBatch) => {
    const batchLeads = getBatchLeads(batch.id);
    if (batchLeads.length === 0) {
      toast({
        title: "No leads to export",
        description: "This batch contains no leads to export",
        variant: "destructive",
      });
      return;
    }

    exportLeadsToCSV(batchLeads, categories, `batch-${batch.name.toLowerCase().replace(/\s+/g, '-')}`);
    
    toast({
      title: "Export successful",
      description: `Exported ${batchLeads.length} leads from batch "${batch.name}"`,
    });
  };

  const handleDeleteBatch = (batchId: string, batchName: string) => {
    onDeleteBatch(batchId);
    toast({
      title: "Batch deleted",
      description: `Import batch "${batchName}" has been deleted`,
    });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importBatches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Imported Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {importBatches.reduce((sum, batch) => sum + batch.totalLeads, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {importBatches.length > 0 
                ? Math.round(
                    importBatches.reduce((sum, batch) => 
                      sum + (batch.totalLeads > 0 ? (batch.successfulImports / batch.totalLeads) * 100 : 0), 0
                    ) / importBatches.length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(importBatches.map(batch => batch.categoryId).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search import batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>

        <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'leads') => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="leads">Sort by Lead Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Import Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Import History ({filteredBatches.length})</CardTitle>
          <CardDescription>
            Manage and track your imported lead batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No import batches found</h3>
              <p>Start by importing some leads to see your batch history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => {
                const stats = getBatchStats(batch);
                const batchLeads = getBatchLeads(batch.id);
                
                return (
                  <Card key={batch.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{batch.name}</h3>
                            <Badge variant="outline">
                              {getCategoryName(batch.categoryId)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(batch.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{batch.totalLeads} leads</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span>{stats.contactedCount} contacted</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Success:</span>
                              <span className="font-medium">{Math.round(stats.successRate)}%</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Import Success Rate</span>
                              <span>{Math.round(stats.successRate)}%</span>
                            </div>
                            <Progress value={stats.successRate} className="h-2" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewBatchLeads(batch.id)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Leads ({batchLeads.length})
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportBatch(batch)}
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
                                  onClick={() => handleDeleteBatch(batch.id, batch.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Batch
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
