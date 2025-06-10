import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategorySelector } from './CategorySelector';
import type { Lead } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface CSVImportProps {
  onImportComplete: (leads: Lead[], importBatch: ImportBatch) => void;
  categories: Category[];
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete, categories }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [batchName, setBatchName] = useState<string>('');
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

  const cleanUrl = (url: string): string => {
    if (!url) return '';
    const cleanedUrl = url.trim().toLowerCase();
    
    if (cleanedUrl.startsWith('http')) {
      return url.trim();
    }
    
    if (cleanedUrl && !cleanedUrl.includes('http')) {
      return `https://${url.trim()}`;
    }
    
    return url.trim();
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      // Auto-generate batch name from file name
      const fileName = selectedFile.name.replace('.csv', '');
      const timestamp = new Date().toLocaleDateString();
      setBatchName(`${fileName} - ${timestamp}`);
      
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
    
    const numericMatch = employeeCount.match(/\d+/);
    if (numericMatch) {
      const size = parseInt(numericMatch[0]);
      if (size <= 50) return 'Small (1-50)';
      if (size <= 200) return 'Medium (51-200)';
      if (size <= 1000) return 'Large (201-1000)';
      return 'Enterprise (1000+)';
    }
    
    const sizeLower = employeeCount.toLowerCase();
    if (sizeLower.includes('small') || sizeLower.includes('startup')) return 'Small (1-50)';
    if (sizeLower.includes('medium') || sizeLower.includes('mid')) return 'Medium (51-200)';
    if (sizeLower.includes('large')) return 'Large (201-1000)';
    if (sizeLower.includes('enterprise') || sizeLower.includes('corporate')) return 'Enterprise (1000+)';
    
    return 'Small (1-50)';
  };

  const categorizeSeniority = (title: string, seniorityField?: string): Lead['seniority'] => {
    if (seniorityField) {
      const seniorityLower = seniorityField.toLowerCase();
      if (seniorityLower.includes('c-level') || seniorityLower.includes('executive')) return 'C-level';
      if (seniorityLower.includes('senior')) return 'Senior';
      if (seniorityLower.includes('junior')) return 'Junior';
      if (seniorityLower.includes('mid')) return 'Mid-level';
    }

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
    const valuableFields = ['phone', 'linkedin', 'industry', 'location', 'organizationWebsite', 'department'];
    
    requiredFields.forEach(field => {
      if (lead[field as keyof Lead]) score += 15;
    });
    
    let optionalScore = 0;
    valuableFields.forEach(field => {
      if (lead[field as keyof Lead]) optionalScore += 4;
    });
    
    return Math.min(100, score + Math.min(25, optionalScore));
  };

  const buildLocation = (city: string, state: string, country: string): string => {
    const parts = [city, state, country].filter(part => part && part.trim());
    return parts.join(', ');
  };

  const handleImport = async () => {
    if (!file || !batchName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a batch name",
        variant: "destructive",
      });
      return;
    }

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
        let failedImports = 0;
        
        lines.slice(1).forEach((line, index) => {
          const values = parseCSVLine(line);
          if (values.length === 0 || values.every(v => !v.trim())) {
            failedImports++;
            return;
          }
          
          const rawLead: any = {};
          headers.forEach((header, i) => {
            rawLead[header] = values[i] || '';
          });

          // Personal Details
          const firstName = findColumnValue(rawLead, ['first_name']);
          const lastName = findColumnValue(rawLead, ['last_name']);
          const name = findColumnValue(rawLead, ['name']);
          const headline = findColumnValue(rawLead, ['headline']);
          const title = findColumnValue(rawLead, ['title']);
          const seniority = findColumnValue(rawLead, ['seniority']);
          const department = findColumnValue(rawLead, ['department']);
          const keywords = findColumnValue(rawLead, ['keywords']);
          const photoUrl = findColumnValue(rawLead, ['photo_url']);

          // Contact Information
          const email = findColumnValue(rawLead, ['email']);
          const personalEmail = findColumnValue(rawLead, ['personal_email']);
          const linkedin = cleanUrl(findColumnValue(rawLead, ['linkedin_url']));
          const twitterUrl = cleanUrl(findColumnValue(rawLead, ['twitter_url']));
          const facebookUrl = cleanUrl(findColumnValue(rawLead, ['facebook_url']));

          // Organization Information
          const company = findColumnValue(rawLead, ['organization_name']);
          const phone = cleanPhoneNumber(findColumnValue(rawLead, ['organization_phone']));
          const organizationWebsite = cleanUrl(findColumnValue(rawLead, ['organization_website_url']));
          const organizationLogo = findColumnValue(rawLead, ['organization_logo_url']);
          const organizationDomain = findColumnValue(rawLead, ['organization_primary_domain']);
          const organizationFounded = findColumnValue(rawLead, ['organization_founded_year']);
          const organizationAddress = findColumnValue(rawLead, ['organization_raw_address']);

          // Location
          const city = findColumnValue(rawLead, ['city', 'organization_city']);
          const state = findColumnValue(rawLead, ['state', 'organization_state']);
          const country = findColumnValue(rawLead, ['country', 'organization_country']);
          const location = buildLocation(city, state, country);

          // Business Metadata
          const employeeCount = findColumnValue(rawLead, ['estimated_num_employees']);
          const industry = findColumnValue(rawLead, ['industry']);

          if (!firstName && !lastName && !email) {
            console.log(`Skipping row ${index + 1}: Missing essential data`);
            failedImports++;
            return;
          }

          const lead: Lead = {
            id: `lead_${Date.now()}_${index}`,
            firstName: firstName || '',
            lastName: lastName || '',
            name: name,
            email: email || '',
            personalEmail: personalEmail,
            company: company || '',
            title: title || '',
            headline: headline,
            seniority: categorizeSeniority(title, seniority),
            department: department,
            keywords: keywords,
            companySize: categorizeCompanySize(employeeCount),
            industry: industry,
            location: location,
            phone: phone,
            linkedin: linkedin,
            twitterUrl: twitterUrl,
            facebookUrl: facebookUrl,
            photoUrl: photoUrl,
            organizationWebsite: organizationWebsite,
            organizationLogo: organizationLogo,
            organizationDomain: organizationDomain,
            organizationFounded: organizationFounded ? parseInt(organizationFounded) : undefined,
            organizationAddress: organizationAddress,
            tags: [],
            status: 'New',
            emailsSent: 0,
            createdAt: new Date(),
            completenessScore: 0,
            categoryId: selectedCategoryId || undefined,
          };

          lead.completenessScore = calculateCompleteness(lead);
          
          // Auto-tag leads based on data quality and characteristics
          if (lead.completenessScore >= 90) lead.tags.push('Complete Profile');
          if (lead.completenessScore < 60) lead.tags.push('Incomplete');
          if (lead.seniority === 'C-level' || lead.seniority === 'Executive') lead.tags.push('High Priority');
          if (lead.phone) lead.tags.push('Has Phone');
          if (lead.linkedin) lead.tags.push('Has LinkedIn');
          if (lead.organizationWebsite) lead.tags.push('Has Website');
          if (lead.department) lead.tags.push('Department Known');
          if (lead.organizationFounded && new Date().getFullYear() - lead.organizationFounded <= 5) lead.tags.push('New Company');

          leads.push(lead);
          console.log(`Processed lead ${index + 1}:`, lead);
        });

        const importBatch: ImportBatch = {
          id: `batch_${Date.now()}`,
          name: batchName,
          categoryId: selectedCategoryId || undefined,
          sourceFile: file.name,
          totalLeads: lines.length - 1,
          successfulImports: leads.length,
          failedImports,
          createdAt: new Date(),
          metadata: {
            headers,
            processingTime: new Date().toISOString()
          }
        };

        console.log(`Successfully processed ${leads.length} leads`);
        
        if (leads.length === 0) {
          toast({
            title: "No valid leads found",
            description: "Please check your CSV format and ensure it contains valid lead data",
            variant: "destructive",
          });
        } else {
          onImportComplete(leads, importBatch);
          toast({
            title: "Import successful",
            description: `Imported ${leads.length} leads successfully`,
          });
          setFile(null);
          setPreview([]);
          setBatchName('');
          setSelectedCategoryId('');
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
          Import Lead Database
        </CardTitle>
        <CardDescription>
          Upload your comprehensive lead CSV with personal details, contact info, organization data, and business metadata. Assign to a category for better organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batch-name">Import Batch Name</Label>
            <Input
              id="batch-name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g., Q4 Prospects - Tech Conference"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={setSelectedCategoryId}
              placeholder="Select category for these leads"
            />
          </div>
        </div>

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
                    {Object.keys(preview[0] || {}).slice(0, 8).map(key => (
                      <th key={key} className="text-left p-2 font-medium">{key}</th>
                    ))}
                    {Object.keys(preview[0] || {}).length > 8 && (
                      <th className="text-left p-2 font-medium text-muted-foreground">
                        +{Object.keys(preview[0] || {}).length - 8} more columns
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b">
                      {Object.values(row).slice(0, 8).map((value: any, j) => (
                        <td key={j} className="p-2 max-w-[100px] truncate">{value}</td>
                      ))}
                      {Object.values(row).length > 8 && (
                        <td className="p-2 text-muted-foreground">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!file || importing || !batchName.trim()}
          className="w-full"
        >
          {importing ? 'Importing...' : 'Import Lead Database'}
        </Button>
      </CardContent>
    </Card>
  );
};
