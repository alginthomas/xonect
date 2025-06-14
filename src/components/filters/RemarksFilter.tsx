
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RemarksFilterProps {
  remarksFilter: string;
  onRemarksChange: (value: string) => void;
}

export const RemarksFilter: React.FC<RemarksFilterProps> = ({
  remarksFilter,
  onRemarksChange
}) => {
  return (
    <Select value={remarksFilter} onValueChange={onRemarksChange}>
      <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
        <SelectValue placeholder="All Remarks" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-border/40 shadow-lg">
        <SelectItem value="all" className="font-medium">All Remarks</SelectItem>
        <SelectItem value="has-remarks" className="font-medium">Has Remarks</SelectItem>
        <SelectItem value="no-remarks" className="font-medium">No Remarks</SelectItem>
      </SelectContent>
    </Select>
  );
};
