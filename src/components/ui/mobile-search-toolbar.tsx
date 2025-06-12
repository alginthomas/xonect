
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  X 
} from 'lucide-react';
import type { Category } from '@/types/category';

interface MobileSearchToolbarProps {
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
}

export const MobileSearchToolbar: React.FC<MobileSearchToolbarProps> = ({
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
  activeFiltersCount
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allStatuses = [
    'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
    'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
    'Not Interested', 'Interested'
  ];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 pb-3 space-y-3">
      {/* Search Bar with integrated actions */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-20 h-11 bg-background border-border/50"
        />
        
        {/* Filter and Export buttons inside search bar */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 relative"
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0">
              <div className="flex-shrink-0 p-6 border-b">
                <SheetHeader className="text-left">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Filters</SheetTitle>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onClearFilters}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-6">
                  <div className="space-y-4 py-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {allStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={categoryFilter} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Categories" />
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
                    </div>

                    {/* Data Availability Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data Availability</label>
                      <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Leads" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Leads</SelectItem>
                          <SelectItem value="has-phone">Has Phone</SelectItem>
                          <SelectItem value="has-email">Has Email</SelectItem>
                          <SelectItem value="has-both">Has Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Extra padding for better scrolling */}
                    <div className="h-20" />
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExport}
            className="h-7 w-7 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onStatusChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Category: {categories.find(c => c.id === categoryFilter)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onCategoryChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {dataAvailabilityFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Data: {dataAvailabilityFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onDataAvailabilityChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
