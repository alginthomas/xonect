import type { Lead } from '@/types/lead';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateField: 'email' | 'phone' | 'both' | null;
  existingLead?: Lead;
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
} => {
  const uniqueLeads: Array<{ email: string; phone?: string; [key: string]: any }> = [];
  const duplicates: Array<{
    lead: { email: string; phone?: string; [key: string]: any };
    duplicateField: 'email' | 'phone' | 'both';
    existingLead: Lead;
  }> = [];

  // Also track duplicates within the import batch itself
  const seenInBatch = new Set<string>();

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
    const batchKey = `${normalizeEmail(leadToImport.email)}_${leadToImport.phone ? normalizePhoneForComparison(leadToImport.phone) : ''}`;
    
    if (seenInBatch.has(batchKey)) {
      // This is a duplicate within the batch itself
      continue;
    }

    seenInBatch.add(batchKey);
    uniqueLeads.push(leadToImport);
  }

  return { uniqueLeads, duplicates };
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
) => {
  const emailDuplicates = duplicates.filter(d => d.duplicateField === 'email' || d.duplicateField === 'both').length;
  const phoneDuplicates = duplicates.filter(d => d.duplicateField === 'phone' || d.duplicateField === 'both').length;
  const bothDuplicates = duplicates.filter(d => d.duplicateField === 'both').length;
  
  return {
    total: duplicates.length,
    emailDuplicates,
    phoneDuplicates,
    bothDuplicates
  };
};