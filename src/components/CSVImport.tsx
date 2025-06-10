import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoryCombobox } from './CategoryCombobox';
import type { Lead } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface CSVImportProps {
  onImportComplete: (leads: Lead[], importBatch: ImportBatch) => void;
  categories: Category[];
  onCreateCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete, categories, onCreateCategory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [batchName, setBatchName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
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

  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      // Auto-generate batch name from file name
      const fileName = selectedFile.name.replace('.csv', '');
      const timestamp = new Date().toLocaleDateString();
      setBatchName(`${fileName} - ${timestamp}`);
      
      // Auto-suggest category name from file name
      if (!categoryName) {
        const suggestedCategory = fileName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setCategoryName(suggestedCategory);
      }
      
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
  }, [toast, categoryName]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      processFile(csvFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a CSV file",
        variant: "destructive",
      });
    }
  }, [processFile, toast]);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview([]);
  }, []);

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

  const generateRandomColor = (): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
      let selectedCategoryId: string | undefined;

      // Check if we need to create a new category
      if (categoryName.trim()) {
        const existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (existingCategory) {
          selectedCategoryId = existingCategory.id;
        } else {
          // Create new category automatically
          console.log('Creating new category:', categoryName);
          await onCreateCategory({
            name: categoryName.trim(),
            description: `Auto-created during import of ${file.name}`,
            color: generateRandomColor(),
            criteria: {}
          });
          
          // Find the newly created category
          // Note: We'll rely on the parent component to refresh categories
          // and the category will be assigned by name matching in the import batch
        }
      }

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
            processingTime: new Date().toISOString(),
            categoryName: categoryName.trim() || undefined
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
          
          const successMessage = categoryName.trim() && !categories.find(cat => 
            cat.name.toLowerCase() === categoryName.toLowerCase()
          ) 
            ? `Imported ${leads.length} leads and created category "${categoryName}"`
            : `Imported ${leads.length} leads successfully`;
          
          toast({
            title: "Import successful",
            description: successMessage,
          });
          
          setFile(null);
          setPreview([]);
          setBatchName('');
          setCategoryName('');
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
          Upload your comprehensive lead CSV with personal details, contact info, organization data, and business metadata. Categories are created automatically if they don't exist.
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
            <Label htmlFor="category">Category</Label>
            <div className="mt-1">
              <CategoryCombobox
                categories={categories}
                value={categoryName}
                onChange={setCategoryName}
                placeholder="Select existing or type new category..."
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New categories will be created automatically during import
            </p>
          </div>
        </div>

        <div>
          <Label>CSV File</Label>
          {!file ? (
            <div
              className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="csv-file-input" className="cursor-pointer">
                    Choose File
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
