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
    // Remove all non-digit characters except + at the beginning
    const cleaned = phone.replace(/[^\d+]/g, '');
    // If it starts with multiple +, keep only one
    return cleaned.replace(/^\++/, '+');
  };

  const cleanLinkedInUrl = (linkedin: string): string => {
    if (!linkedin) return '';
    const url = linkedin.trim().toLowerCase();
    
    // If it's already a full LinkedIn URL, return as is
    if (url.startsWith('http')) {
      return linkedin.trim();
    }
    
    // If it looks like a LinkedIn username or partial URL
    if (url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')) {
      return linkedin.startsWith('http') ? linkedin.trim() : `https://${linkedin.trim()}`;
    }
    
    // If it's just a username, construct the full URL
    if (url && !url.includes('linkedin.com')) {
      const username = url.replace(/^[@\/]+/, ''); // Remove leading @ or /
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

  const categorizeCompanySize = (companySize: string): Lead['companySize'] => {
    if (!companySize) return 'Small (1-50)';
    const size = parseInt(companySize.replace(/[^0-9]/g, '')) || 0;
    if (size <= 50) return 'Small (1-50)';
    if (size <= 200) return 'Medium (51-200)';
    if (size <= 1000) return 'Large (201-1000)';
    return 'Enterprise (1000+)';
  };

  const categorizeSeniority = (title: string): Lead['seniority'] => {
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
    
    // Required fields (20 points each)
    requiredFields.forEach(field => {
      if (lead[field as keyof Lead]) score += 20;
    });
    
    // Optional fields (5 points each, max 20 additional points)
    let optionalScore = 0;
    optionalFields.forEach(field => {
      if (lead[field as keyof Lead]) optionalScore += 5;
    });
    
    return Math.min(100, score + Math.min(20, optionalScore));
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

          const firstName = findColumnValue(rawLead, [
            'First Name', 'first_name', 'firstname', 'fname', 'given_name'
          ]);
          
          const lastName = findColumnValue(rawLead, [
            'Last Name', 'last_name', 'lastname', 'lname', 'surname', 'family_name'
          ]);
          
          const email = findColumnValue(rawLead, [
            'Email', 'email', 'email_address', 'mail'
          ]);
          
          const company = findColumnValue(rawLead, [
            'Company', 'company', 'organization', 'org', 'company_name'
          ]);
          
          const title = findColumnValue(rawLead, [
            'Title', 'title', 'job_title', 'position', 'role'
          ]);

          const phone = cleanPhoneNumber(findColumnValue(rawLead, [
            'Phone', 'phone', 'phone_number', 'tel', 'mobile', 'cell', 'telephone'
          ]));

          const linkedin = cleanLinkedInUrl(findColumnValue(rawLead, [
            'LinkedIn', 'linkedin', 'linkedin_url', 'profile', 'linkedin_profile', 'linked_in'
          ]));

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
            seniority: categorizeSeniority(title),
            companySize: categorizeCompanySize(findColumnValue(rawLead, [
              'Company Size', 'company_size', 'employees', 'emp_count', 'size'
            ])),
            industry: findColumnValue(rawLead, [
              'Industry', 'industry', 'sector'
            ]),
            location: findColumnValue(rawLead, [
              'Location', 'location', 'city', 'address', 'country'
            ]),
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
          Upload a CSV file with lead data. Supported columns: First Name, Last Name, Email, Company, Title, Phone, LinkedIn, Company Size, etc.
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
