
/**
 * Enhanced CSV security utilities
 */

import { validateCSVContent } from './inputSanitization';

// File type validation
export const validateCSVFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check file type
  const allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
  const allowedExtensions = ['.csv', '.txt'];
  
  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidType && !hasValidExtension) {
    errors.push('Invalid file type. Only CSV files are allowed.');
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File too large. Maximum size is 10MB.');
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.com$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.js$/i,
    /\.vbs$/i,
    /\.jar$/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('Suspicious file name detected.');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Content scanning for malicious patterns
export const scanCSVForThreats = async (content: string): Promise<{ isSafe: boolean; threats: string[] }> => {
  const threats: string[] = [];
  
  // Validate content using existing function
  const contentValidation = validateCSVContent(content);
  if (!contentValidation.isValid) {
    threats.push(...contentValidation.errors);
  }
  
  // Check for CSV injection patterns
  const csvInjectionPatterns = [
    /^[=@+\-]/m,  // Formulas starting with =, @, +, -
    /cmd\|/i,
    /powershell/i,
    /\|calc/i,
    /DDE\(/i
  ];
  
  csvInjectionPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      threats.push(`CSV injection pattern detected (${index + 1})`);
    }
  });
  
  // Check for excessive script content
  const scriptTags = (content.match(/<script/gi) || []).length;
  if (scriptTags > 0) {
    threats.push('Script tags found in CSV content');
  }
  
  // Check for data URLs
  if (/data:.*base64/i.test(content)) {
    threats.push('Base64 encoded data URLs found');
  }
  
  return { isSafe: threats.length === 0, threats };
};

// Sanitize CSV row data
export const sanitizeCSVRow = (row: any): any => {
  const sanitizedRow: any = {};
  
  Object.keys(row).forEach(key => {
    const value = row[key];
    if (typeof value === 'string') {
      // Remove potential CSV injection prefixes
      let sanitized = value;
      if (/^[=@+\-]/.test(sanitized)) {
        sanitized = "'" + sanitized; // Prefix with single quote to prevent injection
      }
      
      // Basic HTML sanitization
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      
      sanitizedRow[key] = sanitized;
    } else {
      sanitizedRow[key] = value;
    }
  });
  
  return sanitizedRow;
};
