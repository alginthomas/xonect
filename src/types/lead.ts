
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
  seniority: 'Junior' | 'Mid-level' | 'Senior' | 'Executive' | 'C-level';
  department?: string;
  keywords?: string;
  companySize: 'Small (1-50)' | 'Medium (51-200)' | 'Large (201-1000)' | 'Enterprise (1000+)';
  industry?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  photoUrl?: string;
  organizationWebsite?: string;
  organizationFounded?: number;
  organizationLogo?: string;
  organizationDomain?: string;
  organizationAddress?: string;
  tags: string[];
  status: 'New' | 'Contacted' | 'Opened' | 'Clicked' | 'Replied' | 'Qualified' | 'Unqualified';
  emailsSent: number;
  lastContactDate?: Date;
  createdAt: Date;
  completenessScore: number;
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

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  leadIds: string[];
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  createdAt: Date;
}
