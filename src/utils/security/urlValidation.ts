
/**
 * URL validation and sanitization utilities
 */

// Whitelist of allowed domains for LinkedIn
const LINKEDIN_DOMAINS = [
  'linkedin.com',
  'www.linkedin.com',
  'ca.linkedin.com',
  'uk.linkedin.com',
  'in.linkedin.com'
];

// Common suspicious URL patterns
const SUSPICIOUS_URL_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /ftp:/i,
  /@/,  // Potential username in URL
  /\.\./,  // Directory traversal
];

export const validateLinkedInUrl = (url: string): { isValid: boolean; error?: string; sanitizedUrl?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: true };
  }
  
  const trimmedUrl = url.trim();
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return { isValid: false, error: 'Invalid URL format detected' };
    }
  }
  
  try {
    let processedUrl = trimmedUrl;
    
    // Add protocol if missing
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      if (processedUrl.includes('linkedin.com')) {
        processedUrl = 'https://' + processedUrl;
      } else if (processedUrl.includes('/in/') || processedUrl.includes('/company/')) {
        processedUrl = 'https://www.linkedin.com' + (processedUrl.startsWith('/') ? '' : '/') + processedUrl;
      } else if (!processedUrl.includes('.') && processedUrl.length > 3) {
        processedUrl = 'https://www.linkedin.com/in/' + processedUrl;
      } else {
        return { isValid: false, error: 'Invalid LinkedIn URL format' };
      }
    }
    
    const urlObj = new URL(processedUrl);
    
    // Check if domain is in whitelist
    const isLinkedInDomain = LINKEDIN_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
    
    if (!isLinkedInDomain) {
      return { isValid: false, error: 'URL must be a valid LinkedIn domain' };
    }
    
    // Ensure HTTPS
    if (urlObj.protocol !== 'https:') {
      urlObj.protocol = 'https:';
    }
    
    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateWebsiteUrl = (url: string): { isValid: boolean; error?: string; sanitizedUrl?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: true };
  }
  
  const trimmedUrl = url.trim();
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return { isValid: false, error: 'Invalid URL format detected' };
    }
  }
  
  try {
    let processedUrl = trimmedUrl;
    
    // Add protocol if missing
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      if (processedUrl.includes('.') && !processedUrl.includes(' ') && processedUrl.length > 3) {
        // Remove 'www.' if it's at the beginning without protocol
        if (processedUrl.toLowerCase().startsWith('www.')) {
          processedUrl = processedUrl.substring(4);
        }
        processedUrl = 'https://' + processedUrl;
      } else {
        return { isValid: false, error: 'Invalid website URL format' };
      }
    }
    
    const urlObj = new URL(processedUrl);
    
    // Block localhost and internal IPs for security
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      return { isValid: false, error: 'Internal/localhost URLs not allowed' };
    }
    
    // Ensure valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols allowed' };
    }
    
    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};
