
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

  // Enhanced phone number detection logic
  const getPhoneValue = (row: any): string => {
    // Try various likely candidates
    const possiblePhoneKeys = [
      'Phone', 'phone', 'Phone Number', 'phone_number', 'PhoneNumber',
      'mobile', 'cell', 'Cell Phone', 'Mobile Phone', 'tel', 'telephone',
      'Primary Phone', 'Primary Contact', 'Contact Number', 'Contact', 
      'phone number', 'Mobile', 'Contact No.'
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

  const mappedLead = {
    first_name: getFieldValue(['First Name', 'firstName', 'first_name', 'FirstName', 'fname', 'given_name']),
    last_name: getFieldValue(['Last Name', 'lastName', 'last_name', 'LastName', 'lname', 'family_name', 'surname']),
    email: getFieldValue(['Email', 'email', 'Email Address', 'email_address', 'EmailAddress', 'e_mail']),
    phone: getPhoneValue(csvRow),
    company: getFieldValue(['Company', 'company', 'Company Name', 'company_name', 'CompanyName', 'organization', 'org']),
    title: getFieldValue(['Title', 'title', 'Job Title', 'job_title', 'JobTitle', 'position', 'role']),
    linkedin: getFieldValue(['LinkedIn', 'linkedin', 'LinkedIn URL', 'linkedin_url', 'LinkedInURL', 'linkedin_profile']),
    industry: getFieldValue(['Industry', 'industry', 'sector']),
    location: getFieldValue(['Location', 'location', 'city', 'address', 'country']),
    seniority: 'Mid-level' as const,
    company_size: 'Small (1-50)' as const,
    status: 'New' as const,
    emails_sent: 0,
    completeness_score: 0, // Will be calculated
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
    organization_website: getFieldValue(['Website', 'website', 'company_website', 'url', 'web']),
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
  });

  console.log('🔄 Mapped CSV row to lead:', { originalRow: csvRow, mappedLead });

  return mappedLead;
};

export const calculateCompletenessScore = (lead: any): number => {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'linkedin'];
  const filledFields = fields.filter(field => lead[field] && lead[field].trim() !== '');
  return Math.round((filledFields.length / fields.length) * 100);
};
