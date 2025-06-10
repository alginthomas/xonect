
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  seniority: 'Junior' | 'Mid-level' | 'Senior' | 'Executive' | 'C-level';
  companySize: 'Small (1-50)' | 'Medium (51-200)' | 'Large (201-1000)' | 'Enterprise (1000+)';
  industry?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
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
