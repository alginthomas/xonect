
import React, { useState, useMemo } from 'react';
import { EnhancedMobileLeadCard } from './enhanced-mobile-lead-card';
import { MobileSearchFilters } from './mobile-search-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash2,
  MessageSquare
} from 'lucide-react';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileLeadsListProps {
  leads: Lead[];
  categories: Category[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onEmailClick: (leadId: string) => void;
  onViewDetails: (lead: Lead) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
}

export const MobileLeadsList: React.FC<MobileLeadsListProps> = ({
  leads,
  categories,
  onUpdateLead,
  onDeleteLead,
  onEmailClick,
  onViewDetails,
  onBulkUpdateStatus,
  onBulkDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.company}`
          .toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      
      const matchesCategory = selectedCategory === 'all' || lead.categoryId === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort leads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [leads, searchQuery, selectedStatus, selectedCategory, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  }, [selectedStatus, selectedCategory]);

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredAndSortedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredAndSortedLeads.map(lead => lead.id)));
    }
  };

  const handleBulkAction = (action: 'delete' | LeadStatus) => {
    const leadIds = Array.from(selectedLeads);
    if (action === 'delete') {
      onBulkDelete(leadIds);
    } else {
      onBulkUpdateStatus(leadIds, action);
    }
    setSelectedLeads(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <MobileSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {/* Results Summary and Controls */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {filteredAndSortedLeads.length} lead{filteredAndSortedLeads.length !== 1 ? 's' : ''}
            </span>
            {selectedLeads.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedLeads.size} selected
              </Badge>
            )}
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-auto h-8 text-xs">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 px-2 text-xs"
            >
              {selectedLeads.size === filteredAndSortedLeads.length ? (
                <CheckSquare className="h-3 w-3 mr-1" />
              ) : (
                <Square className="h-3 w-3 mr-1" />
              )}
              {selectedLeads.size === filteredAndSortedLeads.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            <Select onValueChange={(value) => handleBulkAction(value as LeadStatus)}>
              <SelectTrigger className="w-auto h-8 text-xs">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">Mark as New</SelectItem>
                <SelectItem value="Contacted">Mark as Contacted</SelectItem>
                <SelectItem value="Qualified">Mark as Qualified</SelectItem>
                <SelectItem value="Interested">Mark as Interested</SelectItem>
                <SelectItem value="Not Interested">Mark as Not Interested</SelectItem>
                <SelectItem value="Unresponsive">Mark as Unresponsive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="h-8 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {filteredAndSortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters to find more leads.'
                : 'Start by importing leads or adding them manually.'
              }
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0 pt-4">
            {filteredAndSortedLeads.map((lead) => (
              <EnhancedMobileLeadCard
                key={lead.id}
                lead={lead}
                categories={categories}
                isSelected={selectedLeads.has(lead.id)}
                onSelect={(checked) => handleSelectLead(lead.id, checked)}
                onStatusChange={(status) => onUpdateLead(lead.id, { status })}
                onRemarksUpdate={(remarks) => onUpdateLead(lead.id, { remarks })}
                onEmailClick={() => onEmailClick(lead.id)}
                onViewDetails={() => onViewDetails(lead)}
                onDeleteLead={() => onDeleteLead(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
