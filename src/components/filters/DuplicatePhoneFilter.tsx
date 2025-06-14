
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DuplicatePhoneFilterProps {
  duplicatePhoneFilter: string;
  onDuplicatePhoneChange: (value: string) => void;
}

export const DuplicatePhoneFilter: React.FC<DuplicatePhoneFilterProps> = ({
  duplicatePhoneFilter,
  onDuplicatePhoneChange
}) => {
  return (
    <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
      <SelectTrigger className="w-[160px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
        <SelectValue placeholder="All Leads" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-border/40 shadow-lg">
        <SelectItem value="all" className="font-medium">All Leads</SelectItem>
        <SelectItem value="unique-only" className="font-medium">Unique Only</SelectItem>
        <SelectItem value="duplicates-only" className="font-medium">Duplicates Only</SelectItem>
      </SelectContent>
    </Select>
  );
};
