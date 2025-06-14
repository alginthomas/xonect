import type { Lead } from '@/types/lead';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateField: 'email' | 'phone' | 'both' | null;
  existingLead?: Lead;
}

export interface DuplicateAnalysisResult {
  total: number;
  emailDuplicates: number;
  phoneDuplicates: number;
  bothDuplicates: number;
  recentDuplicates: number; // Duplicates added in last 7 days
}

/**
 * Normalize email for comparison
 */
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Normalize phone number for comparison
 */
export const normalizePhoneForComparison = (phone: string): string => {
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
 * Check if a lead is a duplicate based on email or phone
 */
export const checkForDuplicate = (
  newLead: { email: string; phone?: string },
  existingLeads: Lead[]
): DuplicateCheckResult => {
  const normalizedNewEmail = normalizeEmail(newLead.email);
  const normalizedNewPhone = newLead.phone ? normalizePhoneForComparison(newLead.phone) : '';

  for (const existingLead of existingLeads) {
    const normalizedExistingEmail = normalizeEmail(existingLead.email);
    const normalizedExistingPhone = existingLead.phone ? normalizePhoneForComparison(existingLead.phone) : '';

    const emailMatch = normalizedNewEmail && normalizedNewEmail === normalizedExistingEmail;
    const phoneMatch = normalizedNewPhone && normalizedExistingPhone && normalizedNewPhone === normalizedExistingPhone;

    if (emailMatch && phoneMatch) {
      return {
        isDuplicate: true,
        duplicateField: 'both',
        existingLead
      };
    } else if (emailMatch) {
      return {
        isDuplicate: true,
        duplicateField: 'email',
        existingLead
      };
    } else if (phoneMatch) {
      return {
        isDuplicate: true,
        duplicateField: 'phone',
        existingLead
      };
    }
  }

  return {
    isDuplicate: false,
    duplicateField: null
  };
};

/**
 * Filter out duplicates from a list of leads to be imported
 */
export const filterDuplicatesFromImport = (
  leadsToImport: Array<{ email: string; phone?: string; [key: string]: any }>,
  existingLeads: Lead[]
): {
  uniqueLeads: Array<{ email: string; phone?: string; [key: string]: any }>;
  duplicates: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    duplicateField: 'email' | 'phone' | 'both';
    existingLead: Lead;
  }>;
  withinBatchDuplicates: Array<{ email: string; phone?: string; [key: string]: any }>;
} => {
  const uniqueLeads: Array<{ email: string; phone?: string; [key: string]: any }> = [];
  const duplicates: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    duplicateField: 'email' | 'phone' | 'both';
    existingLead: Lead;
  }> = [];
  const withinBatchDuplicates: Array<{ email: string; phone?: string; [key: string]: any }> = [];

  // Track duplicates within the import batch itself
  const seenInBatch = new Map<string, { email: string; phone?: string; [key: string]: any }>();

  for (const leadToImport of leadsToImport) {
    // Check against existing leads in database
    const duplicateCheck = checkForDuplicate(leadToImport, existingLeads);
    
    if (duplicateCheck.isDuplicate) {
      duplicates.push({
        lead: leadToImport,
        duplicateField: duplicateCheck.duplicateField!,
        existingLead: duplicateCheck.existingLead!
      });
      continue;
    }

    // Check for duplicates within the current import batch
    const normalizedEmail = normalizeEmail(leadToImport.email);
    const normalizedPhone = leadToImport.phone ? normalizePhoneForComparison(leadToImport.phone) : '';
    
    // Create keys for email and phone matching
    const emailKey = `email:${normalizedEmail}`;
    const phoneKey = normalizedPhone ? `phone:${normalizedPhone}` : '';
    
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
    
    if (!isDuplicateInBatch) {
      // Add to unique leads and mark as seen
      uniqueLeads.push(leadToImport);
      if (normalizedEmail) seenInBatch.set(emailKey, leadToImport);
      if (phoneKey) seenInBatch.set(phoneKey, leadToImport);
    }
  }

  return { uniqueLeads, duplicates, withinBatchDuplicates };
};

/**
 * Find all duplicate leads in the database
 */
export const findAllDuplicatesInDatabase = (leads: Lead[]): {
  emailDuplicateGroups: Lead[][];
  phoneDuplicateGroups: Lead[][];
  allDuplicateLeads: Lead[];
} => {
  const emailGroups = new Map<string, Lead[]>();
  const phoneGroups = new Map<string, Lead[]>();
  
  // Group leads by normalized email and phone
  leads.forEach(lead => {
    const normalizedEmail = normalizeEmail(lead.email);
    const normalizedPhone = lead.phone ? normalizePhoneForComparison(lead.phone) : '';
    
    if (normalizedEmail) {
      if (!emailGroups.has(normalizedEmail)) {
        emailGroups.set(normalizedEmail, []);
      }
      emailGroups.get(normalizedEmail)!.push(lead);
    }
    
    if (normalizedPhone) {
      if (!phoneGroups.has(normalizedPhone)) {
        phoneGroups.set(normalizedPhone, []);
      }
      phoneGroups.get(normalizedPhone)!.push(lead);
    }
  });
  
  // Filter to only groups with duplicates
  const emailDuplicateGroups = Array.from(emailGroups.values()).filter(group => group.length > 1);
  const phoneDuplicateGroups = Array.from(phoneGroups.values()).filter(group => group.length > 1);
  
  // Get all duplicate leads (flatten the groups and remove duplicates)
  const allDuplicateLeads = Array.from(new Set([
    ...emailDuplicateGroups.flat(),
    ...phoneDuplicateGroups.flat()
  ]));
  
  return {
    emailDuplicateGroups,
    phoneDuplicateGroups,
    allDuplicateLeads
  };
};

/**
 * Get leads that should be kept vs removed when deduplicating
 */
export const getDeduplicationPlan = (duplicateGroups: Lead[][]): {
  leadsToKeep: Lead[];
  leadsToRemove: Lead[];
} => {
  const leadsToKeep: Lead[] = [];
  const leadsToRemove: Lead[] = [];
  
  duplicateGroups.forEach(group => {
    if (group.length <= 1) return;
    
    // Sort by priority: completeness score, recent activity, status priority
    const statusPriority: Record<string, number> = {
      'Qualified': 10, 'Interested': 9, 'Replied': 8, 'Contacted': 7,
      'Opened': 6, 'Clicked': 5, 'New': 4, 'Call Back': 3,
      'Unresponsive': 2, 'Not Interested': 1, 'Unqualified': 0
    };
    
    const sortedGroup = [...group].sort((a, b) => {
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
    });
    
    // Keep the first (best) lead, mark others for removal
    leadsToKeep.push(sortedGroup[0]);
    leadsToRemove.push(...sortedGroup.slice(1));
  });
  
  return { leadsToKeep, leadsToRemove };
};

/**
 * Generate a unique identifier for a CSV file based on its content
 */
export const generateFileHash = (fileContent: string): string => {
  // Simple hash function for file content
  let hash = 0;
  if (fileContent.length === 0) return hash.toString();
  
  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString();
};

/**
 * Check if a file has been imported before
 */
export const checkFileAlreadyImported = (
  fileContent: string,
  fileName: string,
  importBatches: Array<{ sourceFile?: string; metadata?: Record<string, any> }>
): boolean => {
  const fileHash = generateFileHash(fileContent);
  
  return importBatches.some(batch => {
    // Check by file name
    if (batch.sourceFile === fileName) {
      return true;
    }
    
    // Check by file hash if available in metadata
    if (batch.metadata?.fileHash === fileHash) {
      return true;
    }
    
    return false;
  });
};

/**
 * Get duplicate statistics for reporting
 */
export const getDuplicateStats = (
  duplicates: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    duplicateField: 'email' | 'phone' | 'both';
    existingLead: Lead;
  }>
): DuplicateAnalysisResult => {
  const emailDuplicates = duplicates.filter(d => d.duplicateField === 'email' || d.duplicateField === 'both').length;
  const phoneDuplicates = duplicates.filter(d => d.duplicateField === 'phone' || d.duplicateField === 'both').length;
  const bothDuplicates = duplicates.filter(d => d.duplicateField === 'both').length;
  
  // Count recent duplicates (existing leads created in last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentDuplicates = duplicates.filter(d => 
    new Date(d.existingLead.createdAt) > oneWeekAgo
  ).length;
  
  return {
    total: duplicates.length,
    emailDuplicates,
    phoneDuplicates,
    bothDuplicates,
    recentDuplicates
  };
};

/**
 * Enhanced duplicate prevention for imports
 */
export const preventDuplicateImport = (
  leadsToImport: Array<{ email: string; phone?: string; [key: string]: any }>,
  existingLeads: Lead[],
  strictMode: boolean = false
): {
  allowedLeads: Array<{ email: string; phone?: string; [key: string]: any }>;
  blockedLeads: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    reason: string;
    existingLead?: Lead;
  }>;
  warnings: string[];
} => {
  const allowedLeads: Array<{ email: string; phone?: string; [key: string]: any }> = [];
  const blockedLeads: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    reason: string;
    existingLead?: Lead;
  }> = [];
  const warnings: string[] = [];
  
  const { uniqueLeads, duplicates, withinBatchDuplicates } = filterDuplicatesFromImport(leadsToImport, existingLeads);
  
  // Add unique leads to allowed list
  allowedLeads.push(...uniqueLeads);
  
  // Block duplicates against existing database
  duplicates.forEach(({ lead, duplicateField, existingLead }) => {
    let reason = `Duplicate ${duplicateField} found`;
    
    if (strictMode) {
      // In strict mode, block all duplicates
      const daysSinceCreated = Math.floor(
        (new Date().getTime() - new Date(existingLead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceCreated <= 7) {
        reason += ` (existing lead created ${daysSinceCreated} days ago)`;
      }
    }
    
    blockedLeads.push({
      lead,
      reason,
      existingLead
    });
  });
  
  // Block within-batch duplicates
  withinBatchDuplicates.forEach(lead => {
    blockedLeads.push({
      lead,
      reason: 'Duplicate within import batch'
    });
  });
  
  // Generate warnings
  if (duplicates.length > 0) {
    warnings.push(`${duplicates.length} leads match existing records and will be skipped`);
  }
  
  if (withinBatchDuplicates.length > 0) {
    warnings.push(`${withinBatchDuplicates.length} duplicate leads found within import batch`);
  }
  
  const recentDuplicates = duplicates.filter(({ existingLead }) => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(existingLead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince <= 7;
  }).length;
  
  if (recentDuplicates > 0) {
    warnings.push(`${recentDuplicates} duplicates are recent additions (within 7 days)`);
  }
  
  return {
    allowedLeads,
    blockedLeads,
    warnings
  };
};
