
import CryptoJS from 'crypto-js';

export interface FileHashResult {
  contentHash: string;
  structureHash: string;
  combinedHash: string;
  metadata: {
    rowCount: number;
    columnCount: number;
    columnNames: string[];
    sampleRows: string[];
  };
}

/**
 * Generate enhanced file hash with multiple validation layers
 */
export const generateEnhancedFileHash = (csvData: any[], fileName: string): FileHashResult => {
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

  // Extract sample rows for comparison
  const sampleRows = csvData.slice(0, 3).map(row => 
    Object.values(row).slice(0, 5).join('|')
  );

  return {
    contentHash,
    structureHash,
    combinedHash,
    metadata: {
      rowCount: csvData.length,
      columnCount: columnNames.length,
      columnNames,
      sampleRows
    }
  };
};

/**
 * Check if two files are similar based on their hashes
 */
export const areFilesSimilar = (hash1: FileHashResult, hash2: FileHashResult): {
  isIdentical: boolean;
  isSimilar: boolean;
  similarityScore: number;
  reasons: string[];
} => {
  const reasons: string[] = [];
  let similarityScore = 0;

  // Check for identical content
  const isIdentical = hash1.combinedHash === hash2.combinedHash;
  if (isIdentical) {
    return { isIdentical: true, isSimilar: true, similarityScore: 1, reasons: ['Identical file content'] };
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

  return { isIdentical, isSimilar, similarityScore, reasons };
};
