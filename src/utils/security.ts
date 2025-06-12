
/**
 * Security utilities for input validation and sanitization
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize text input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
};

// Validate CSV data structure with support for company-only imports
export const validateCSVData = (data: any[], importMode: 'full' | 'company' = 'full'): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { isValid: false, errors };
  }

  if (data.length > 10000) {
    errors.push('CSV file too large (max 10,000 rows)');
    return { isValid: false, errors };
  }

  const firstRow = data[0];
  
  if (importMode === 'full') {
    // Check required fields for full contact import
    const requiredFields = ['first_name', 'last_name', 'email', 'company', 'title'];
    
    for (const field of requiredFields) {
      if (!firstRow.hasOwnProperty(field) || !firstRow[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate email addresses
    let invalidEmails = 0;
    for (const row of data.slice(0, 100)) { // Check first 100 rows for performance
      if (row.email && !isValidEmail(row.email)) {
        invalidEmails++;
      }
    }

    if (invalidEmails > 0) {
      errors.push(`Found ${invalidEmails} invalid email addresses in first 100 rows`);
    }
  } else if (importMode === 'company') {
    // Check required fields for company-only import
    const requiredFields = ['organization_name'];
    
    for (const field of requiredFields) {
      if (!firstRow.hasOwnProperty(field) || !firstRow[field]) {
        errors.push(`Missing required field for company import: ${field}`);
      }
    }

    // Check if we have some useful company data
    const companyFields = ['organization_phone', 'organization_city', 'location', 'phone', 'city'];
    const hasAdditionalData = companyFields.some(field => 
      firstRow.hasOwnProperty(field) && firstRow[field]
    );

    if (!hasAdditionalData) {
      errors.push('Company import should include at least phone or location information');
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Rate limiting check (client-side)
export const shouldThrottleRequest = (lastRequestTime: number, minInterval: number = 1000): boolean => {
  return Date.now() - lastRequestTime < minInterval;
};

// Generate secure random string
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

// Validate user permissions
export const hasPermission = (user: any, requiredRole: string): boolean => {
  if (!user) return false;
  // This would be extended with actual role checking logic
  return true; // For now, all authenticated users have permissions
};
