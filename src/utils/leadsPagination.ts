
import type { Lead } from '@/types/lead';

export interface PaginationResult {
  paginatedLeads: Lead[];
  totalPages: number;
  totalLeads: number;
  startIndex: number;
}

export const paginateLeads = (
  leads: Lead[], 
  currentPage: number, 
  itemsPerPage: number
): PaginationResult => {
  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const totalLeads = leads.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = leads.slice(startIndex, startIndex + itemsPerPage);

  return {
    paginatedLeads,
    totalPages,
    totalLeads,
    startIndex
  };
};
