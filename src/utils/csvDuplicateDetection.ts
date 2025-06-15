
import type { Lead } from '@/types/lead';
import { normalizeEmail, normalizePhoneForComparison } from './duplicateDetection';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason: string;
  existingLead?: Lead;
}

export const checkForCSVDuplicate = (
  newLead: { first_name: string; last_name: string; email: string; phone?: string; company: string },
  existingLeads: Lead[],
  userId?: string
): DuplicateCheckResult => {
  const normalizedNewEmail = normalizeEmail(newLead.email);
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

    // Check name + company match (fuzzy matching)
    const nameCompanyMatch = 
      newLead.first_name.toLowerCase().trim() === existingLead.firstName?.toLowerCase().trim() &&
      newLead.last_name.toLowerCase().trim() === existingLead.lastName?.toLowerCase().trim() &&
      newLead.company.toLowerCase().trim() === existingLead.company?.toLowerCase().trim();

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

export const filterDuplicatesFromCSV = (
  leadsToImport: Array<{ first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }>,
  existingLeads: Lead[],
  userId?: string
): {
  uniqueLeads: Array<{ first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }>;
  duplicates: Array<{
    lead: { first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any };
    reason: string;
    existingLead?: Lead;
  }>;
  withinBatchDuplicates: Array<{ first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }>;
} => {
  const uniqueLeads: Array<{ first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }> = [];
  const duplicates: Array<{
    lead: { first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any };
    reason: string;
    existingLead?: Lead;
  }> = [];
  const withinBatchDuplicates: Array<{ first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }> = [];

  // Track duplicates within the import batch itself
  const seenInBatch = new Map<string, { first_name: string; last_name: string; email: string; phone?: string; company: string; [key: string]: any }>();

  for (const leadToImport of leadsToImport) {
    // Check against existing leads in database (user-scoped)
    const duplicateCheck = checkForCSVDuplicate(leadToImport, existingLeads, userId);
    
    if (duplicateCheck.isDuplicate) {
      duplicates.push({
        lead: leadToImport,
        reason: duplicateCheck.reason,
        existingLead: duplicateCheck.existingLead
      });
      continue;
    }

    // Check for duplicates within the current import batch
    const normalizedEmail = normalizeEmail(leadToImport.email);
    const normalizedPhone = leadToImport.phone ? normalizePhoneForComparison(leadToImport.phone) : '';
    
    // Create keys for email and phone matching
    const emailKey = `email:${normalizedEmail}`;
    const phoneKey = normalizedPhone ? `phone:${normalizedPhone}` : '';
    const nameCompanyKey = `name:${leadToImport.first_name.toLowerCase().trim()}-${leadToImport.last_name.toLowerCase().trim()}-${leadToImport.company.toLowerCase().trim()}`;
    
    let isDuplicateInBatch = false;
    
    // Check email duplicates in batch
    if (normalizedEmail && seenInBatch.has(emailKey)) {
      withinBatchDuplicates.push(leadToImport);
      isDuplicateInBatch = true;
    }
    
    // Check phone duplicates in batch
    if (!isDuplicateInBatch && phoneKey && seenInBatch.has(phoneKey)) {
      withinBatchDuplicates.push(leadToImport);
      isDuplicateInBatch = true;
    }

    // Check name + company duplicates in batch
    if (!isDuplicateInBatch && seenInBatch.has(nameCompanyKey)) {
      withinBatchDuplicates.push(leadToImport);
      isDuplicateInBatch = true;
    }
    
    if (!isDuplicateInBatch) {
      // Add to unique leads and mark as seen
      uniqueLeads.push(leadToImport);
      if (normalizedEmail) seenInBatch.set(emailKey, leadToImport);
      if (phoneKey) seenInBatch.set(phoneKey, leadToImport);
      seenInBatch.set(nameCompanyKey, leadToImport);
    }
  }

  return { uniqueLeads, duplicates, withinBatchDuplicates };
};
