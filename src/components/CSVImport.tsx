
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
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
    }
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

  return (
    <div className="flex flex-col space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 cursor-pointer ${
          isDragActive ? 'border-primary' : 'border-border'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
          {fileName && <p>Selected file: {fileName}</p>}
        </div>
      </div>

      {fileError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      {isDuplicateFile && (
        <Alert variant="warning">
          <AlertTitle>Duplicate File</AlertTitle>
          <AlertDescription>This file has already been imported.</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleImport}
        disabled={csvData.length === 0 || isDuplicateFile}
      >
        Import CSV Data
      </Button>
    </div>
  );
};
