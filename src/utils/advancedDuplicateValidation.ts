
import type { Lead } from '@/types/lead';
import { findAdvancedDuplicates } from './advancedDuplicateDetection';

export interface DuplicateDetail {
  lead: any;
  matchedAgainst: Lead;
  confidence: number;
  matchType: string;
  reason: string;
}

export interface DuplicateValidationResult {
  isValid: boolean;
  duplicateCount: number;
  canProceed: boolean;
  recommendations: string[];
  duplicateDetails: {
    withinFile: DuplicateDetail[];
    againstDatabase: DuplicateDetail[];
  };
  summary: {
    totalRows: number;
    duplicatesFound: number;
    uniqueRows: number;
    highConfidenceMatches: number;
    mediumConfidenceMatches: number;
    lowConfidenceMatches: number;
  };
}

export const validateForDuplicates = (
  csvData: any[],
  existingLeads: Lead[],
  strictMode: boolean = false,
  userId?: string
): DuplicateValidationResult => {
  console.log('🔍 Advanced duplicate validation starting:', {
    csvRows: csvData.length,
    existingLeads: existingLeads.length,
    strictMode,
    userId
  });

  const duplicateDetails: {
    withinFile: DuplicateDetail[];
    againstDatabase: DuplicateDetail[];
  } = {
    withinFile: [],
    againstDatabase: []
  };

  // Filter existing leads by user if userId is provided
  const userExistingLeads = userId ? existingLeads.filter(lead => lead.userId === userId) : existingLeads;

  // Check each CSV row against existing database leads (user-scoped)
  csvData.forEach((row, index) => {
    const potentialLead = {
      firstName: row.first_name || row.firstName || '',
      lastName: row.last_name || row.lastName || '', 
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || ''
    };

    const matches = findAdvancedDuplicates(potentialLead, userExistingLeads, {
      emailThreshold: strictMode ? 0.95 : 0.85,
      nameThreshold: strictMode ? 0.9 : 0.8,
      phoneThreshold: strictMode ? 0.95 : 0.9,
      includeNameCompanyMatch: true
    });

    matches.forEach(match => {
      duplicateDetails.againstDatabase.push({
        lead: { ...row, _csvIndex: index },
        matchedAgainst: match.existingLead,
        confidence: match.confidence,
        matchType: match.matchType,
        reason: `Row ${index + 1}: ${match.matchType} match with confidence ${(match.confidence * 100).toFixed(1)}%`
      });
    });
  });

  // Check for duplicates within the CSV file itself
  const seenEmails = new Map<string, number>();
  const seenPhones = new Map<string, number>();
  const seenNameCompany = new Map<string, number>();

  csvData.forEach((row, index) => {
    const email = (row.email || '').toLowerCase().trim();
    const phone = (row.phone || '').replace(/\D/g, '');
    const nameCompany = `${(row.first_name || '').toLowerCase()}-${(row.last_name || '').toLowerCase()}-${(row.company || '').toLowerCase()}`;

    // Check email duplicates within file
    if (email && seenEmails.has(email)) {
      const originalIndex = seenEmails.get(email)!;
      duplicateDetails.withinFile.push({
        lead: { ...row, _csvIndex: index },
        matchedAgainst: csvData[originalIndex] as any,
        confidence: 1.0,
        matchType: 'email',
        reason: `Row ${index + 1} has duplicate email with row ${originalIndex + 1}`
      });
    } else if (email) {
      seenEmails.set(email, index);
    }

    // Check phone duplicates within file
    if (phone && phone.length >= 7 && seenPhones.has(phone)) {
      const originalIndex = seenPhones.get(phone)!;
      duplicateDetails.withinFile.push({
        lead: { ...row, _csvIndex: index },
        matchedAgainst: csvData[originalIndex] as any,
        confidence: 1.0,
        matchType: 'phone',
        reason: `Row ${index + 1} has duplicate phone with row ${originalIndex + 1}`
      });
    } else if (phone && phone.length >= 7) {
      seenPhones.set(phone, index);
    }

    // Check name+company duplicates within file
    if (nameCompany && seenNameCompany.has(nameCompany)) {
      const originalIndex = seenNameCompany.get(nameCompany)!;
      duplicateDetails.withinFile.push({
        lead: { ...row, _csvIndex: index },
        matchedAgainst: csvData[originalIndex] as any,
        confidence: 1.0,
        matchType: 'name_company',
        reason: `Row ${index + 1} has duplicate name+company with row ${originalIndex + 1}`
      });
    } else if (nameCompany) {
      seenNameCompany.set(nameCompany, index);
    }
  });

  const totalDuplicates = duplicateDetails.withinFile.length + duplicateDetails.againstDatabase.length;
  const uniqueRows = csvData.length - duplicateDetails.withinFile.length;

  const highConfidenceMatches = duplicateDetails.againstDatabase.filter(d => d.confidence >= 0.9).length;
  const mediumConfidenceMatches = duplicateDetails.againstDatabase.filter(d => d.confidence >= 0.7 && d.confidence < 0.9).length;
  const lowConfidenceMatches = duplicateDetails.againstDatabase.filter(d => d.confidence < 0.7).length;

  const recommendations: string[] = [];
  
  if (duplicateDetails.withinFile.length > 0) {
    recommendations.push(`Found ${duplicateDetails.withinFile.length} duplicate(s) within the CSV file. Consider cleaning the file before import.`);
  }
  
  if (highConfidenceMatches > 0) {
    recommendations.push(`${highConfidenceMatches} high-confidence duplicate(s) found against existing data. Review these carefully.`);
  }
  
  if (mediumConfidenceMatches > 0) {
    recommendations.push(`${mediumConfidenceMatches} medium-confidence potential duplicate(s) found. Manual review recommended.`);
  }

  if (strictMode && totalDuplicates > 0) {
    recommendations.push('Strict mode is enabled. Consider resolving duplicates before proceeding.');
  }

  const canProceed = strictMode ? totalDuplicates === 0 : true;

  console.log('✅ Advanced validation completed:', {
    totalDuplicates,
    uniqueRows,
    canProceed,
    highConfidenceMatches,
    mediumConfidenceMatches,
    lowConfidenceMatches,
    userId
  });

  return {
    isValid: totalDuplicates === 0,
    duplicateCount: totalDuplicates,
    canProceed,
    recommendations,
    duplicateDetails,
    summary: {
      totalRows: csvData.length,
      duplicatesFound: totalDuplicates,
      uniqueRows,
      highConfidenceMatches,
      mediumConfidenceMatches,
      lowConfidenceMatches
    }
  };
};
