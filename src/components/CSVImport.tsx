import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertCircle, FileText, X, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CategoryCombobox } from './CategoryCombobox';
import { getCountryFromPhoneNumber } from '@/utils/phoneUtils';
import { filterDuplicatesFromImport, checkFileAlreadyImported, generateFileHash, getDuplicateStats } from '@/utils/duplicateDetection';
import type { Lead } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface CSVImportProps {
  onImportComplete: () => void;
  categories: Category[];
  onCreateCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  existingLeads: Lead[];
  importBatches: ImportBatch[];
}

export const CSVImport: React.FC<CSVImportProps> = ({
  onImportComplete,
  categories,
  onCreateCategory,
  existingLeads,
  importBatches
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [batchName, setBatchName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    fileAlreadyImported: boolean;
    duplicateCount: number;
    duplicateStats: any;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    return header.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '');
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
        const suggestedCategory = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setCategoryName(suggestedCategory);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        // Check if file was already imported
        const fileAlreadyImported = checkFileAlreadyImported(text, selectedFile.name, importBatches);
        
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

        // Process all rows to check for duplicates
        const allRows = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Extract email and phone for duplicate checking
          const email = findColumnValue(row, ['email']);
          const phone = cleanPhoneNumber(findColumnValue(row, ['organization_phone', 'phone']));

          return { email, phone, ...row };
        }).filter(row => row.email); // Only include rows with email

        // Check for duplicates
        const { uniqueLeads, duplicates } = filterDuplicatesFromImport(allRows, existingLeads);
        const duplicateStats = getDuplicateStats(duplicates);

        if (fileAlreadyImported || duplicates.length > 0) {
          setDuplicateWarning({
            fileAlreadyImported,
            duplicateCount: duplicates.length,
            duplicateStats
          });
        } else {
          setDuplicateWarning(null);
        }

        console.log('Sample rows:', sampleRows);
        console.log('Duplicate check:', { 
          total: allRows.length, 
          unique: uniqueLeads.length, 
          duplicates: duplicates.length,
          fileAlreadyImported 
        });
        
        setPreview(sampleRows);
      };
      reader.readAsText(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  }, [toast, categoryName, existingLeads, importBatches]);

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
        variant: "destructive"
      });
    }
  }, [processFile, toast]);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview([]);
    setDuplicateWarning(null);
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
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleImport = async () => {
    if (!file || !batchName.trim() || !user) {
      toast({
        title: "Missing information",
        description: "Please select a file, enter a batch name, and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    // Show warning if duplicates detected
    if (duplicateWarning && (duplicateWarning.fileAlreadyImported || duplicateWarning.duplicateCount > 0)) {
      const proceed = window.confirm(
        `Warning: ${duplicateWarning.fileAlreadyImported ? 'This file appears to have been imported before. ' : ''}${duplicateWarning.duplicateCount > 0 ? `${duplicateWarning.duplicateCount} duplicate leads detected and will be skipped. ` : ''}Do you want to proceed with the import?`
      );
      
      if (!proceed) {
        return;
      }
    }

    setImporting(true);
    try {
      let selectedCategoryId: string | undefined;

      // Check if we need to create a new category
      if (categoryName.trim()) {
        const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
          selectedCategoryId = existingCategory.id;
        } else {
          // Create new category using the callback to properly update the parent state
          console.log('Creating new category:', categoryName);
          const categoryData = {
            name: categoryName.trim(),
            description: `Auto-created during import of ${file.name}`,
            color: generateRandomColor(),
            criteria: {}
          };

          // Call the parent's callback to create and update the local state
          await onCreateCategory(categoryData);

          // Find the newly created category in the updated categories list
          // Note: We need to refetch or the parent will provide the updated category in the next render
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .select('*')
            .eq('name', categoryData.name)
            .eq('user_id', user.id)
            .single();

          if (categoryError) {
            console.error('Error fetching created category:', categoryError);
            throw categoryError;
          }

          selectedCategoryId = newCategory.id;
          console.log('Created category with ID:', selectedCategoryId);
        }
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const fileHash = generateFileHash(text);
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV file must contain headers and at least one data row",
            variant: "destructive"
          });
          setImporting(false);
          return;
        }

        const headers = parseCSVLine(lines[0]);
        console.log('Processing CSV with headers:', headers);

        // First, create the import batch
        const { data: importBatch, error: batchError } = await supabase
          .from('import_batches')
          .insert([{
            name: batchName,
            category_id: selectedCategoryId,
            source_file: file.name,
            total_leads: lines.length - 1,
            successful_imports: 0,
            failed_imports: 0,
            user_id: user.id,
            metadata: {
              headers,
              processingTime: new Date().toISOString(),
              categoryName: categoryName.trim() || undefined,
              fileHash // Store file hash for duplicate detection
            }
          }])
          .select()
          .single();

        if (batchError) {
          console.error('Error creating import batch:', batchError);
          throw batchError;
        }

        console.log('Created import batch:', importBatch);

        // Process all rows and filter duplicates
        const allRows = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const rawLead: any = {};
          headers.forEach((header, i) => {
            rawLead[header] = values[i] || '';
          });

          // Personal Details
          const firstName = findColumnValue(rawLead, ['first_name']);
          const lastName = findColumnValue(rawLead, ['last_name']);
          const email = findColumnValue(rawLead, ['email']);
          const phone = cleanPhoneNumber(findColumnValue(rawLead, ['organization_phone', 'phone']));

          return { email, phone, rawLead };
        }).filter(row => row.email); // Only include rows with email

        // Filter out duplicates
        const { uniqueLeads } = filterDuplicatesFromImport(allRows, existingLeads);

        const leadsToInsert = [];
        let failedImports = 0;

        uniqueLeads.forEach((row, index) => {
          const { rawLead } = row;

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

          // Create lead object for database insertion
          const leadData = {
            first_name: firstName || '',
            last_name: lastName || '',
            email: email || '',
            personal_email: personalEmail || null,
            company: company || '',
            title: title || '',
            seniority: categorizeSeniority(title, seniority),
            department: department || null,
            company_size: categorizeCompanySize(employeeCount),
            industry: industry || null,
            location: location || null,
            phone: phone || null,
            linkedin: linkedin || null,
            twitter_url: twitterUrl || null,
            facebook_url: facebookUrl || null,
            photo_url: photoUrl || null,
            organization_website: organizationWebsite || null,
            organization_founded: organizationFounded ? parseInt(organizationFounded) : null,
            tags: [],
            status: 'New' as const,
            emails_sent: 0,
            completeness_score: 0,
            category_id: selectedCategoryId || null,
            import_batch_id: importBatch.id,
            user_id: user.id
          };

          // Calculate completeness score
          const tempLead: Partial<Lead> = {
            firstName: leadData.first_name,
            lastName: leadData.last_name,
            email: leadData.email,
            company: leadData.company,
            title: leadData.title,
            phone: leadData.phone,
            linkedin: leadData.linkedin,
            industry: leadData.industry,
            location: leadData.location,
            organizationWebsite: leadData.organization_website,
            department: leadData.department
          };
          leadData.completeness_score = calculateCompleteness(tempLead);

          // Auto-tag leads based on data quality and characteristics
          const tags = [];
          if (leadData.completeness_score >= 90) tags.push('Complete Profile');
          if (leadData.completeness_score < 60) tags.push('Incomplete');
          if (leadData.seniority === 'C-level' || leadData.seniority === 'Executive') tags.push('High Priority');
          if (leadData.phone) tags.push('Has Phone');
          if (leadData.linkedin) tags.push('Has LinkedIn');
          if (leadData.organization_website) tags.push('Has Website');
          if (leadData.department) tags.push('Department Known');
          if (leadData.organization_founded && new Date().getFullYear() - leadData.organization_founded <= 5) tags.push('New Company');
          
          // Add country tag based on phone number
          if (leadData.phone) {
            const countryInfo = getCountryFromPhoneNumber(leadData.phone);
            if (countryInfo) {
              tags.push(`Country: ${countryInfo.name}`);
            }
          }
          
          leadData.tags = tags;

          leadsToInsert.push(leadData);
          console.log(`Processed lead ${index + 1}:`, leadData);
        });

        if (leadsToInsert.length === 0) {
          toast({
            title: "No new leads to import",
            description: "All leads in this file already exist in your database",
            variant: "destructive"
          });
          setImporting(false);
          return;
        }

        // Insert leads in batches to avoid hitting database limits
        const batchSize = 100;
        let successfulImports = 0;
        for (let i = 0; i < leadsToInsert.length; i += batchSize) {
          const batch = leadsToInsert.slice(i, i + batchSize);
          const { error: leadsError } = await supabase
            .from('leads')
            .insert(batch);

          if (leadsError) {
            console.error('Error inserting leads batch:', leadsError);
            failedImports += batch.length;
          } else {
            successfulImports += batch.length;
          }
        }

        // Update the import batch with final counts
        await supabase
          .from('import_batches')
          .update({
            successful_imports: successfulImports,
            failed_imports: failedImports
          })
          .eq('id', importBatch.id);

        console.log(`Successfully imported ${successfulImports} leads`);

        const successMessage = categoryName.trim() && !categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase())
          ? `Imported ${successfulImports} leads and created category "${categoryName}"`
          : `Imported ${successfulImports} leads successfully`;

        toast({
          title: "Import successful",
          description: successMessage + (duplicateWarning?.duplicateCount ? ` (${duplicateWarning.duplicateCount} duplicates skipped)` : '')
        });

        // Reset form
        setFile(null);
        setPreview([]);
        setBatchName('');
        setCategoryName('');
        setDuplicateWarning(null);

        // Notify parent component to refresh data
        onImportComplete();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "There was an error importing your CSV file",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 px-[12px] py-0">
      {/* Import Form */}
      <Card className="apple-card">
        <CardHeader className="text-center pb-8">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <Upload className="h-6 w-6 text-primary" />
            Upload Your Lead Data
          </CardTitle>
          <CardDescription className="text-base">
            Configure your import settings and upload your CSV file
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="batch-name" className="text-sm font-semibold">Import Batch Name</Label>
              <Input
                id="batch-name"
                value={batchName}
                onChange={e => setBatchName(e.target.value)}
                placeholder="e.g., Q4 Prospects - Tech Conference"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Give your import batch a descriptive name</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <CategoryCombobox
                categories={categories}
                value={categoryName}
                onChange={setCategoryName}
                placeholder="Select existing or type new category..."
              />
              <p className="text-xs text-muted-foreground">
                New categories will be created automatically during import
              </p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">CSV File Upload</Label>
            
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">Drop your CSV file here</h3>
                    <p className="text-muted-foreground">or click to browse files from your computer</p>
                    <div className="text-sm text-muted-foreground">
                      <p>Supports CSV files up to 10MB</p>
                    </div>
                  </div>
                  
                  <Button size="lg" variant="outline" asChild className="mt-4">
                    <label htmlFor="csv-file-input" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
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
              <div className="border rounded-xl p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 border border-green-200">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{file.name}</p>
                      <p className="text-sm text-green-700">
                        {(file.size / 1024).toFixed(1)} KB • Ready to import
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-green-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (duplicateWarning.fileAlreadyImported || duplicateWarning.duplicateCount > 0) && (
            <div className="border rounded-xl p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">Duplicate Detection Warning</h4>
                  <div className="space-y-2 text-sm text-yellow-800">
                    {duplicateWarning.fileAlreadyImported && (
                      <p>• This file appears to have been imported before</p>
                    )}
                    {duplicateWarning.duplicateCount > 0 && (
                      <>
                        <p>• {duplicateWarning.duplicateCount} duplicate leads detected:</p>
                        <ul className="ml-4 space-y-1">
                          {duplicateWarning.duplicateStats.emailDuplicates > 0 && (
                            <li>- {duplicateWarning.duplicateStats.emailDuplicates} email duplicates</li>
                          )}
                          {duplicateWarning.duplicateStats.phoneDuplicates > 0 && (
                            <li>- {duplicateWarning.duplicateStats.phoneDuplicates} phone duplicates</li>
                          )}
                          {duplicateWarning.duplicateStats.bothDuplicates > 0 && (
                            <li>- {duplicateWarning.duplicateStats.bothDuplicates} both email & phone duplicates</li>
                          )}
                        </ul>
                      </>
                    )}
                    <p className="font-medium">Duplicates will be automatically skipped during import.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-green-900">File Preview</h4>
                <span className="text-sm text-muted-foreground">(first 3 rows)</span>
              </div>
              
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {Object.keys(preview[0] || {}).slice(0, 6).map(key => (
                          <th key={key} className="text-left p-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                        {Object.keys(preview[0] || {}).length > 6 && (
                          <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            +{Object.keys(preview[0] || {}).length - 6} more
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/20">
                          {Object.values(row).slice(0, 6).map((value: any, j) => (
                            <td key={j} className="p-3 max-w-[120px] truncate font-medium">{value}</td>
                          ))}
                          {Object.values(row).length > 6 && (
                            <td className="p-3 text-muted-foreground">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Import Button */}
          <div className="pt-4">
            <Button
              onClick={handleImport}
              disabled={!file || importing || !batchName.trim()}
              size="lg"
              className="w-full h-14 text-base font-semibold"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Import...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-3" />
                  Import Lead Database
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};