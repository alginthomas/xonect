
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

interface CSVImportProps {
  onImportComplete: (leads: Lead[]) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const normalizeHeader = (header: string): string => {
    return header.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  };

  const findColumnValue = (rowData: any, possibleNames: string[]): string => {
    for (const name of possibleNames) {
      const normalizedName = normalizeHeader(name);
      for (const [key, value] of Object.entries(rowData)) {
        if (normalizeHeader(key) === normalizedName && value) {
          return String(value).trim();
        }
      }
    }
    return '';
  };

  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.replace(/^\++/, '+');
  };

  const cleanLinkedInUrl = (linkedin: string): string => {
    if (!linkedin) return '';
    const url = linkedin.trim().toLowerCase();
    
    if (url.startsWith('http')) {
      return linkedin.trim();
    }
    
    if (url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')) {
      return linkedin.startsWith('http') ? linkedin.trim() : `https://${linkedin.trim()}`;
    }
    
    if (url && !url.includes('linkedin.com')) {
      const username = url.replace(/^[@\/]+/, '');
      return `https://www.linkedin.com/in/${username}`;
    }
    
    return linkedin.trim();
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return;
        
        const headers = parseCSVLine(lines[0]);
        console.log('CSV Headers found:', headers);
        
        const sampleRows = lines.slice(1, 4).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        console.log('Sample rows:', sampleRows);
        setPreview(sampleRows);
      };
      reader.readAsText(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const categorizeCompanySize = (employeeCount: string): Lead['companySize'] => {
    if (!employeeCount) return 'Small (1-50)';
    
    // Handle numeric values from estimated_num_employees
    const numericMatch = employeeCount.match(/\d+/);
    if (numericMatch) {
      const size = parseInt(numericMatch[0]);
      if (size <= 50) return 'Small (1-50)';
      if (size <= 200) return 'Medium (51-200)';
      if (size <= 1000) return 'Large (201-1000)';
      return 'Enterprise (1000+)';
    }
    
    // Handle text-based size descriptions
    const sizeLower = employeeCount.toLowerCase();
    if (sizeLower.includes('small') || sizeLower.includes('startup')) return 'Small (1-50)';
    if (sizeLower.includes('medium') || sizeLower.includes('mid')) return 'Medium (51-200)';
    if (sizeLower.includes('large')) return 'Large (201-1000)';
    if (sizeLower.includes('enterprise') || sizeLower.includes('corporate')) return 'Enterprise (1000+)';
    
    return 'Small (1-50)';
  };

  const categorizeSeniority = (title: string, seniorityField?: string): Lead['seniority'] => {
    // First check if there's a dedicated seniority field
    if (seniorityField) {
      const seniorityLower = seniorityField.toLowerCase();
      if (seniorityLower.includes('c-level') || seniorityLower.includes('executive')) return 'C-level';
      if (seniorityLower.includes('senior')) return 'Senior';
      if (seniorityLower.includes('junior')) return 'Junior';
      if (seniorityLower.includes('mid')) return 'Mid-level';
    }

    // Fall back to title analysis
    if (!title) return 'Mid-level';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo') || titleLower.includes('chief')) {
      return 'C-level';
    }
    if (titleLower.includes('vp') || titleLower.includes('vice president') || titleLower.includes('director')) {
      return 'Executive';
    }
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      return 'Senior';
    }
    if (titleLower.includes('junior') || titleLower.includes('associate') || titleLower.includes('intern')) {
      return 'Junior';
    }
    return 'Mid-level';
  };

  const calculateCompleteness = (lead: Partial<Lead>): number => {
    let score = 0;
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'title'];
    const optionalFields = ['phone', 'linkedin', 'industry', 'location'];
    
    requiredFields.forEach(field => {
      if (lead[field as keyof Lead]) score += 20;
    });
    
    let optionalScore = 0;
    optionalFields.forEach(field => {
      if (lead[field as keyof Lead]) optionalScore += 5;
    });
    
    return Math.min(100, score + Math.min(20, optionalScore));
  };

  const buildLocation = (city: string, state: string, country: string): string => {
    const parts = [city, state, country].filter(part => part && part.trim());
    return parts.join(', ');
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV file must contain headers and at least one data row",
            variant: "destructive",
          });
          setImporting(false);
          return;
        }
        
        const headers = parseCSVLine(lines[0]);
        console.log('Processing CSV with headers:', headers);
        
        const leads: Lead[] = [];
        
        lines.slice(1).forEach((line, index) => {
          const values = parseCSVLine(line);
          if (values.length === 0 || values.every(v => !v.trim())) return;
          
          const rawLead: any = {};
          headers.forEach((header, i) => {
            rawLead[header] = values[i] || '';
          });

          // Map fields based on your specific column structure
          const firstName = findColumnValue(rawLead, ['first_name']);
          const lastName = findColumnValue(rawLead, ['last_name']);
          const email = findColumnValue(rawLead, ['email']);
          
          // Use organization_name for company, not estimated_num_employees or other fields
          const company = findColumnValue(rawLead, ['organization_name']);
          
          // Use title or headline for job title
          const title = findColumnValue(rawLead, ['title', 'headline']);
          
          // Use seniority field if available
          const seniorityField = findColumnValue(rawLead, ['seniority']);
          
          // Get phone from organization_phone or any phone field
          const phone = cleanPhoneNumber(findColumnValue(rawLead, ['organization_phone', 'phone']));

          // Use linkedin_url for LinkedIn profile
          const linkedin = cleanLinkedInUrl(findColumnValue(rawLead, ['linkedin_url']));

          // Use estimated_num_employees for company size categorization
          const employeeCount = findColumnValue(rawLead, ['estimated_num_employees']);

          // Use industry field
          const industry = findColumnValue(rawLead, ['industry']);

          // Build location from city, state, country (personal location first, then organization)
          const city = findColumnValue(rawLead, ['city', 'organization_city']);
          const state = findColumnValue(rawLead, ['state', 'organization_state']);
          const country = findColumnValue(rawLead, ['country', 'organization_country']);
          const location = buildLocation(city, state, country);

          if (!firstName && !lastName && !email) {
            console.log(`Skipping row ${index + 1}: Missing essential data`);
            return;
          }

          const lead: Lead = {
            id: `lead_${Date.now()}_${index}`,
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            company: company || '',
            title: title || '',
            seniority: categorizeSeniority(title, seniorityField),
            companySize: categorizeCompanySize(employeeCount),
            industry: industry,
            location: location,
            phone: phone,
            linkedin: linkedin,
            tags: [],
            status: 'New',
            emailsSent: 0,
            createdAt: new Date(),
            completenessScore: 0,
          };

          lead.completenessScore = calculateCompleteness(lead);
          
          if (lead.completenessScore === 100) lead.tags.push('Complete');
          if (lead.completenessScore < 60) lead.tags.push('Incomplete');
          if (lead.seniority === 'C-level' || lead.seniority === 'Executive') lead.tags.push('High Priority');
          if (lead.phone) lead.tags.push('Has Phone');
          if (lead.linkedin) lead.tags.push('Has LinkedIn');

          leads.push(lead);
          console.log(`Processed lead ${index + 1}:`, lead);
        });

        console.log(`Successfully processed ${leads.length} leads`);
        
        if (leads.length === 0) {
          toast({
            title: "No valid leads found",
            description: "Please check your CSV format and ensure it contains valid lead data",
            variant: "destructive",
          });
        } else {
          onImportComplete(leads);
          toast({
            title: "Import successful",
            description: `Imported ${leads.length} leads successfully`,
          });
          setFile(null);
          setPreview([]);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing your CSV file",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Lead List
        </CardTitle>
        <CardDescription>
          Upload a CSV file with lead data. Supports your specific format with first_name, last_name, email, organization_name, title, estimated_num_employees, linkedin_url, organization_phone, industry, city/state/country, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Choose CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-1"
          />
        </div>

        {preview.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Preview (first 3 rows)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0] || {}).map(key => (
                      <th key={key} className="text-left p-2 font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b">
                      {Object.values(row).map((value: any, j) => (
                        <td key={j} className="p-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full"
        >
          {importing ? 'Importing...' : 'Import Leads'}
        </Button>
      </CardContent>
    </Card>
  );
};
