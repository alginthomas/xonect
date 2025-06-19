
import CryptoJS from 'crypto-js';

export interface FileHashResult {
  contentHash: string;
  structureHash: string;
  combinedHash: string;
  userScopedHash: string; // New user-scoped hash
  metadata: {
    rowCount: number;
    columnCount: number;
    columnNames: string[];
    sampleRows: string[];
    userId?: string; // Include user ID in metadata
  };
}

/**
 * Generate enhanced file hash with user-scoped validation
 */
export const generateEnhancedFileHash = (
  csvData: any[], 
  fileName: string, 
  userId?: string
): FileHashResult => {
  // Sort and normalize CSV data for consistent hashing
  const normalizedData = csvData.map(row => {
    const normalizedRow: Record<string, string> = {};
    Object.keys(row).sort().forEach(key => {
      normalizedRow[key.toLowerCase().trim()] = String(row[key] || '').toLowerCase().trim();
    });
    return normalizedRow;
  });

  // Content hash - based on actual data values
  const contentString = JSON.stringify(normalizedData);
  const contentHash = CryptoJS.SHA256(contentString).toString();

  // Structure hash - based on column names and data types
  const columnNames = Object.keys(csvData[0] || {}).sort();
  const structureString = columnNames.join('|') + '|' + csvData.length;
  const structureHash = CryptoJS.SHA256(structureString).toString();

  // Combined hash for overall file identification
  const combinedString = `${fileName}|${contentHash}|${structureHash}`;
  const combinedHash = CryptoJS.SHA256(combinedString).toString();

  // User-scoped hash - includes user ID for per-user deduplication
  const userScopedString = `${userId || 'anonymous'}|${fileName}|${contentHash}|${structureHash}`;
  const userScopedHash = CryptoJS.SHA256(userScopedString).toString();

  // Extract sample rows for comparison
  const sampleRows = csvData.slice(0, 3).map(row => 
    Object.values(row).slice(0, 5).join('|')
  );

  return {
    contentHash,
    structureHash,
    combinedHash,
    userScopedHash,
    metadata: {
      rowCount: csvData.length,
      columnCount: columnNames.length,
      columnNames,
      sampleRows,
      userId
    }
  };
};

/**
 * Check if two files are similar based on their hashes (user-scoped)
 */
export const areFilesSimilar = (
  hash1: FileHashResult, 
  hash2: FileHashResult,
  checkUserScope: boolean = true
): {
  isIdentical: boolean;
  isSimilar: boolean;
  similarityScore: number;
  reasons: string[];
  userScopeMatch: boolean;
} => {
  const reasons: string[] = [];
  let similarityScore = 0;

  // Check user scope first if enabled
  const userScopeMatch = !checkUserScope || 
    (hash1.metadata.userId === hash2.metadata.userId);

  if (checkUserScope && !userScopeMatch) {
    return { 
      isIdentical: false, 
      isSimilar: false, 
      similarityScore: 0, 
      reasons: ['Different users - no deduplication needed'],
      userScopeMatch: false
    };
  }

  // Check for identical content (user-scoped)
  const isIdentical = checkUserScope ? 
    hash1.userScopedHash === hash2.userScopedHash :
    hash1.combinedHash === hash2.combinedHash;

  if (isIdentical) {
    return { 
      isIdentical: true, 
      isSimilar: true, 
      similarityScore: 1, 
      reasons: ['Identical file content'], 
      userScopeMatch
    };
  }

  // Check structure similarity
  if (hash1.structureHash === hash2.structureHash) {
    similarityScore += 0.3;
    reasons.push('Same structure (columns and row count)');
  }

  // Check column names similarity
  const commonColumns = hash1.metadata.columnNames.filter(col => 
    hash2.metadata.columnNames.includes(col)
  );
  const columnSimilarity = commonColumns.length / Math.max(
    hash1.metadata.columnNames.length, 
    hash2.metadata.columnNames.length
  );
  if (columnSimilarity > 0.8) {
    similarityScore += 0.2;
    reasons.push(`Similar column structure (${(columnSimilarity * 100).toFixed(0)}% match)`);
  }

  // Check sample rows similarity
  const commonSampleRows = hash1.metadata.sampleRows.filter(row => 
    hash2.metadata.sampleRows.includes(row)
  );
  if (commonSampleRows.length > 0) {
    similarityScore += 0.3;
    reasons.push(`${commonSampleRows.length} matching sample rows`);
  }

  // Check row count similarity
  const rowCountDiff = Math.abs(hash1.metadata.rowCount - hash2.metadata.rowCount);
  const maxRows = Math.max(hash1.metadata.rowCount, hash2.metadata.rowCount);
  if (rowCountDiff / maxRows < 0.1) {
    similarityScore += 0.2;
    reasons.push('Similar row counts');
  }

  const isSimilar = similarityScore > 0.7;

  return { isIdentical, isSimilar, similarityScore, reasons, userScopeMatch };
};

/**
 * Check for duplicate files by a specific user
 */
export const checkUserScopedDuplicates = (
  newFileHash: FileHashResult,
  existingHashes: FileHashResult[],
  userId: string
): {
  isDuplicate: boolean;
  duplicateHash?: FileHashResult;
  similarity?: number;
} => {
  // Filter existing hashes to only include files from the same user
  const userHashes = existingHashes.filter(hash => 
    hash.metadata.userId === userId
  );

  for (const existingHash of userHashes) {
    const comparison = areFilesSimilar(newFileHash, existingHash, true);
    
    if (comparison.isIdentical) {
      return {
        isDuplicate: true,
        duplicateHash: existingHash,
        similarity: 1.0
      };
    }
    
    if (comparison.isSimilar && comparison.similarityScore > 0.9) {
      return {
        isDuplicate: true,
        duplicateHash: existingHash,
        similarity: comparison.similarityScore
      };
    }
  }

  return { isDuplicate: false };
};
