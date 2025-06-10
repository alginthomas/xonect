
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

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const sampleRows = lines.slice(1, 4).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as any);
        });
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
    const size = parseInt(companySize) || 0;
    if (size <= 50) return 'Small (1-50)';
    if (size <= 200) return 'Medium (51-200)';
    if (size <= 1000) return 'Large (201-1000)';
    return 'Enterprise (1000+)';
  };

  const categorizeSeniority = (title: string): Lead['seniority'] => {
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
    const fields = ['firstName', 'lastName', 'email', 'company', 'title'];
    fields.forEach(field => {
      if (lead[field as keyof Lead]) score += 20;
    });
    return score;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const leads: Lead[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const rawLead: any = {};
          
          headers.forEach((header, i) => {
            rawLead[header] = values[i] || '';
          });

          const lead: Lead = {
            id: `lead_${Date.now()}_${index}`,
            firstName: rawLead['First Name'] || rawLead['first_name'] || '',
            lastName: rawLead['Last Name'] || rawLead['last_name'] || '',
            email: rawLead['Email'] || rawLead['email'] || '',
            company: rawLead['Company'] || rawLead['Organization'] || rawLead['company'] || '',
            title: rawLead['Title'] || rawLead['Job Title'] || rawLead['title'] || '',
            seniority: categorizeSeniority(rawLead['Title'] || rawLead['Job Title'] || ''),
            companySize: categorizeCompanySize(rawLead['Company Size'] || rawLead['Employees'] || '0'),
            industry: rawLead['Industry'] || '',
            location: rawLead['Location'] || rawLead['City'] || '',
            phone: rawLead['Phone'] || '',
            linkedin: rawLead['LinkedIn'] || rawLead['LinkedIn URL'] || '',
            tags: [],
            status: 'New',
            emailsSent: 0,
            createdAt: new Date(),
            completenessScore: 0,
          };

          lead.completenessScore = calculateCompleteness(lead);
          
          // Auto-tag based on data
          if (lead.completenessScore === 100) lead.tags.push('Complete');
          if (lead.completenessScore < 60) lead.tags.push('Incomplete');
          if (lead.seniority === 'C-level' || lead.seniority === 'Executive') lead.tags.push('High Priority');

          return lead;
        });

        onImportComplete(leads);
        toast({
          title: "Import successful",
          description: `Imported ${leads.length} leads successfully`,
        });
        setFile(null);
        setPreview([]);
      };
      
      reader.readAsText(file);
    } catch (error) {
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
          Upload a CSV file with lead data. Supported columns: First Name, Last Name, Email, Company, Title, Company Size, etc.
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
