import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { generateFileHash, checkFileAlreadyImported } from '@/utils/duplicateDetection';
import { useToast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge';

interface CSVImportProps {
  onImport: (data: any[], metadata: Record<string, any>) => void;
  importBatches: Array<{ sourceFile?: string; metadata?: Record<string, any> }>;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImport, importBatches }) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDuplicateFile, setIsDuplicateFile] = useState<boolean>(false);
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setFileError(null);
    setIsDuplicateFile(false);

    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const fileContent = e.target.result;

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
    }

    reader.readAsText(file);
  }, [importBatches]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {
    'text/csv': ['.csv']
  } })

  const handleImport = async () => {
    if (csvData.length === 0) {
      setFileError('No data to import. Please upload a CSV file.');
      return;
    }

    // Generate file hash for duplicate detection
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      
      const file = new File([], fileName); // Dummy file to trigger FileReader
      
      fetch(file).then(response => response.blob()).then(blob => {
        reader.readAsText(blob);
      }).catch(error => reject(error));
    });

    const fileHash = generateFileHash(fileContent);

    // Metadata for import batch
    const metadata = {
      fileHash: fileHash,
      importDate: new Date().toISOString()
    };

    onImport(csvData, metadata);
    setCsvData([]);
    setFileName('');
    toast({
      title: "Import Successful",
      description: "Your CSV data has been imported.",
    })
  };

  return (
    <div className="flex flex-col space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-6 cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}>
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

      <Button onClick={handleImport} disabled={csvData.length === 0 || isDuplicateFile}>
        Import CSV Data
      </Button>
    </div>
  );
};
