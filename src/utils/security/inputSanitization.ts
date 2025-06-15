
/**
 * Input sanitization utilities for security
 */

// HTML/XSS sanitization
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous HTML tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
};

// Email template variable sanitization
export const sanitizeTemplateVariable = (value: string): string => {
  if (!value) return '';
  
  // Basic HTML sanitization for template variables
  return sanitizeHtml(value);
};

// CSV content validation
export const validateCSVContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('CSV content is empty');
    return { isValid: false, errors };
  }
  
  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /@import/i,
    /expression\s*\(/i
  ];
  
  suspiciousPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      errors.push(`Potentially malicious content detected (pattern ${index + 1})`);
    }
  });
  
  // Check file size (approximate)
  const sizeInMB = new Blob([content]).size / (1024 * 1024);
  if (sizeInMB > 10) {
    errors.push('CSV file too large (max 10MB)');
  }
  
  return { isValid: errors.length === 0, errors };
};

// General input validation
export const validateInput = (input: string, maxLength: number = 1000): { isValid: boolean; error?: string } => {
  if (!input) return { isValid: true };
  
  if (input.length > maxLength) {
    return { isValid: false, error: `Input too long (max ${maxLength} characters)` };
  }
  
  // Check for null bytes and other control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input)) {
    return { isValid: false, error: 'Invalid characters detected' };
  }
  
  return { isValid: true };
};
