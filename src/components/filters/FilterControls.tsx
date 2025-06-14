
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

interface FilterControlsProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dataAvailabilityFilter: string;
  onDataAvailabilityChange: (value: string) => void;
  categories: Category[];
}

// All available lead statuses
const allLeadStatuses: LeadStatus[] = ['New', 'Contacted', 'Opened', 'Clicked', 'Replied', 'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 'Not Interested', 'Interested', 'Send Email'];

export const FilterControls: React.FC<FilterControlsProps> = ({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dataAvailabilityFilter,
  onDataAvailabilityChange,
  categories
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-border/40 shadow-lg">
          <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
          {allLeadStatuses.map((status) => (
            <SelectItem key={status} value={status} className="font-medium">{status}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[170px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-border/40 shadow-lg">
          <SelectItem value="all" className="font-medium">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id} className="font-medium">
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
        <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
          <SelectValue placeholder="All Data" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-border/40 shadow-lg">
          <SelectItem value="all" className="font-medium">All Data</SelectItem>
          <SelectItem value="has-email" className="font-medium">Has Email</SelectItem>
          <SelectItem value="has-phone" className="font-medium">Has Phone</SelectItem>
          <SelectItem value="has-both" className="font-medium">Has Both</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
