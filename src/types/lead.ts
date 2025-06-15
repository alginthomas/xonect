
export type LeadStatus = 'New' | 'Contacted' | 'Opened' | 'Clicked' | 'Replied' | 'Qualified' | 'Unqualified' | 'Call Back' | 'Unresponsive' | 'Not Interested' | 'Interested' | 'Send Email';
export type Seniority = 'Junior' | 'Mid-level' | 'Senior' | 'Executive' | 'C-level';
export type CompanySize = 'Small (1-50)' | 'Medium (51-200)' | 'Large (201-1000)' | 'Enterprise (1000+)';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  personalEmail?: string;
  company: string;
  title: string;
  headline?: string;
  seniority: Seniority;
  department?: string;
  keywords?: string;
  companySize: CompanySize;
  industry: string;
  location: string;
  phone: string;
  linkedin: string;
  twitterUrl?: string;
  facebookUrl?: string;
  photoUrl?: string;
  organizationWebsite?: string;
  organizationLogo?: string;
  organizationDomain?: string;
  organizationFounded?: number;
  organizationAddress?: string;
  tags: string[];
  status: LeadStatus;
  emailsSent: number;
  lastContactDate?: Date;
  createdAt: Date;
  completenessScore: number;
  categoryId?: string;
  importBatchId?: string;
  remarks?: string;
  remarksHistory?: RemarkEntry[];
  activityLog?: ActivityEntry[];
  userId: string; // Added userId property
  // Client-side derived field for country detection
  country?: string;
  countryCode?: string;
  countryFlag?: string;
}

export interface RemarkEntry {
  id: string;
  text: string;
  timestamp: Date;
}

export interface ActivityEntry {
  id: string;
  type: 'status_change' | 'remark_added' | 'email_sent' | 'contact_attempt';
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  userId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: Date;
  lastUsed?: Date;
}
