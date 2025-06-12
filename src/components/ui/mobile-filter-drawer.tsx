
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import type { Category } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

interface MobileFilterDrawerProps {
  statusFilter: string;
  categoryFilter: string;
  dataAvailabilityFilter: string;
  categories: Category[];
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDataAvailabilityChange: (value: string) => void;
  onClearFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  statusFilter,
  categoryFilter,
  dataAvailabilityFilter,
  categories,
  onStatusChange,
  onCategoryChange,
  onDataAvailabilityChange,
  onClearFilters
}) => {
  const [open, setOpen] = useState(false);

  const allStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
    'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
    'Not Interested', 'Interested'
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dataAvailabilityFilter !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filter Leads
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Filter your leads by status, category, and data availability
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="h-12">
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
          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-12">
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
          <div className="space-y-3">
            <label className="text-sm font-medium">Data Availability</label>
            <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
              <SelectTrigger className="h-12">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
