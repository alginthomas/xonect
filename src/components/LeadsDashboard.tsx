import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MobileSearchToolbar } from '@/components/ui/mobile-search-toolbar';
import { DesktopFilters } from '@/components/DesktopFilters';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { ResultsOverview } from '@/components/ResultsOverview';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsPagination } from '@/components/LeadsPagination';
import { NavigationFilterIndicator } from '@/components/NavigationFilterIndicator';
import { LeadSidebar } from '@/components/LeadSidebar';
import { EmailDialog } from '@/components/EmailDialog';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { DateGroupedLeads } from '@/components/ui/date-grouped-leads';
import { IntegrationsTab } from '@/components/IntegrationsTab';
import { useLeadsDashboardLogic } from '@/hooks/useLeadsDashboardLogic';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead, EmailTemplate, LeadStatus } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface BrandingData {
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyAddress: string;
  senderName: string;
  senderEmail: string;
}

interface LeadsDashboardProps {
  leads: Lead[];
  templates: EmailTemplate[];
  categories: Category[];
  importBatches: ImportBatch[];
  branding: BrandingData;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
  onSendEmail: (leadId: string) => void;
  selectedBatchId?: string | null;
  onCreateCategory?: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  leads,
  templates,
  categories,
  importBatches,
  branding,
  onUpdateLead,
  onDeleteLead,
  onBulkUpdateStatus,
  onBulkDelete,
  onSendEmail,
  selectedBatchId,
  onCreateCategory
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    duplicatePhoneFilter,
    setDuplicatePhoneFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    navigationFilter,
    setNavigationFilter,
    selectedLead,
    setSelectedLead,
    showSidebar,
    setShowSidebar,
    selectedLeadForEmail,
    setSelectedLeadForEmail,
    showEmailDialog,
    setShowEmailDialog,

    // Computed values
    filteredLeads,
    sortedLeads,
    paginatedLeads,
    totalPages,
    startIndex,
    activeFiltersCount,
    selectedLeads,
    columns,
    visibleColumns,

    // Handlers
    handleSort,
    handleBulkAction,
    handleExport,
    handleStatusChange,
    handleRemarksUpdate,
    handleSelectAll,
    handleSelectLead,
    clearSelection,
    clearAllFilters,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  } = useLeadsDashboardLogic({
    leads,
    categories,
    importBatches,
    selectedBatchId,
    onUpdateLead,
    onDeleteLead,
    onBulkUpdateStatus,
    onBulkDelete,
    onSendEmail
  });

  const openLeadSidebar = (lead: Lead) => {
    setSelectedLead(lead);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedLead(null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      reorderColumns(active.id, over.id);
    }
  };

  const handleDuplicatePhoneChange = (value: string) => {
    setDuplicatePhoneFilter(value as 'all' | 'unique-only' | 'duplicates-only');
  };

  const clearNavigationFilter = () => {
    setNavigationFilter(undefined);
    setStatusFilter('all');
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    window.history.replaceState({}, '', url.toString());
  };

  // Create a wrapper for handleSelectAll that matches the expected signature
  const handleSelectAllWrapper = (selected: boolean) => {
    handleSelectAll(paginatedLeads);
  };

  // Get selected leads data for integrations
  const selectedLeadsData = Array.from(selectedLeads).map(leadId => 
    leads.find(lead => lead.id === leadId)
  ).filter(Boolean) as Lead[];

  return (
    <div className="space-y-3 lg:space-y-6">
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-3 lg:space-y-6">
          {/* Mobile Search Toolbar */}
          {isMobile && (
            <MobileSearchToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={(status) => {
                setStatusFilter(status);
                setNavigationFilter(undefined);
              }}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dataAvailabilityFilter={dataAvailabilityFilter}
              onDataAvailabilityChange={setDataAvailabilityFilter}
              categories={categories}
              onExport={handleExport}
              onClearFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
            />
          )}

          {/* Desktop Filters */}
          {!isMobile && (
            <DesktopFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={(status) => {
                setStatusFilter(status);
                setNavigationFilter(undefined);
              }}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dataAvailabilityFilter={dataAvailabilityFilter}
              onDataAvailabilityChange={setDataAvailabilityFilter}
              countryFilter={countryFilter}
              onCountryChange={setCountryFilter}
              duplicatePhoneFilter={duplicatePhoneFilter}
              onDuplicatePhoneChange={handleDuplicatePhoneChange}
              categories={categories}
              leads={leads}
              onExport={handleExport}
              onClearFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              columns={columns}
              onToggleColumnVisibility={toggleColumnVisibility}
              onResetColumns={resetToDefault}
            />
          )}

          {/* Navigation Filter Indicator */}
          <NavigationFilterIndicator
            navigationFilter={navigationFilter}
            onClearFilter={clearNavigationFilter}
          />

          {/* Bulk Actions */}
          <BulkActionsBar
            selectedCount={selectedLeads.size}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
          />

          {/* Main Content */}
          <Card className="apple-card">
            <ResultsOverview
              filteredLeadsCount={filteredLeads.length}
              selectedCount={selectedLeads.size}
              selectedBatchId={selectedBatchId}
              importBatches={importBatches}
            />
            <CardContent className="pt-0">
              {/* Desktop Table */}
              <LeadsTable
                leads={paginatedLeads}
                categories={categories}
                selectedLeads={selectedLeads}
                columns={columns}
                visibleColumns={visibleColumns}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectLead={handleSelectLead}
                onSelectAll={handleSelectAllWrapper}
                onStatusChange={handleStatusChange}
                onRemarksUpdate={handleRemarksUpdate}
                onEmailClick={(lead) => {
                  setSelectedLeadForEmail(lead);
                  setShowEmailDialog(true);
                }}
                onViewDetails={openLeadSidebar}
                onDeleteLead={onDeleteLead}
                onDragEnd={handleDragEnd}
              />

              {/* Mobile Date Grouped Leads */}
              {isMobile && (
                <DateGroupedLeads
                  leads={paginatedLeads}
                  categories={categories}
                  selectedLeads={selectedLeads}
                  onSelectLead={handleSelectLead}
                  onViewDetails={openLeadSidebar}
                  onStatusChange={handleStatusChange}
                  onRemarksUpdate={handleRemarksUpdate}
                  onEmailClick={(lead) => {
                    setSelectedLeadForEmail(lead);
                    setShowEmailDialog(true);
                  }}
                  onDeleteLead={onDeleteLead}
                />
              )}

              {/* Pagination */}
              <LeadsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={sortedLeads.length}
                startIndex={startIndex}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />

              {/* No Results State */}
              {sortedLeads.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No leads found</h3>
                  <p className="text-muted-foreground">
                    {filteredLeads.length === 0 
                      ? "Try adjusting your search or filters to find leads."
                      : "All leads are filtered out by your current criteria."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floating Action Button for Mobile */}
          <FloatingActionButton
            onClick={() => {
              toast({
                title: 'Add Lead',
                description: 'Lead creation feature coming soon!'
              });
            }}
            icon={<Plus className="h-5 w-5" />}
            label="Add Lead"
            className="bottom-20 right-4 h-12 w-12 shadow-xl"
          />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationsTab 
            selectedLeads={selectedLeadsData}
            onClearSelection={clearSelection}
          />
        </TabsContent>
      </Tabs>

      {/* Sidebar for Lead Details */}
      <LeadSidebar
        lead={selectedLead}
        isOpen={showSidebar}
        onClose={closeSidebar}
        categories={categories}
        onUpdateLead={onUpdateLead}
        onCreateCategory={onCreateCategory}
      />

      {/* Email Dialog */}
      {selectedLeadForEmail && (
        <EmailDialog
          lead={selectedLeadForEmail}
          templates={templates}
          branding={branding}
          onEmailSent={(leadId) => {
            onSendEmail(leadId);
            setShowEmailDialog(false);
            setSelectedLeadForEmail(null);
          }}
        />
      )}
    </div>
  );
};
