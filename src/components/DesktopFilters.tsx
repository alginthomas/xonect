
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettings } from '@/components/ColumnSettings';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ArrowUp, X, Filter, Settings, MoreHorizontal } from 'lucide-react';
import type { Category } from '@/types/category';
import type { LeadStatus } from '@/types/lead';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface DesktopFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dataAvailabilityFilter: string;
  onDataAvailabilityChange: (value: string) => void;
  categories: Category[];
  onExport: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  columns: ColumnConfig[];
  onToggleColumnVisibility: (columnId: string) => void;
  onResetColumns: () => void;
}

const allStatuses: LeadStatus[] = [
  'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
  'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
  'Not Interested', 'Interested'
];

export const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dataAvailabilityFilter,
  onDataAvailabilityChange,
  categories,
  onExport,
  onClearFilters,
  activeFiltersCount,
  columns,
  onToggleColumnVisibility,
  onResetColumns
}) => {
  const getActiveFilterChips = () => {
    const chips = [];
    if (statusFilter !== 'all') {
      chips.push({ type: 'status', label: `Status: ${statusFilter}`, onRemove: () => onStatusChange('all') });
    }
    if (categoryFilter !== 'all') {
      const category = categories.find(c => c.id === categoryFilter);
      chips.push({ 
        type: 'category', 
        label: `Category: ${category?.name || 'Unknown'}`, 
        onRemove: () => onCategoryChange('all') 
      });
    }
    if (dataAvailabilityFilter !== 'all') {
      const dataLabel = dataAvailabilityFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      chips.push({ 
        type: 'data', 
        label: `Data: ${dataLabel}`, 
        onRemove: () => onDataAvailabilityChange('all') 
      });
    }
    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  return (
    <Card className="apple-card border-border/50">
      <CardContent className="pt-6 space-y-4">
        {/* Enhanced Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors duration-200" />
          </div>
          <Input
            placeholder="Search leads by name, company, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 h-14 text-base bg-gradient-to-r from-background/80 to-muted/20 border border-border/30 rounded-2xl shadow-sm backdrop-blur-sm focus:bg-background focus:border-primary/40 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 ease-out placeholder:text-muted-foreground/60 hover:border-border/50 hover:shadow-md font-medium"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted/80 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Filters and Actions Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Controls Section */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filters:</span>
              
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-32 h-9 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {allStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-36 h-9 border-border/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                <SelectTrigger className="w-32 h-9 border-border/50">
                  <SelectValue placeholder="Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="has-email">Has Email</SelectItem>
                  <SelectItem value="has-phone">Has Phone</SelectItem>
                  <SelectItem value="has-both">Has Both</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Summary and Clear */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                    <Filter className="h-3 w-3 mr-1" />
                    {activeFiltersCount} active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden lg:inline">Actions:</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 border-border/50">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onExport} className="gap-2">
                  <ArrowUp className="h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ColumnSettings
              columns={columns}
              onToggleVisibility={onToggleColumnVisibility}
              onReset={onResetColumns}
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
            <span className="text-xs font-medium text-muted-foreground self-center">Active filters:</span>
            {activeFilterChips.map((chip, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary text-xs px-2 py-1 gap-1 hover:bg-primary/10 transition-colors"
              >
                {chip.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary/20 rounded-full"
                  onClick={chip.onRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
