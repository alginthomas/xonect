
import type { Lead } from '@/types/lead';

export const mapCSVToLead = (csvRow: any, categoryId?: string, importBatchId?: string, userId?: string) => {
  // Enhanced CSV field mapping with support for nested structures
  const getFieldValue = (possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (csvRow[name] !== undefined && csvRow[name] !== null && csvRow[name] !== '') {
        return String(csvRow[name]).trim();
      }
    }
    return '';
  };

  // Get current employment from employment_history (most recent/current position)
  const getCurrentEmployment = () => {
    // Look for current employment in employment_history array
    for (let i = 0; i < 20; i++) {
      const currentField = `employment_history/${i}/current`;
      const titleField = `employment_history/${i}/title`;
      const orgNameField = `employment_history/${i}/organization_name`;
      
      if (csvRow[currentField] === true || csvRow[currentField] === 'true') {
        return {
          title: csvRow[titleField] || '',
          company: csvRow[orgNameField] || ''
        };
      }
    }
    
    // Fallback to first employment history entry
    return {
      title: csvRow['employment_history/0/title'] || '',
      company: csvRow['employment_history/0/organization_name'] || ''
    };
  };

  // Enhanced email detection logic
  const getEmailValue = (row: any): string => {
    const possibleEmailKeys = [
      'email', 'Email', 'Email Address', 'email_address', 'EmailAddress', 
      'e_mail', 'e-mail', 'work_email', 'work email', 'business_email',
      'business email', 'primary_email', 'primary email', 'contact_email',
      'contact email', 'professional_email', 'professional email',
      'personal_emails/0', 'personal_emails/1', 'personal_emails/2'
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
      'phone_numbers/0/sanitized_number', 'phone_numbers/0/raw_number',
      'phone_numbers/1/sanitized_number', 'phone_numbers/1/raw_number',
      'sanitized_phone', 'organization/sanitized_phone', 'organization/phone',
      'organization/primary_phone/sanitized_number', 'organization/primary_phone/number',
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
      'linkedin_url', 'LinkedIn', 'linkedin', 'LinkedIn URL', 'linkedin_url', 'LinkedInURL', 
      'linkedin_profile', 'LinkedIn Profile', 'linkedin profile', 'Linkedin',
      'linkedin-url', 'linkedin link', 'LinkedIn Link', 'profile_linkedin',
      'Profile LinkedIn', 'ln_url', 'LN URL', 'social_linkedin', 'Social LinkedIn',
      'organization/linkedin_url', 'organization_linkedin_url'
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

  // Enhanced website detection logic
  const getWebsiteValue = (row: any): string => {
    const possibleWebsiteKeys = [
      'organization/website_url', 'organization_website_url', 'organization/primary_domain',
      'organization/blog_url', 'Website', 'website', 'Company Website', 'company_website', 'CompanyWebsite',
      'Organization Website', 'organization_website', 'OrganizationWebsite',
      'URL', 'url', 'Web', 'web', 'Site', 'site', 'Domain', 'domain',
      'Company URL', 'company_url', 'Homepage', 'homepage', 'Web Address',
      'web_address', 'WebAddress', 'company site', 'org website', 'corporate_website',
      'corporate website', 'business_website', 'business website', 'www', 'WWW',
      'company_domain', 'company domain', 'org_url', 'org url', 'Company Domain'
    ];
    
    for (const key of possibleWebsiteKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        let website = String(row[key]).trim();
        
        // Clean up the website URL if needed
        if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
          // Only add https:// if it looks like a domain
          if (website.includes('.') && !website.includes(' ') && website.length > 3) {
            // Remove 'www.' if it's at the beginning without protocol
            if (website.toLowerCase().startsWith('www.')) {
              website = website.substring(4);
            }
            website = 'https://' + website;
          }
        }
        
        // Validate that it looks like a proper URL
        if (website.includes('.') && (website.startsWith('http://') || website.startsWith('https://'))) {
          return website;
        }
      }
    }
    
    // fallback: look for any key containing 'website', 'url', or 'web' (case-insensitive)
    for (const col in row) {
      if (/website|url|web(?!_)|site/i.test(col) && row[col] && String(row[col]).trim() !== '') {
        let website = String(row[col]).trim();
        
        // Clean up the website URL if needed
        if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
          // Only add https:// if it looks like a domain
          if (website.includes('.') && !website.includes(' ') && website.length > 3) {
            // Remove 'www.' if it's at the beginning without protocol
            if (website.toLowerCase().startsWith('www.')) {
              website = website.substring(4);
            }
            website = 'https://' + website;
          }
        }
        
        // Validate that it looks like a proper URL
        if (website.includes('.') && (website.startsWith('http://') || website.startsWith('https://'))) {
          return website;
        }
      }
    }
    return '';
  };

  // Get current employment info
  const currentEmployment = getCurrentEmployment();

  const mappedLead = {
    first_name: getFieldValue(['first_name', 'First Name', 'firstName', 'FirstName', 'fname', 'given_name']),
    last_name: getFieldValue(['last_name', 'Last Name', 'lastName', 'LastName', 'lname', 'family_name', 'surname']),
    email: getEmailValue(csvRow),
    phone: getPhoneValue(csvRow),
    company: currentEmployment.company || getFieldValue([
      'organization_name', 'organization/name', 'Company', 'company', 'Company Name', 'company_name', 'CompanyName', 'organization', 'org'
    ]),
    title: currentEmployment.title || getFieldValue([
      'title', 'Title', 'Job Title', 'job_title', 'JobTitle', 'position', 'role', 'headline'
    ]),
    linkedin: getLinkedInValue(csvRow),
    industry: getFieldValue([
      'industry', 'Industry', 'organization/industry', 'organization/industries/0', 'organization/industries/1', 'sector'
    ]),
    location: getFieldValue([
      'city', 'country', 'state', 'organization_city', 'organization_country', 'organization_state',
      'organization/city', 'organization/country', 'organization/state', 'present_raw_address',
      'organization_raw_address', 'organization/raw_address', 'Location', 'location', 'address'
    ]),
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
    department: getFieldValue([
      'departments/0', 'departments/1', 'departments/2', 'Department', 'department', 'dept',
      'subdepartments/0', 'subdepartments/1', 'subdepartments/2', 'subdepartments/3', 'subdepartments/4'
    ]),
    personal_email: getFieldValue([
      'personal_emails/0', 'personal_emails/1', 'personal_emails/2',
      'Personal Email', 'personal_email', 'personalEmail', 'private_email'
    ]),
    photo_url: getFieldValue(['photo_url', 'Photo URL', 'photoUrl', 'image', 'avatar', 'picture']),
    twitter_url: getFieldValue([
      'twitter_url', 'organization/twitter_url', 'Twitter', 'twitter', 'TwitterURL'
    ]),
    facebook_url: getFieldValue([
      'facebook_url', 'organization/facebook_url', 'Facebook', 'facebook', 'FacebookURL'
    ]),
    organization_website: getWebsiteValue(csvRow),
    organization_founded: (() => {
      const founded = getFieldValue([
        'organization_founded_year', 'organization/founded_year', 'Founded', 'founded', 'year_founded', 'establishment_year'
      ]);
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

  console.log('🔄 Mapped CSV row to lead:', { 
    originalRow: csvRow, 
    mappedLead,
    emailDetected: mappedLead.email ? 'Yes' : 'No',
    websiteDetected: mappedLead.organization_website ? 'Yes' : 'No',
    linkedinDetected: mappedLead.linkedin ? 'Yes' : 'No',
    currentEmployment
  });

  return mappedLead;
};

export const calculateCompletenessScore = (lead: any): number => {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'linkedin', 'organizationWebsite'];
  const filledFields = fields.filter(field => lead[field] && lead[field].trim() !== '');
  return Math.round((filledFields.length / fields.length) * 100);
};
