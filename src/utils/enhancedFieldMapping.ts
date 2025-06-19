
export interface FieldMapping {
  sourceHeader: string;
  targetField: string;
  isIgnored: boolean;
  isRequired: boolean;
  suggestions: string[];
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  mappings: Record<string, string>;
  createdAt: Date;
}

// Enhanced target fields including new ones
export const targetFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'fullName', label: 'Full Name', required: false },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: true },
  { key: 'title', label: 'Job Title', required: false },
  { key: 'department', label: 'Department', required: false },
  { key: 'linkedin', label: 'LinkedIn URL', required: false },
  { key: 'industry', label: 'Industry', required: false },
  { key: 'location', label: 'Location', required: false },
  { key: 'yearsOfExperience', label: 'Years of Experience', required: false },
  { key: 'seniority', label: 'Seniority Level', required: false },
  { key: 'companySize', label: 'Company Size', required: false },
  { key: 'personalEmail', label: 'Personal Email', required: false },
  { key: 'photoUrl', label: 'Photo URL', required: false },
  { key: 'twitterUrl', label: 'Twitter URL', required: false },
  { key: 'facebookUrl', label: 'Facebook URL', required: false },
  { key: 'organizationWebsite', label: 'Organization Website', required: false },
  { key: 'organizationFounded', label: 'Organization Founded', required: false },
  { key: 'remarks', label: 'Remarks', required: false }
];

// Enhanced header patterns for better auto-detection
export const headerPatterns: Record<string, string[]> = {
  firstName: [
    'first name', 'firstname', 'first_name', 'fname', 'given_name', 'given name',
    'f_name', 'f name', 'prenom', 'nome', 'vorname'
  ],
  lastName: [
    'last name', 'lastname', 'last_name', 'lname', 'family_name', 'family name',
    'surname', 'l_name', 'l name', 'nom', 'cognome', 'nachname'
  ],
  fullName: [
    'full name', 'fullname', 'full_name', 'name', 'contact name', 'contact_name',
    'person name', 'person_name', 'nome completo', 'nom complet'
  ],
  email: [
    'email', 'e-mail', 'e_mail', 'email_address', 'email address', 'emailaddress',
    'mail', 'electronic mail', 'work_email', 'work email', 'business_email',
    'business email', 'primary_email', 'primary email', 'contact_email', 'contact email'
  ],
  phone: [
    'phone', 'phone_number', 'phone number', 'phonenumber', 'mobile', 'cell',
    'cell_phone', 'cell phone', 'mobile_phone', 'mobile phone', 'telephone',
    'tel', 'contact_number', 'contact number', 'work_phone', 'work phone'
  ],
  company: [
    'company', 'company_name', 'company name', 'companyname', 'organization',
    'org', 'employer', 'business', 'firm', 'corporation', 'enterprise',
    'organization_name', 'organization name'
  ],
  title: [
    'title', 'job_title', 'job title', 'jobtitle', 'position', 'role',
    'designation', 'job_position', 'job position', 'work_title', 'work title',
    'professional_title', 'professional title'
  ],
  department: [
    'department', 'dept', 'division', 'team', 'unit', 'section',
    'department_name', 'department name'
  ],
  linkedin: [
    'linkedin', 'linkedin_url', 'linkedin url', 'linkedinurl', 'linkedin_profile',
    'linkedin profile', 'linkedin link', 'linkedin_link', 'ln_url', 'ln url'
  ],
  industry: [
    'industry', 'sector', 'field', 'domain', 'business_type', 'business type',
    'industry_type', 'industry type', 'vertical'
  ],
  location: [
    'location', 'city', 'country', 'address', 'region', 'state', 'province',
    'geographic_location', 'geographic location', 'place'
  ],
  yearsOfExperience: [
    'years of experience', 'years_of_experience', 'yearsofexperience', 'experience_years',
    'experience years', 'work_experience', 'work experience', 'total_experience',
    'total experience', 'exp_years', 'exp years', 'yoe', 'experience'
  ],
  seniority: [
    'seniority', 'level', 'seniority_level', 'seniority level', 'experience_level',
    'experience level', 'career_level', 'career level', 'job_level', 'job level'
  ],
  companySize: [
    'company_size', 'company size', 'companysize', 'organization_size',
    'organization size', 'employee_count', 'employee count', 'team_size', 'team size'
  ],
  personalEmail: [
    'personal_email', 'personal email', 'personalemail', 'private_email',
    'private email', 'home_email', 'home email'
  ],
  photoUrl: [
    'photo_url', 'photo url', 'photourl', 'image_url', 'image url',
    'avatar', 'picture', 'photo', 'profile_image', 'profile image'
  ],
  twitterUrl: [
    'twitter', 'twitter_url', 'twitter url', 'twitterurl', 'twitter_profile',
    'twitter profile', 'twitter_handle', 'twitter handle'
  ],
  facebookUrl: [
    'facebook', 'facebook_url', 'facebook url', 'facebookurl', 'facebook_profile',
    'facebook profile', 'fb_url', 'fb url'
  ],
  organizationWebsite: [
    'organization_website', 'organization website', 'company_website', 'company website',
    'website', 'site', 'web', 'url', 'homepage', 'web_address', 'web address'
  ],
  organizationFounded: [
    'organization_founded', 'organization founded', 'company_founded', 'company founded',
    'founded', 'established', 'year_founded', 'year founded', 'founding_year', 'founding year'
  ],
  remarks: [
    'remarks', 'notes', 'comments', 'description', 'additional_info',
    'additional info', 'memo', 'observation'
  ]
};

export const autoDetectFieldMapping = (headers: string[]): Record<string, string> => {
  const mappings: Record<string, string> = {};
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Find best match for each target field
    for (const [targetField, patterns] of Object.entries(headerPatterns)) {
      for (const pattern of patterns) {
        if (normalizedHeader === pattern || 
            normalizedHeader.includes(pattern) || 
            pattern.includes(normalizedHeader)) {
          // Avoid duplicate mappings - prefer exact matches
          if (!mappings[header] || normalizedHeader === pattern) {
            mappings[header] = targetField;
          }
          break;
        }
      }
    }
  });
  
  return mappings;
};

export const generateFieldSuggestions = (header: string): string[] => {
  const normalizedHeader = header.toLowerCase().trim();
  const suggestions: string[] = [];
  
  // Score each target field based on similarity
  const scores: Array<{ field: string, score: number }> = [];
  
  for (const [targetField, patterns] of Object.entries(headerPatterns)) {
    let maxScore = 0;
    
    for (const pattern of patterns) {
      let score = 0;
      
      // Exact match
      if (normalizedHeader === pattern) {
        score = 100;
      }
      // Contains pattern
      else if (normalizedHeader.includes(pattern)) {
        score = 80;
      }
      // Pattern contains header
      else if (pattern.includes(normalizedHeader)) {
        score = 70;
      }
      // Partial similarity
      else {
        const similarity = calculateStringSimilarity(normalizedHeader, pattern);
        score = similarity * 50;
      }
      
      maxScore = Math.max(maxScore, score);
    }
    
    if (maxScore > 30) {
      scores.push({ field: targetField, score: maxScore });
    }
  }
  
  // Sort by score and return top suggestions
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.field);
};

const calculateStringSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return 1 - (matrix[len2][len1] / maxLen);
};

export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }
  
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  
  // For names with 3+ parts, take first as firstName and rest as lastName
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
};

export const validateMapping = (mappings: Record<string, string>, data: any[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  const requiredFields = targetFields.filter(f => f.required).map(f => f.key);
  const mappedFields = Object.values(mappings);
  
  for (const requiredField of requiredFields) {
    if (!mappedFields.includes(requiredField)) {
      errors.push(`Required field '${targetFields.find(f => f.key === requiredField)?.label}' is not mapped`);
    }
  }
  
  // Check for duplicate mappings
  const fieldCounts: Record<string, number> = {};
  Object.values(mappings).forEach(field => {
    if (field && field !== 'ignore') {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    }
  });
  
  Object.entries(fieldCounts).forEach(([field, count]) => {
    if (count > 1) {
      warnings.push(`Field '${targetFields.find(f => f.key === field)?.label}' is mapped multiple times`);
    }
  });
  
  // Check data quality for mapped fields (sample check)
  if (data.length > 0) {
    const sampleSize = Math.min(10, data.length);
    const sample = data.slice(0, sampleSize);
    
    Object.entries(mappings).forEach(([header, field]) => {
      if (field === 'email') {
        const invalidEmails = sample.filter(row => {
          const email = row[header];
          return email && typeof email === 'string' && email.trim() && !email.includes('@');
        });
        
        if (invalidEmails.length > sampleSize * 0.5) {
          warnings.push(`Column '${header}' mapped to Email contains many invalid email addresses`);
        }
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
