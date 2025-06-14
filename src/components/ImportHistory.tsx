import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Trash2, Download, Eye, Calendar, Users, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { BulkBatchActions } from './BulkBatchActions';

interface ImportHistoryProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  categories: Category[];
  onDeleteBatch: (batchId: string) => void;
  onViewBatchLeads?: (batchId: string) => void;
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({
  leads = [],
  importBatches = [],
  categories = [],
  onDeleteBatch,
  onViewBatchLeads
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'leads'>('date');
  const { toast } = useToast();
  const navigate = useNavigate();

  // ========== BATCH SELECTION HOOK ===========
  const { 
    selectedBatchIds,
    isSelected,
    toggleSelection,
    clearSelection,
    selectAll,
    isAllSelected,
    isPartiallySelected
  } = useBatchSelection(importBatches);

  const filteredBatches = useMemo(() => {
    if (!importBatches || !Array.isArray(importBatches)) {
      return [];
    }
    let filtered = importBatches.filter(batch => 
      batch && batch.name && batch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'leads':
        return filtered.sort((a, b) => (b.totalLeads || 0) - (a.totalLeads || 0));
      default:
        return filtered;
    }
  }, [importBatches, searchQuery, sortBy]);

  const getBatchLeads = (batchId: string) => {
    if (!leads || !Array.isArray(leads)) {
      return [];
    }
    return leads.filter(lead => 
      lead.categoryId === batchId || 
      importBatches.find(batch => batch.id === batchId)?.categoryId === lead.categoryId
    );
  };

  const getBatchStats = (batch: ImportBatch) => {
    const batchLeads = getBatchLeads(batch.id);
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

  const handleExportBatch = (batch: ImportBatch) => {
    const batchLeads = getBatchLeads(batch.id);
    if (batchLeads.length === 0) {
      toast({
        title: "No leads to export",
        description: "This batch contains no leads to export",
        variant: "destructive"
      });
      return;
    }

    exportLeadsToCSV(batchLeads, categories, `batch-${batch.name.toLowerCase().replace(/\s+/g, '-')}`);
    toast({
      title: "Export successful",
      description: `Exported ${batchLeads.length} leads from batch "${batch.name}"`
    });
  };

  const handleDeleteBatch = (batchId: string, batchName: string) => {
    onDeleteBatch(batchId);
    toast({
      title: "Batch deleted",
      description: `Import batch "${batchName}" has been deleted`
    });
  };

  const handleViewBatchLeads = (batchId: string) => {
    navigate(`/?tab=dashboard&batch=${batchId}`);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories || !Array.isArray(categories)) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // ============= STORAGE DASHBOARD ==============
  // Compute storage/lead count per batch
  const totalBatches = filteredBatches.length;
  const totalImportedLeads = filteredBatches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
  const averageSuccessRate = totalBatches > 0 
    ? Math.round(filteredBatches.reduce((sum, batch) => {
        const totalLeads = batch.totalLeads || 0;
        const successfulImports = batch.successfulImports || 0;
        return sum + (totalLeads > 0 ? (successfulImports / totalLeads) * 100 : 0);
      }, 0) / totalBatches) 
    : 0;
  const activeCategories = new Set(filteredBatches.map(batch => batch.categoryId).filter(Boolean)).size;
  const totalFailedImports = filteredBatches.reduce((sum, batch) => sum + (batch.failedImports || 0), 0);

  // ============= BULK DELETE ACTION ============
  const handleBulkDelete = () => {
    if (selectedBatchIds.size === 0) return;
    // Get batch list
    const deletedNames = filteredBatches
      .filter(b => selectedBatchIds.has(b.id))
      .map(b => b.name)
      .join(", ");
    if (!window.confirm(
      `Delete ${selectedBatchIds.size} batches:\n${deletedNames}\n\nAll associated leads will be deleted as well!`)) {
      return;
    }
    selectedBatchIds.forEach(id => {
      const batch = filteredBatches.find(b => b.id === id);
      if (batch) onDeleteBatch(batch.id);
    });
    toast({
      title: "Batches deleted",
      description: `${selectedBatchIds.size} batches have been successfully deleted`,
    });
    clearSelection();
  };

  return (
    <div className="space-y-8">
      {/* Storage Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
        <Card className="text-center">
          <CardContent className="pt-6 pb-3">
            <div className="text-2xl font-bold text-blue-600">{totalBatches}</div>
            <p className="text-sm font-medium">Total Batches</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-3">
            <div className="text-2xl font-bold text-green-600">{totalImportedLeads}</div>
            <p className="text-sm font-medium">Imported Leads</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-3">
            <div className="text-2xl font-bold text-purple-600">{averageSuccessRate}%</div>
            <p className="text-sm font-medium">Avg Success Rate</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-3">
            <div className="text-2xl font-bold text-orange-600">{activeCategories}</div>
            <p className="text-sm font-medium">Active Categories</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-3">
            <div className="text-2xl font-bold text-red-600">{totalFailedImports}</div>
            <p className="text-sm font-medium">Failed Imports</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Batch Actions Bar */}
      <BulkBatchActions
        selectedCount={selectedBatchIds.size}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold">Import History</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track and manage all your CSV import batches
        </p>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Import Batches</CardTitle>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (isAllSelected ? clearSelection() : selectAll())}
                className="px-3"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Search, sort, and manage your imported lead batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search import batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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

          {/* Batch List */}
          {filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No import batches found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No batches match your search criteria.' : 'Start by importing some leads to see your batch history here.'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => {
                const stats = getBatchStats(batch);
                const batchLeads = getBatchLeads(batch.id);

                return (
                  <Card key={batch.id}
                    className={`border-l-4 border-l-blue-500 hover:shadow-md transition-shadow ${
                      isSelected(batch.id) ? "bg-primary/10 border-l-emerald-600" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {/* Checkbox for multi-select */}
                            <input
                              type="checkbox"
                              checked={isSelected(batch.id)}
                              onChange={() => toggleSelection(batch.id)}
                              className="accent-blue-500 h-5 w-5 mt-1"
                              aria-label="Select batch"
                            />
                            <div className="space-y-2">
                              {/* ... keep Batch name and badge ... */}
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

                          {/* ... keep existing Actions ... */}
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewBatchLeads(batch.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View ({batchLeads.length})
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
                            {/* ... keep existing AlertDialog for single delete ... */}
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
                                {/* ... keep existing alert dialog content ... */}
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
                        {/* ... keep Stats, Progress, etc ... */}
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
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
