
import type { Lead } from '@/types/lead';
import type { Category } from '@/types/category';

export const exportLeadsToCSV = (leads: Lead[], categories: Category[], filename: string = 'leads-export') => {
  // Define headers for the CSV
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Company',
    'Title',
    'Seniority',
    'Company Size',
    'Industry',
    'Location',
    'LinkedIn',
    'Status',
    'Emails Sent',
    'Last Contact Date',
    'Category',
    'Completeness Score',
    'Tags',
    'Created At'
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => {
    const category = categories.find(cat => cat.id === lead.categoryId);
    
    return [
      lead.firstName || '',
      lead.lastName || '',
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.title || '',
      lead.seniority || '',
      lead.companySize || '',
      lead.industry || '',
      lead.location || '',
      lead.linkedin || '',
      lead.status || '',
      lead.emailsSent?.toString() || '0',
      lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : '',
      category?.name || '',
      lead.completenessScore?.toString() || '0',
      lead.tags?.join('; ') || '',
      new Date(lead.createdAt).toLocaleDateString()
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
