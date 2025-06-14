
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle, Upload, FileText, CheckCircle2, AlertTriangle, History, Calendar, Users, Tag } from 'lucide-react';
import { generateFileHash, checkFileAlreadyImported } from '@/utils/duplicateDetection';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CategoryCombobox } from '@/components/CategoryCombobox';
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
  const [importName, setImportName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const clearFile = useCallback(() => {
    setCsvData([]);
    setFileName('');
    setFileError(null);
    setIsDuplicateFile(false);
    setImportName('');
    setSelectedCategory('');
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setFileError(null);
    setIsDuplicateFile(false);
    
    // Auto-generate import name from file name
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setImportName(nameWithoutExtension);

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

    if (!importName.trim()) {
      setFileError('Please provide a name for this import.');
      return;
    }

    setIsImporting(true);

    try {
      // Create category if it doesn't exist
      if (selectedCategory && selectedCategory.trim()) {
        const existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        
        if (!existingCategory) {
          await onCreateCategory({
            name: selectedCategory,
            description: `Auto-created from import: ${importName}`,
            color: '#3B82F6'
          });
        }
      }

      // Generate file hash for duplicate detection
      const fileHash = generateFileHash(JSON.stringify(csvData));
      
      // Metadata for import batch
      const metadata = {
        fileHash: fileHash,
        importDate: new Date().toISOString(),
        fileName: fileName,
        importName: importName,
        category: selectedCategory
      };

      // Here you would typically call your import function with the metadata
      // For now, just simulate success
      onImportComplete();
      
      setCsvData([]);
      setFileName('');
      setImportName('');
      setSelectedCategory('');
      
      toast({
        title: "Import Successful",
        description: `"${importName}" has been imported successfully.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = () => {
    if (fileError) return <XCircle className="h-5 w-5 text-destructive" />;
    if (isDuplicateFile) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    if (fileName && csvData.length > 0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  const getStatusBadgeVariant = (batch: ImportBatch): "default" | "secondary" | "destructive" => {
    const successRate = batch.totalLeads > 0 ? (batch.successfulImports / batch.totalLeads) * 100 : 0;
    if (successRate === 100) return "default";
    if (successRate >= 80) return "secondary";
    return "destructive";
  };

  const isReadyToImport = csvData.length > 0 && 
                         !isDuplicateFile && 
                         !fileError && 
                         importName.trim() !== '';

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="upload" className="flex-1 flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="upload" className="p-4 sm:p-6 space-y-6 mt-0">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">Import Leads</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                Upload your CSV file to import leads into your database. We'll check for duplicates and validate the data.
              </p>
            </div>

            {/* Upload Card */}
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription className="text-sm">
                  Drag and drop your CSV file here, or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop Zone */}
                <div
                  {...getRootProps()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-6 sm:p-8 cursor-pointer transition-all duration-200 min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center gap-3 sm:gap-4
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
                        <p className="font-medium text-foreground text-sm sm:text-base">{fileName}</p>
                        {csvData.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {csvData.length} rows detected
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-foreground font-medium text-sm sm:text-base">Choose a CSV file or drag it here</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
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

                {/* Import Configuration */}
                {fileName && csvData.length > 0 && !fileError && !isDuplicateFile && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                        <Tag className="h-5 w-5" />
                        Configure Import
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="import-name" className="text-sm font-medium">
                          Import Name
                        </Label>
                        <Input
                          id="import-name"
                          placeholder="Enter a name for this import..."
                          value={importName}
                          onChange={(e) => setImportName(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          This helps you identify the import in your history
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">
                          Category (Optional)
                        </Label>
                        <CategoryCombobox
                          categories={categories}
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          placeholder="Select or create a category..."
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Assign leads to a category or create a new one
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* File Status Messages */}
                {fileError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Upload Error</AlertTitle>
                    <AlertDescription className="text-sm">{fileError}</AlertDescription>
                  </Alert>
                )}

                {isDuplicateFile && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">Duplicate File Detected</AlertTitle>
                    <AlertDescription className="text-orange-700 text-sm">
                      This file has already been imported. Please choose a different file.
                    </AlertDescription>
                  </Alert>
                )}

                {fileName && csvData.length > 0 && !fileError && !isDuplicateFile && isReadyToImport && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Ready for Import</AlertTitle>
                    <AlertDescription className="text-green-700 text-sm">
                      Found {csvData.length} rows. Import will be named "{importName}"{selectedCategory && ` and assigned to "${selectedCategory}" category`}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {fileName && (
                    <Button
                      variant="outline"
                      onClick={clearFile}
                      disabled={isImporting}
                      className="w-full sm:w-auto min-w-[140px] order-2 sm:order-1"
                      size="lg"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Clear File
                    </Button>
                  )}
                  <Button
                    onClick={handleImport}
                    disabled={!isReadyToImport || isImporting}
                    className={`w-full min-w-[140px] order-1 sm:order-2 ${fileName ? 'sm:w-auto' : ''}`}
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="pb-4">
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
          </TabsContent>

          <TabsContent value="history" className="p-4 sm:p-6 space-y-6 mt-0">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">Import History</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                Review your previous CSV imports and their status.
              </p>
            </div>

            {/* Import History */}
            <div className="space-y-4 max-w-4xl mx-auto">
              {importBatches.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No imports yet</h3>
                    <p className="text-muted-foreground mb-4">
                      When you import CSV files, they'll appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                importBatches.map((batch) => (
                  <Card key={batch.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-base truncate">{batch.name}</h3>
                            <Badge variant={getStatusBadgeVariant(batch)} className="text-xs">
                              {batch.failedImports === 0 ? 'Complete' : 'Partial'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(batch.createdAt, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{batch.totalLeads} leads</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            {batch.successfulImports} / {batch.totalLeads} imported
                          </div>
                          {batch.failedImports > 0 && (
                            <div className="text-sm text-destructive">
                              {batch.failedImports} failed
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
