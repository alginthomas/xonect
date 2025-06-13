
import type { Lead } from '@/types/lead';

/**
 * Normalize phone number by removing all non-digit characters
 * and standardizing the format for comparison
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (digitsOnly.length === 10) {
    // US number without country code
    return `1${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // US number with country code
    return digitsOnly;
  }
  
  // Return as-is for international numbers
  return digitsOnly;
};

/**
 * Group leads by normalized phone number
 */
export const groupLeadsByPhone = (leads: Lead[]): Map<string, Lead[]> => {
  const phoneGroups = new Map<string, Lead[]>();
  
  leads.forEach(lead => {
    if (!lead.phone) return;
    
    const normalizedPhone = normalizePhoneNumber(lead.phone);
    if (!normalizedPhone) return;
    
    if (!phoneGroups.has(normalizedPhone)) {
      phoneGroups.set(normalizedPhone, []);
    }
    phoneGroups.get(normalizedPhone)!.push(lead);
  });
  
  return phoneGroups;
};

/**
 * Get duplicate phone number statistics
 */
export const getDuplicatePhoneStats = (leads: Lead[]) => {
  const phoneGroups = groupLeadsByPhone(leads);
  const duplicateGroups = Array.from(phoneGroups.entries()).filter(([_, group]) => group.length > 1);
  
  return {
    totalDuplicateGroups: duplicateGroups.length,
    totalDuplicateLeads: duplicateGroups.reduce((sum, [_, group]) => sum + group.length, 0),
    averageDuplicatesPerGroup: duplicateGroups.length > 0 
      ? duplicateGroups.reduce((sum, [_, group]) => sum + group.length, 0) / duplicateGroups.length 
      : 0
  };
};

/**
 * Select the best lead from a group of duplicates based on priority rules
 */
export const selectBestLeadFromDuplicates = (leads: Lead[]): Lead => {
  if (leads.length === 1) return leads[0];
  
  // Priority rules (in order):
  // 1. Higher completeness score
  // 2. More recent activity (lastContactDate or createdAt)
  // 3. More emails sent (indicates engagement)
  // 4. Better status (prioritize active statuses)
  
  const statusPriority: Record<string, number> = {
    'Qualified': 10,
    'Interested': 9,
    'Replied': 8,
    'Contacted': 7,
    'Opened': 6,
    'Clicked': 5,
    'New': 4,
    'Call Back': 3,
    'Unresponsive': 2,
    'Not Interested': 1,
    'Unqualified': 0
  };
  
  return leads.sort((a, b) => {
    // First by completeness score
    if (a.completenessScore !== b.completenessScore) {
      return b.completenessScore - a.completenessScore;
    }
    
    // Then by last contact or creation date
    const aDate = a.lastContactDate || a.createdAt;
    const bDate = b.lastContactDate || b.createdAt;
    const dateComparison = new Date(bDate).getTime() - new Date(aDate).getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    }
    
    // Then by emails sent
    if (a.emailsSent !== b.emailsSent) {
      return b.emailsSent - a.emailsSent;
    }
    
    // Finally by status priority
    return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
  })[0];
};

/**
 * Filter leads to remove duplicates, keeping only the best lead from each phone number group
 */
export const filterDuplicatePhoneNumbers = (leads: Lead[]): Lead[] => {
  const phoneGroups = groupLeadsByPhone(leads);
  const uniqueLeads: Lead[] = [];
  const leadsWithoutPhone = leads.filter(lead => !lead.phone);
  
  // Add leads without phone numbers
  uniqueLeads.push(...leadsWithoutPhone);
  
  // Add best lead from each phone group
  phoneGroups.forEach(group => {
    const bestLead = selectBestLeadFromDuplicates(group);
    uniqueLeads.push(bestLead);
  });
  
  return uniqueLeads;
};

/**
 * Get all leads that have duplicate phone numbers
 */
export const getLeadsWithDuplicatePhones = (leads: Lead[]): Lead[] => {
  const phoneGroups = groupLeadsByPhone(leads);
  const duplicateLeads: Lead[] = [];
  
  phoneGroups.forEach(group => {
    if (group.length > 1) {
      duplicateLeads.push(...group);
    }
  });
  
  return duplicateLeads;
};

/**
 * Check if a lead has a duplicate phone number
 */
export const hasPhoneDuplicate = (lead: Lead, allLeads: Lead[]): boolean => {
  if (!lead.phone) return false;
  
  const normalizedPhone = normalizePhoneNumber(lead.phone);
  if (!normalizedPhone) return false;
  
  return allLeads.filter(l => 
    l.id !== lead.id && 
    l.phone && 
    normalizePhoneNumber(l.phone) === normalizedPhone
  ).length > 0;
};

/**
 * Get count of duplicates for a specific phone number
 */
export const getPhoneDuplicateCount = (phone: string, allLeads: Lead[]): number => {
  if (!phone) return 0;
  
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return 0;
  
  return allLeads.filter(lead => 
    lead.phone && 
    normalizePhoneNumber(lead.phone) === normalizedPhone
  ).length;
};
