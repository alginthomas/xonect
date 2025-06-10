
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  criteria: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportBatch {
  id: string;
  name: string;
  categoryId?: string;
  sourceFile?: string;
  totalLeads: number;
  successfulImports: number;
  failedImports: number;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  isSmart: boolean;
  createdAt: Date;
  updatedAt: Date;
}
