
import type { Lead } from '@/types/lead';

export const mapCSVToLead = (csvRow: any, categoryId?: string, importBatchId?: string, userId?: string) => {
  // Enhanced CSV field mapping with more flexible column name matching
  const getFieldValue = (possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (csvRow[name] !== undefined && csvRow[name] !== null && csvRow[name] !== '') {
        return String(csvRow[name]).trim();
      }
    }
    return '';
  };

  // Enhanced email detection logic
  const getEmailValue = (row: any): string => {
    const possibleEmailKeys = [
      'Email', 'email', 'Email Address', 'email_address', 'EmailAddress', 
      'e_mail', 'e-mail', 'work_email', 'work email', 'business_email',
      'business email', 'primary_email', 'primary email', 'contact_email',
      'contact email', 'professional_email', 'professional email'
    ];
    
    for (const key of possibleEmailKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        const email = String(row[key]).trim();
        // Basic email validation
        if (email.includes('@') && email.includes('.')) {
          return email;
        }
      }
    }
    
    // fallback: look for any key containing 'email' (case-insensitive)
    for (const col in row) {
      if (/email/i.test(col) && row[col] && String(row[col]).trim() !== '') {
        const email = String(row[col]).trim();
        // Basic email validation
        if (email.includes('@') && email.includes('.')) {
          return email;
        }
      }
    }
    return '';
  };

  // Enhanced phone number detection logic
  const getPhoneValue = (row: any): string => {
    const possiblePhoneKeys = [
      'Phone', 'phone', 'Phone Number', 'phone_number', 'PhoneNumber',
      'mobile', 'cell', 'Cell Phone', 'Mobile Phone', 'tel', 'telephone',
      'Primary Phone', 'Primary Contact', 'Contact Number', 'Contact', 
      'phone number', 'Mobile', 'Contact No.', 'work_phone', 'work phone',
      'business_phone', 'business phone', 'office_phone', 'office phone'
    ];
    for (const key of possiblePhoneKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return String(row[key]).trim();
      }
    }
    // fallback: look for any key containing 'phone' or 'mobile' (case-insensitive)
    for (const col in row) {
      if (/phone|mobile|tel/i.test(col) && row[col] && String(row[col]).trim() !== '') {
        return String(row[col]).trim();
      }
    }
    return '';
  };

  // Enhanced LinkedIn detection logic
  const getLinkedInValue = (row: any): string => {
    const possibleLinkedInKeys = [
      'LinkedIn', 'linkedin', 'LinkedIn URL', 'linkedin_url', 'LinkedInURL', 
      'linkedin_profile', 'LinkedIn Profile', 'linkedin profile', 'Linkedin',
      'linkedin-url', 'linkedin link', 'LinkedIn Link', 'profile_linkedin',
      'Profile LinkedIn', 'ln_url', 'LN URL', 'social_linkedin', 'Social LinkedIn'
    ];
    
    for (const key of possibleLinkedInKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        let linkedin = String(row[key]).trim();
        
        // Clean up LinkedIn URL if needed
        if (linkedin && !linkedin.startsWith('http://') && !linkedin.startsWith('https://')) {
          // Check if it's a LinkedIn URL without protocol
          if (linkedin.includes('linkedin.com') || linkedin.startsWith('www.linkedin.com')) {
            linkedin = 'https://' + linkedin;
          } else if (linkedin.includes('/in/') || linkedin.includes('/company/')) {
            // Looks like a LinkedIn path
            linkedin = 'https://www.linkedin.com' + (linkedin.startsWith('/') ? '' : '/') + linkedin;
          } else if (!linkedin.includes('.') && linkedin.length > 3) {
            // Might be just a username
            linkedin = 'https://www.linkedin.com/in/' + linkedin;
          }
        }
        
        // Validate that it looks like a proper LinkedIn URL
        if (linkedin.includes('linkedin.com')) {
          return linkedin;
        }
      }
    }
    
    // fallback: look for any key containing 'linkedin' (case-insensitive)
    for (const col in row) {
      if (/linkedin/i.test(col) && row[col] && String(row[col]).trim() !== '') {
        let linkedin = String(row[col]).trim();
        
        // Clean up LinkedIn URL if needed
        if (linkedin && !linkedin.startsWith('http://') && !linkedin.startsWith('https://')) {
          if (linkedin.includes('linkedin.com') || linkedin.startsWith('www.linkedin.com')) {
            linkedin = 'https://' + linkedin;
          } else if (linkedin.includes('/in/') || linkedin.includes('/company/')) {
            linkedin = 'https://www.linkedin.com' + (linkedin.startsWith('/') ? '' : '/') + linkedin;
          } else if (!linkedin.includes('.') && linkedin.length > 3) {
            linkedin = 'https://www.linkedin.com/in/' + linkedin;
          }
        }
        
        if (linkedin.includes('linkedin.com')) {
          return linkedin;
        }
      }
    }
    return '';
  };

  // FIXED: Enhanced website detection logic with comprehensive organization website mapping
  const getOrganizationWebsiteValue = (row: any): string => {
    console.log('🔍 Starting website detection for row:', Object.keys(row));
    
    // Primary website column names - most specific first
    const possibleWebsiteKeys = [
      // Organization/Company specific
      'Organization Website', 'organization_website', 'OrganizationWebsite', 'organization website',
      'Company Website', 'company_website', 'CompanyWebsite', 'company website',
      'Corporate Website', 'corporate_website', 'CorporateWebsite', 'corporate website',
      'Business Website', 'business_website', 'BusinessWebsite', 'business website',
      'Org Website', 'org_website', 'OrgWebsite', 'org website',
      'Company Site', 'company_site', 'CompanySite', 'company site',
      'Company URL', 'company_url', 'CompanyURL', 'company url',
      'Organization URL', 'organization_url', 'OrganizationURL', 'organization url',
      'Corporate URL', 'corporate_url', 'CorporateURL', 'corporate url',
      'Business URL', 'business_url', 'BusinessURL', 'business url',
      'Company Domain', 'company_domain', 'CompanyDomain', 'company domain',
      'Organization Domain', 'organization_domain', 'OrganizationDomain', 'organization domain',
      // Generic website fields
      'Website', 'website', 'WEBSITE', 'Web Site', 'web_site', 'WebSite',
      'URL', 'url', 'Url', 'Web', 'web', 'Site', 'site', 'Domain', 'domain',
      'Homepage', 'homepage', 'HomePage', 'home_page', 'Web Address', 'web_address', 'WebAddress',
      'WWW', 'www', 'Link', 'link', 'Web URL', 'web_url', 'WebURL'
    ];
    
    // First pass: Look for exact column name matches
    for (const key of possibleWebsiteKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        let website = String(row[key]).trim();
        console.log('🎯 Found exact match for website:', { key, rawValue: website });
        
        // Clean up the website URL
        website = cleanWebsiteUrl(website);
        
        if (isValidWebsiteUrl(website)) {
          console.log('✅ Valid website URL found (exact match):', website);
          return website;
        }
      }
    }
    
    // Second pass: Look for columns containing website-related keywords (case-insensitive)
    const websitePatterns = [
      /^(organization|company|corporate|business|org)[\s_-]*(website|site|url|domain)$/i,
      /^(website|site|url|domain)[\s_-]*(organization|company|corporate|business|org)?$/i,
      /website/i,
      /\burl\b/i,
      /\bsite\b/i,
      /\bdomain\b/i,
      /\bweb\b/i
    ];
    
    for (const col in row) {
      for (const pattern of websitePatterns) {
        if (pattern.test(col) && row[col] && String(row[col]).trim() !== '') {
          let website = String(row[col]).trim();
          console.log('🔍 Found pattern match for website:', { column: col, pattern: pattern.source, rawValue: website });
          
          // Clean up the website URL
          website = cleanWebsiteUrl(website);
          
          if (isValidWebsiteUrl(website)) {
            console.log('✅ Valid website URL found (pattern match):', website);
            return website;
          }
        }
      }
    }
    
    console.log('❌ No valid website URL found in row');
    return '';
  };

  // Helper function to clean website URLs
  const cleanWebsiteUrl = (website: string): string => {
    if (!website) return '';
    
    // Remove whitespace
    website = website.trim();
    
    // Skip if it looks like an email or LinkedIn URL
    if (website.includes('@') || website.toLowerCase().includes('linkedin.com')) {
      return '';
    }
    
    // Add protocol if missing and it looks like a domain
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      if (website.includes('.') && !website.includes(' ') && website.length > 3) {
        // Remove 'www.' if it's at the beginning without protocol
        if (website.toLowerCase().startsWith('www.')) {
          website = website.substring(4);
        }
        website = 'https://' + website;
      }
    }
    
    return website;
  };

  // Helper function to validate website URLs
  const isValidWebsiteUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Must contain a dot and start with http/https
    const hasValidFormat = url.includes('.') && (url.startsWith('http://') || url.startsWith('https://'));
    
    // Must not be an email or LinkedIn URL
    const isNotEmail = !url.includes('@');
    const isNotLinkedIn = !url.toLowerCase().includes('linkedin.com');
    
    // Must not contain spaces (invalid URL)
    const hasNoSpaces = !url.includes(' ');
    
    // Must be reasonably long
    const isReasonableLength = url.length > 10;
    
    return hasValidFormat && isNotEmail && isNotLinkedIn && hasNoSpaces && isReasonableLength;
  };

  const organizationWebsite = getOrganizationWebsiteValue(csvRow);

  const mappedLead = {
    first_name: getFieldValue(['First Name', 'firstName', 'first_name', 'FirstName', 'fname', 'given_name']),
    last_name: getFieldValue(['Last Name', 'lastName', 'last_name', 'LastName', 'lname', 'family_name', 'surname']),
    email: getEmailValue(csvRow),
    phone: getPhoneValue(csvRow),
    company: getFieldValue(['Company', 'company', 'Company Name', 'company_name', 'CompanyName', 'organization', 'org']),
    title: getFieldValue(['Title', 'title', 'Job Title', 'job_title', 'JobTitle', 'position', 'role']),
    linkedin: getLinkedInValue(csvRow),
    industry: getFieldValue(['Industry', 'industry', 'sector']),
    location: getFieldValue(['Location', 'location', 'city', 'address', 'country']),
    seniority: 'Mid-level' as const,
    company_size: 'Small (1-50)' as const,
    status: 'New' as const,
    emails_sent: 0,
    completeness_score: 0,
    category_id: categoryId || null,
    import_batch_id: importBatchId || null,
    user_id: userId || '',
    tags: [],
    remarks_history: [],
    activity_log: [],
    department: getFieldValue(['Department', 'department', 'dept']),
    personal_email: getFieldValue(['Personal Email', 'personal_email', 'personalEmail', 'private_email']),
    photo_url: getFieldValue(['Photo URL', 'photo_url', 'photoUrl', 'image', 'avatar', 'picture']),
    twitter_url: getFieldValue(['Twitter', 'twitter', 'twitter_url', 'TwitterURL']),
    facebook_url: getFieldValue(['Facebook', 'facebook', 'facebook_url', 'FacebookURL']),
    organization_website: organizationWebsite,
    organization_founded: (() => {
      const founded = getFieldValue(['Founded', 'founded', 'year_founded', 'establishment_year']);
      return founded ? parseInt(founded) : null;
    })(),
    remarks: ''
  };

  // Calculate completeness score based on the mapped data
  mappedLead.completeness_score = calculateCompletenessScore({
    firstName: mappedLead.first_name,
    lastName: mappedLead.last_name,
    email: mappedLead.email,
    phone: mappedLead.phone,
    company: mappedLead.company,
    title: mappedLead.title,
    linkedin: mappedLead.linkedin,
    organizationWebsite: mappedLead.organization_website,
  });

  console.log('🔄 Final mapped lead:', { 
    originalRow: csvRow, 
    mappedLead: {
      company: mappedLead.company,
      organizationWebsite: mappedLead.organization_website,
      linkedin: mappedLead.linkedin,
      email: mappedLead.email
    },
    websiteDetected: mappedLead.organization_website ? 'Yes' : 'No',
    linkedinDetected: mappedLead.linkedin ? 'Yes' : 'No'
  });

  return mappedLead;
};

export const calculateCompletenessScore = (lead: any): number => {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'linkedin', 'organizationWebsite'];
  const filledFields = fields.filter(field => lead[field] && lead[field].trim() !== '');
  return Math.round((filledFields.length / fields.length) * 100);
};
