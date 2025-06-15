
import type { Lead } from '@/types/lead';

export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

export const normalizePhoneForComparison = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-numeric characters for comparison
  return phone.replace(/\D/g, '');
};

export const normalizeNameForComparison = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason: string;
  existingLead?: Lead;
}

export const checkForDuplicate = (
  newLead: Partial<Lead>,
  existingLeads: Lead[],
  userId?: string
): DuplicateCheckResult => {
  const normalizedNewEmail = normalizeEmail(newLead.email || '');
  const normalizedNewPhone = newLead.phone ? normalizePhoneForComparison(newLead.phone) : '';

  // Filter existing leads by user if userId is provided
  const userLeads = userId ? existingLeads.filter(lead => lead.userId === userId) : existingLeads;

  for (const existingLead of userLeads) {
    const normalizedExistingEmail = normalizeEmail(existingLead.email);
    const normalizedExistingPhone = existingLead.phone ? normalizePhoneForComparison(existingLead.phone) : '';

    // Check email match
    if (normalizedNewEmail && normalizedNewEmail === normalizedExistingEmail) {
      return {
        isDuplicate: true,
        reason: 'Duplicate email found',
        existingLead
      };
    }

    // Check phone match
    if (normalizedNewPhone && normalizedExistingPhone && normalizedNewPhone === normalizedExistingPhone) {
      return {
        isDuplicate: true,
        reason: 'Duplicate phone found',
        existingLead
      };
    }

    // Check name + company match
    const nameCompanyMatch = 
      normalizeNameForComparison(newLead.firstName || '') === normalizeNameForComparison(existingLead.firstName || '') &&
      normalizeNameForComparison(newLead.lastName || '') === normalizeNameForComparison(existingLead.lastName || '') &&
      normalizeNameForComparison(newLead.company || '') === normalizeNameForComparison(existingLead.company || '');

    if (nameCompanyMatch) {
      return {
        isDuplicate: true,
        reason: 'Duplicate name and company combination found',
        existingLead
      };
    }
  }

  return {
    isDuplicate: false,
    reason: ''
  };
};

// Helper function to check if two leads are duplicates
export const areDuplicates = (lead1: Lead, lead2: Lead): boolean => {
  const result = checkForDuplicate(lead1, [lead2]);
  return result.isDuplicate;
};

// Helper function to find all duplicates for a specific lead
export const findDuplicates = (targetLead: Lead, allLeads: Lead[], userId?: string): Lead[] => {
  // Filter leads by user if userId is provided
  const userLeads = userId ? allLeads.filter(lead => lead.userId === userId) : allLeads;
  
  return userLeads.filter(lead => 
    lead.id !== targetLead.id && areDuplicates(targetLead, lead)
  );
};

// Helper function to get duplicate groups
export const getDuplicateGroups = (leads: Lead[], userId?: string): Lead[][] => {
  // Filter leads by user if userId is provided
  const userLeads = userId ? leads.filter(lead => lead.userId === userId) : leads;
  
  const processedIds = new Set<string>();
  const groups: Lead[][] = [];

  userLeads.forEach(lead => {
    if (processedIds.has(lead.id)) return;

    const duplicates = findDuplicates(lead, userLeads);
    if (duplicates.length > 0) {
      const group = [lead, ...duplicates];
      groups.push(group);
      group.forEach(l => processedIds.add(l.id));
    }
  });

  return groups;
};

// Function to filter out duplicates from a list of leads
export const filterDuplicates = (
  leadsToCheck: Partial<Lead>[],
  existingLeads: Lead[],
  userId?: string
): {
  uniqueLeads: Partial<Lead>[];
  duplicates: Array<{
    lead: Partial<Lead>;
    reason: string;
    existingLead: Lead;
  }>;
} => {
  const uniqueLeads: Partial<Lead>[] = [];
  const duplicates: Array<{
    lead: Partial<Lead>;
    reason: string;
    existingLead: Lead;
  }> = [];

  // Filter existing leads by user if userId is provided
  const userExistingLeads = userId ? existingLeads.filter(lead => lead.userId === userId) : existingLeads;

  for (const leadToCheck of leadsToCheck) {
    const duplicateCheck = checkForDuplicate(leadToCheck, userExistingLeads, userId);
    
    if (duplicateCheck.isDuplicate && duplicateCheck.existingLead) {
      duplicates.push({
        lead: leadToCheck,
        reason: duplicateCheck.reason,
        existingLead: duplicateCheck.existingLead
      });
    } else {
      uniqueLeads.push(leadToCheck);
    }
  }

  return { uniqueLeads, duplicates };
};
