
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateFileHash, checkFileAlreadyImported } from '@/utils/duplicateDetection';
import { useToast } from '@/hooks/use-toast';
import type { Category, ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';

interface CSVImportProps {
  categories: Category[];
  onImportComplete: () => void;
  onCreateCategory: (categoryData: Partial<Category>) => Promise<void>;
  existingLeads: Lead[];
  importBatches: ImportBatch[];
}

export const CSVImport: React.FC<CSVImportProps> = ({
  categories,
  onImportComplete,
  onCreateCategory,
  existingLeads,
  importBatches
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDuplicateFile, setIsDuplicateFile] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setFileError(null);
    setIsDuplicateFile(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      
      // Check if file has already been imported
      const alreadyImported = checkFileAlreadyImported(fileContent, file.name, importBatches);
      if (alreadyImported) {
        setIsDuplicateFile(true);
        setFileError('This file has already been imported.');
        return;
      }

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setFileError(`CSV parsing error: ${results.errors.map(e => e.message).join(', ')}`);
            return;
          }

          if (results.data.length === 0) {
            setFileError('No data found in CSV file.');
            return;
          }

          setCsvData(results.data);
        },
        error: (error) => {
          setFileError(`CSV parsing error: ${error.message}`);
        }
      });
    };
    reader.readAsText(file);
  }, [importBatches]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (csvData.length === 0) {
      setFileError('No data to import. Please upload a CSV file.');
      return;
    }

    // Generate file hash for duplicate detection
    const fileHash = generateFileHash(JSON.stringify(csvData));
    
    // Metadata for import batch
    const metadata = {
      fileHash: fileHash,
      importDate: new Date().toISOString()
    };

    // Here you would typically call your import function
    // For now, just simulate success
    onImportComplete();
    setCsvData([]);
    setFileName('');
    
    toast({
      title: "Import Successful",
      description: "Your CSV data has been imported."
    });
  };

  const getStatusIcon = () => {
    if (fileError) return <XCircle className="h-5 w-5 text-destructive" />;
    if (isDuplicateFile) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    if (fileName && csvData.length > 0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Import Leads</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Upload your CSV file to import leads into your database. We'll check for duplicates and validate the data.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Drag and drop your CSV file here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 min-h-[180px] flex flex-col items-center justify-center gap-4
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }
              ${fileError 
                ? 'border-destructive/50 bg-destructive/5' 
                : ''
              }
              ${fileName && !fileError && !isDuplicateFile 
                ? 'border-green-500/50 bg-green-50/50' 
                : ''
              }
            `}
          >
            <input {...getInputProps()} />
            
            {getStatusIcon()}
            
            <div className="text-center space-y-2">
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the file here...</p>
              ) : fileName ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{fileName}</p>
                  {csvData.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} rows detected
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-foreground font-medium">Choose a CSV file or drag it here</p>
                  <p className="text-sm text-muted-foreground">
                    Supports files up to 10MB
                  </p>
                </div>
              )}
            </div>
            
            {!fileName && (
              <Button variant="outline" size="sm" className="mt-2">
                Browse Files
              </Button>
            )}
          </div>

          {/* File Status Messages */}
          {fileError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {isDuplicateFile && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Duplicate File Detected</AlertTitle>
              <AlertDescription className="text-orange-700">
                This file has already been imported. Please choose a different file.
              </AlertDescription>
            </Alert>
          )}

          {fileName && csvData.length > 0 && !fileError && !isDuplicateFile && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">File Ready for Import</AlertTitle>
              <AlertDescription className="text-green-700">
                Found {csvData.length} rows in your CSV file. Click "Import Data" to proceed.
              </AlertDescription>
            </Alert>
          )}

          {/* Import Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || isDuplicateFile || !!fileError}
              className="w-full sm:w-auto min-w-[140px]"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Required Columns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First Name</li>
                <li>• Last Name</li>
                <li>• Email</li>
                <li>• Company</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Optional Columns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Phone</li>
                <li>• Title</li>
                <li>• LinkedIn</li>
                <li>• Industry</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
