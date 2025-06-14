
import { normalizeEmail, normalizePhoneForComparison } from './duplicateDetection';
import type { Lead } from '@/types/lead';

export interface DuplicateValidationResult {
  isValid: boolean;
  duplicateCount: number;
  duplicateDetails: {
    withinFile: DuplicateDetail[];
    againstDatabase: DuplicateDetail[];
  };
  recommendations: string[];
  canProceed: boolean;
}

export interface DuplicateDetail {
  index: number;
  lead: any;
  duplicateType: 'email' | 'phone' | 'name_company' | 'fuzzy_match';
  confidence: number;
  matchedWith?: Lead | any;
  reason: string;
}

/**
 * Advanced duplicate validation with detailed reporting
 */
export const validateForDuplicates = (
  csvData: any[],
  existingLeads: Lead[],
  strictMode: boolean = false
): DuplicateValidationResult => {
  const duplicateDetails = {
    withinFile: [] as DuplicateDetail[],
    againstDatabase: [] as DuplicateDetail[]
  };
  const recommendations: string[] = [];

  // Check for duplicates within the file
  const withinFileResults = findDuplicatesWithinFile(csvData);
  duplicateDetails.withinFile = withinFileResults;

  // Check against existing database
  const againstDbResults = findDuplicatesAgainstDatabase(csvData, existingLeads, strictMode);
  duplicateDetails.againstDatabase = againstDbResults;

  const totalDuplicates = withinFileResults.length + againstDbResults.length;

  // Generate recommendations
  if (withinFileResults.length > 0) {
    recommendations.push(`Found ${withinFileResults.length} duplicate(s) within the file`);
  }
  
  if (againstDbResults.length > 0) {
    recommendations.push(`Found ${againstDbResults.length} duplicate(s) against existing leads`);
  }

  if (totalDuplicates > csvData.length * 0.3) {
    recommendations.push('High duplicate rate detected - consider reviewing data source');
  }

  if (strictMode && totalDuplicates > 0) {
    recommendations.push('Strict mode enabled - all duplicates will be rejected');
  }

  const canProceed = !strictMode || totalDuplicates === 0;
  const isValid = totalDuplicates < csvData.length;

  return {
    isValid,
    duplicateCount: totalDuplicates,
    duplicateDetails,
    recommendations,
    canProceed
  };
};

const findDuplicatesWithinFile = (csvData: any[]): DuplicateDetail[] => {
  const duplicates: DuplicateDetail[] = [];
  const seen = new Map<string, number>();

  csvData.forEach((row, index) => {
    const email = normalizeEmail(row.email || row.Email || '');
    const phone = normalizePhoneForComparison(row.phone || row.Phone || '');
    const nameCompany = `${(row.first_name || row['First Name'] || '').toLowerCase()}-${(row.last_name || row['Last Name'] || '').toLowerCase()}-${(row.company || row.Company || '').toLowerCase()}`;

    // Check email duplicates
    if (email) {
      const emailKey = `email:${email}`;
      if (seen.has(emailKey)) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'email',
          confidence: 1.0,
          reason: `Duplicate email found at row ${seen.get(emailKey)! + 1}`,
          matchedWith: csvData[seen.get(emailKey)!]
        });
      } else {
        seen.set(emailKey, index);
      }
    }

    // Check phone duplicates
    if (phone) {
      const phoneKey = `phone:${phone}`;
      if (seen.has(phoneKey)) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'phone',
          confidence: 1.0,
          reason: `Duplicate phone found at row ${seen.get(phoneKey)! + 1}`,
          matchedWith: csvData[seen.get(phoneKey)!]
        });
      } else {
        seen.set(phoneKey, index);
      }
    }

    // Check name + company duplicates
    if (nameCompany && nameCompany !== '--') {
      const nameKey = `name:${nameCompany}`;
      if (seen.has(nameKey)) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'name_company',
          confidence: 0.9,
          reason: `Duplicate name and company found at row ${seen.get(nameKey)! + 1}`,
          matchedWith: csvData[seen.get(nameKey)!]
        });
      } else {
        seen.set(nameKey, index);
      }
    }
  });

  return duplicates;
};

const findDuplicatesAgainstDatabase = (
  csvData: any[],
  existingLeads: Lead[],
  strictMode: boolean
): DuplicateDetail[] => {
  const duplicates: DuplicateDetail[] = [];

  csvData.forEach((row, index) => {
    const email = normalizeEmail(row.email || row.Email || '');
    const phone = normalizePhoneForComparison(row.phone || row.Phone || '');
    const firstName = (row.first_name || row['First Name'] || '').toLowerCase();
    const lastName = (row.last_name || row['Last Name'] || '').toLowerCase();
    const company = (row.company || row.Company || '').toLowerCase();

    for (const existingLead of existingLeads) {
      const existingEmail = normalizeEmail(existingLead.email);
      const existingPhone = normalizePhoneForComparison(existingLead.phone || '');
      const existingFirstName = existingLead.firstName.toLowerCase();
      const existingLastName = existingLead.lastName.toLowerCase();
      const existingCompany = existingLead.company.toLowerCase();

      // Email match
      if (email && email === existingEmail) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'email',
          confidence: 1.0,
          reason: 'Email already exists in database',
          matchedWith: existingLead
        });
        break; // One match per row is enough
      }

      // Phone match
      if (phone && phone === existingPhone) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'phone',
          confidence: 1.0,
          reason: 'Phone number already exists in database',
          matchedWith: existingLead
        });
        break;
      }

      // Name + company match
      if (firstName && lastName && company &&
          firstName === existingFirstName &&
          lastName === existingLastName &&
          company === existingCompany) {
        duplicates.push({
          index,
          lead: row,
          duplicateType: 'name_company',
          confidence: 0.95,
          reason: 'Name and company combination already exists',
          matchedWith: existingLead
        });
        break;
      }

      // Fuzzy matching in strict mode
      if (strictMode) {
        const nameSimilarity = calculateNameSimilarity(
          `${firstName} ${lastName}`,
          `${existingFirstName} ${existingLastName}`
        );
        
        if (nameSimilarity > 0.85 && company === existingCompany) {
          duplicates.push({
            index,
            lead: row,
            duplicateType: 'fuzzy_match',
            confidence: nameSimilarity,
            reason: `Similar name (${(nameSimilarity * 100).toFixed(0)}% match) with same company`,
            matchedWith: existingLead
          });
          break;
        }
      }
    }
  });

  return duplicates;
};

const calculateNameSimilarity = (name1: string, name2: string): number => {
  const words1 = name1.toLowerCase().split(' ').filter(w => w.length > 0);
  const words2 = name2.toLowerCase().split(' ').filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  const maxWords = Math.max(words1.length, words2.length);
  
  words1.forEach(word1 => {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  });
  
  return matches / maxWords;
};
