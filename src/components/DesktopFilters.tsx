
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettings } from '@/components/ColumnSettings';
import { Badge } from '@/components/ui/badge';
import { Search, Download, X, Filter } from 'lucide-react';
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
  return (
    <Card className="apple-card">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Button variant="outline" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32 h-9">
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
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
              <SelectTrigger className="w-28 h-9">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="has-email">Has Email</SelectItem>
                <SelectItem value="has-phone">Has Phone</SelectItem>
                <SelectItem value="has-both">Has Both</SelectItem>
              </SelectContent>
            </Select>

            <ColumnSettings
              columns={columns}
              onToggleVisibility={onToggleColumnVisibility}
              onReset={onResetColumns}
            />

            <Button variant="outline" onClick={onExport} className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={onClearFilters} className="h-9">
                <X className="h-4 w-4 mr-2" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
