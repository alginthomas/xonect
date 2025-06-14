
import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToCSV } from '@/utils/csvExport';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { BulkBatchActions } from '@/components/BulkBatchActions';
import { navigateToBatchLeads } from '@/utils/batchNavigation';
import { ImportHistoryHeader } from '@/components/import-history/ImportHistoryHeader';
import { ImportStatsOverview } from '@/components/import-history/ImportStatsOverview';
import { ImportHistoryControls } from '@/components/import-history/ImportHistoryControls';
import { ImportBatchCard } from '@/components/import-history/ImportBatchCard';
import { ImportHistoryEmptyState } from '@/components/import-history/ImportHistoryEmptyState';
import type { Lead } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface ImportHistoryProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  categories: Category[];
  onDeleteBatch: (batchId: string, batchName?: string) => void;
  onViewBatchLeads?: (batchId: string) => void;
  onRefreshData?: () => void;
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({
  leads = [],
  importBatches = [],
  categories = [],
  onDeleteBatch,
  onViewBatchLeads,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'leads'>('date');
  const { toast } = useToast();
  
  const {
    selectedBatchIds,
    toggleBatch,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount
  } = useBatchSelection();

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

  const handleBulkDelete = async () => {
    for (const batchId of selectedBatchIds) {
      await onDeleteBatch(batchId);
    }
    clearSelection();
    
    // Refresh data after bulk deletion
    if (onRefreshData) {
      onRefreshData();
    }
    
    toast({
      title: "Batches deleted",
      description: `Successfully deleted ${selectedBatchIds.length} import batch${selectedBatchIds.length === 1 ? '' : 'es'}`
    });
  };

  const handleSelectAll = () => {
    if (selectedCount === filteredBatches.length) {
      clearSelection();
    } else {
      selectAll(filteredBatches.map(batch => batch.id));
    }
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

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    await onDeleteBatch(batchId, batchName);
    
    // Refresh data after single batch deletion
    if (onRefreshData) {
      onRefreshData();
    }
    
    toast({
      title: "Batch deleted",
      description: `Import batch "${batchName}" has been deleted`
    });
  };

  const handleViewBatchLeads = (batchId: string, batchName?: string) => {
    console.log('🔗 Viewing batch leads:', { batchId, batchName });
    
    // Use the navigation utility to properly navigate to batch leads
    navigateToBatchLeads(batchId, batchName);
    
    // Also call the optional callback if provided
    if (onViewBatchLeads) {
      onViewBatchLeads(batchId);
    }
    
    toast({
      title: "Viewing batch leads",
      description: `Showing leads from batch "${batchName || 'Unknown'}"`
    });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories || !Array.isArray(categories)) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <ImportHistoryHeader />

      {/* Stats Overview */}
      <ImportStatsOverview 
        importBatches={filteredBatches} 
        categories={categories} 
      />

      {/* Bulk Actions */}
      <BulkBatchActions
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
      />

      {/* Search and Controls */}
      <ImportHistoryControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filteredBatchesLength={filteredBatches.length}
        selectedCount={selectedCount}
        onSelectAll={handleSelectAll}
      />

      {/* Batch List */}
      {filteredBatches.length === 0 ? (
        <ImportHistoryEmptyState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBatches.map((batch) => (
            <ImportBatchCard
              key={batch.id}
              batch={batch}
              isSelected={isSelected(batch.id)}
              onToggleSelection={() => toggleBatch(batch.id)}
              onViewBatchLeads={handleViewBatchLeads}
              onExportBatch={handleExportBatch}
              onDeleteBatch={handleDeleteBatch}
              getCategoryName={getCategoryName}
              getBatchLeads={getBatchLeads}
            />
          ))}
        </div>
      )}
    </div>
  );
};
