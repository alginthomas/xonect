
import type { Lead } from '@/types/lead';

/**
 * Calculate Levenshtein distance between two strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Advanced email normalization with fuzzy matching
 */
export const normalizeEmailAdvanced = (email: string): string => {
  if (!email) return '';
  
  let normalized = email.toLowerCase().trim();
  
  // Remove dots from Gmail addresses (gmail treats them the same)
  if (normalized.includes('@gmail.com')) {
    const [localPart, domain] = normalized.split('@');
    normalized = localPart.replace(/\./g, '') + '@' + domain;
  }
  
  // Remove plus addressing (everything after +)
  normalized = normalized.replace(/\+.*?@/, '@');
  
  return normalized;
};

/**
 * Advanced name matching with fuzzy logic
 */
export const matchNames = (name1: string, name2: string, threshold: number = 0.8): boolean => {
  if (!name1 || !name2) return false;
  
  const normalize = (name: string) => name.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match
  if (n1 === n2) return true;
  
  // Split into parts and check combinations
  const parts1 = n1.split(/\s+/);
  const parts2 = n2.split(/\s+/);
  
  // Check if any combination of name parts matches
  for (const part1 of parts1) {
    for (const part2 of parts2) {
      if (part1.length > 2 && part2.length > 2) {
        const similarity = calculateSimilarity(part1, part2);
        if (similarity >= threshold) return true;
      }
    }
  }
  
  return false;
};

/**
 * Enhanced duplicate detection with multiple criteria and confidence scoring
 */
export interface DuplicateMatch {
  lead: Lead;
  matchType: 'email' | 'phone' | 'name_company' | 'fuzzy_email' | 'fuzzy_name';
  confidence: number;
  similarity: number;
  existingLead: Lead;
}

export const findAdvancedDuplicates = (
  newLead: Partial<Lead>,
  existingLeads: Lead[],
  options: {
    emailThreshold?: number;
    nameThreshold?: number;
    phoneThreshold?: number;
    includeNameCompanyMatch?: boolean;
  } = {}
): DuplicateMatch[] => {
  const {
    emailThreshold = 0.9,
    nameThreshold = 0.8,
    phoneThreshold = 0.95,
    includeNameCompanyMatch = true
  } = options;
  
  const matches: DuplicateMatch[] = [];
  
  const newEmail = normalizeEmailAdvanced(newLead.email || '');
  const newPhone = newLead.phone?.replace(/\D/g, '') || '';
  const newFullName = `${newLead.firstName || ''} ${newLead.lastName || ''}`.trim();
  const newCompany = newLead.company?.toLowerCase().trim() || '';
  
  for (const existingLead of existingLeads) {
    const existingEmail = normalizeEmailAdvanced(existingLead.email);
    const existingPhone = existingLead.phone?.replace(/\D/g, '') || '';
    const existingFullName = `${existingLead.firstName} ${existingLead.lastName}`.trim();
    const existingCompany = existingLead.company.toLowerCase().trim();
    
    // Exact email match
    if (newEmail && existingEmail && newEmail === existingEmail) {
      matches.push({
        lead: newLead as Lead,
        matchType: 'email',
        confidence: 1.0,
        similarity: 1.0,
        existingLead
      });
      continue;
    }
    
    // Exact phone match
    if (newPhone && existingPhone && newPhone === existingPhone && newPhone.length >= 10) {
      matches.push({
        lead: newLead as Lead,
        matchType: 'phone',
        confidence: 1.0,
        similarity: 1.0,
        existingLead
      });
      continue;
    }
    
    // Fuzzy email match
    if (newEmail && existingEmail) {
      const emailSimilarity = calculateSimilarity(newEmail, existingEmail);
      if (emailSimilarity >= emailThreshold) {
        matches.push({
          lead: newLead as Lead,
          matchType: 'fuzzy_email',
          confidence: emailSimilarity,
          similarity: emailSimilarity,
          existingLead
        });
        continue;
      }
    }
    
    // Name + Company match
    if (includeNameCompanyMatch && newFullName && existingFullName && newCompany && existingCompany) {
      const nameMatch = matchNames(newFullName, existingFullName, nameThreshold);
      const companySimilarity = calculateSimilarity(newCompany, existingCompany);
      
      if (nameMatch && companySimilarity >= 0.8) {
        const confidence = (nameThreshold + companySimilarity) / 2;
        matches.push({
          lead: newLead as Lead,
          matchType: 'name_company',
          confidence,
          similarity: companySimilarity,
          existingLead
        });
        continue;
      }
    }
    
    // Fuzzy name match (same company)
    if (newFullName && existingFullName && newCompany && existingCompany === newCompany) {
      const nameSimilarity = calculateSimilarity(newFullName, existingFullName);
      if (nameSimilarity >= nameThreshold) {
        matches.push({
          lead: newLead as Lead,
          matchType: 'fuzzy_name',
          confidence: nameSimilarity,
          similarity: nameSimilarity,
          existingLead
        });
      }
    }
  }
  
  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Smart lead merging with field-level intelligence
 */
export const mergeLeads = (leads: Lead[]): Lead => {
  if (leads.length === 0) throw new Error('No leads to merge');
  if (leads.length === 1) return leads[0];
  
  // Priority rules for selecting best value for each field
  const selectBestValue = (field: keyof Lead, values: any[]): any => {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (nonEmptyValues.length === 0) return values[0];
    if (nonEmptyValues.length === 1) return nonEmptyValues[0];
    
    switch (field) {
      case 'email':
        // Prefer business emails over personal ones
        return nonEmptyValues.find(email => 
          !email.includes('gmail.com') && 
          !email.includes('yahoo.com') && 
          !email.includes('hotmail.com')
        ) || nonEmptyValues[0];
        
      case 'phone':
        // Prefer longer phone numbers (likely more complete)
        return nonEmptyValues.sort((a, b) => b.length - a.length)[0];
        
      case 'linkedin':
        // Prefer complete LinkedIn URLs
        return nonEmptyValues.find(url => url.includes('linkedin.com/in/')) || nonEmptyValues[0];
        
      case 'status':
        // Prefer more advanced statuses
        const statusPriority: Record<string, number> = {
          'Qualified': 10, 'Interested': 9, 'Replied': 8, 'Contacted': 7,
          'Opened': 6, 'Clicked': 5, 'New': 4, 'Call Back': 3,
          'Unresponsive': 2, 'Not Interested': 1, 'Unqualified': 0
        };
        return nonEmptyValues.sort((a, b) => 
          (statusPriority[b] || 0) - (statusPriority[a] || 0)
        )[0];
        
      case 'completenessScore':
      case 'emailsSent':
        // Prefer higher numbers
        return Math.max(...nonEmptyValues);
        
      case 'createdAt':
      case 'lastContactDate':
        // Prefer most recent
        return new Date(Math.max(...nonEmptyValues.map(d => new Date(d).getTime())));
        
      default:
        // For other fields, prefer the most complete value
        return nonEmptyValues.sort((a, b) => 
          String(b).length - String(a).length
        )[0];
    }
  };
  
  // Get the lead with highest priority as base
  const baseLead = leads.sort((a, b) => {
    // Sort by completeness score, then by status priority, then by recent activity
    if (a.completenessScore !== b.completenessScore) {
      return b.completenessScore - a.completenessScore;
    }
    
    const statusPriority: Record<string, number> = {
      'Qualified': 10, 'Interested': 9, 'Replied': 8, 'Contacted': 7,
      'Opened': 6, 'Clicked': 5, 'New': 4, 'Call Back': 3,
      'Unresponsive': 2, 'Not Interested': 1, 'Unqualified': 0
    };
    
    const aPriority = statusPriority[a.status] || 0;
    const bPriority = statusPriority[b.status] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    const aDate = a.lastContactDate || a.createdAt;
    const bDate = b.lastContactDate || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  })[0];
  
  // Merge all fields intelligently
  const mergedLead: Lead = { ...baseLead };
  
  // Get all field keys
  const allFields = new Set<keyof Lead>();
  leads.forEach(lead => {
    Object.keys(lead).forEach(key => allFields.add(key as keyof Lead));
  });
  
  // Merge each field
  allFields.forEach(field => {
    const values = leads.map(lead => lead[field]);
    mergedLead[field] = selectBestValue(field, values) as any;
  });
  
  // Merge arrays (tags, remarks history, activity log)
  mergedLead.tags = [...new Set(leads.flatMap(lead => lead.tags || []))];
  
  // Merge remarks history
  const allRemarks = leads.flatMap(lead => lead.remarksHistory || []);
  mergedLead.remarksHistory = allRemarks.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Merge activity log
  const allActivity = leads.flatMap(lead => lead.activityLog || []);
  mergedLead.activityLog = allActivity.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Sum up emails sent
  mergedLead.emailsSent = leads.reduce((sum, lead) => sum + (lead.emailsSent || 0), 0);
  
  return mergedLead;
};

/**
 * Generate duplicate detection report
 */
export interface DuplicateReport {
  totalLeads: number;
  duplicateGroups: number;
  totalDuplicates: number;
  duplicatesByType: Record<string, number>;
  qualityScore: number;
  recommendations: string[];
}

export const generateDuplicateReport = (leads: Lead[]): DuplicateReport => {
  const duplicateMatches: DuplicateMatch[] = [];
  const processedIds = new Set<string>();
  
  // Find all duplicates
  leads.forEach(lead => {
    if (processedIds.has(lead.id)) return;
    
    const matches = findAdvancedDuplicates(lead, leads.filter(l => l.id !== lead.id));
    matches.forEach(match => {
      if (!processedIds.has(match.existingLead.id)) {
        duplicateMatches.push(match);
        processedIds.add(match.existingLead.id);
      }
    });
    processedIds.add(lead.id);
  });
  
  // Group by match type
  const duplicatesByType: Record<string, number> = {};
  duplicateMatches.forEach(match => {
    duplicatesByType[match.matchType] = (duplicatesByType[match.matchType] || 0) + 1;
  });
  
  // Calculate quality score (0-100)
  const duplicateRate = duplicateMatches.length / leads.length;
  const qualityScore = Math.max(0, Math.min(100, (1 - duplicateRate) * 100));
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (duplicatesByType.email > 0) {
    recommendations.push(`Found ${duplicatesByType.email} email duplicates - consider merging similar records`);
  }
  if (duplicatesByType.phone > 0) {
    recommendations.push(`Found ${duplicatesByType.phone} phone duplicates - review phone number formatting`);
  }
  if (duplicatesByType.name_company > 0) {
    recommendations.push(`Found ${duplicatesByType.name_company} name+company duplicates - potential data entry variations`);
  }
  if (qualityScore < 80) {
    recommendations.push('Database quality is below optimal - consider running a cleanup process');
  }
  
  return {
    totalLeads: leads.length,
    duplicateGroups: duplicateMatches.length,
    totalDuplicates: duplicateMatches.length,
    duplicatesByType,
    qualityScore,
    recommendations
  };
};
