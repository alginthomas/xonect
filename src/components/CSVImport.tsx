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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Upload, FileText, CheckCircle2, AlertTriangle, History, Calendar, Users, Tag, Trash2, Eye, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { CategoryCombobox } from '@/components/CategoryCombobox';
import { useEnhancedCSVImport } from '@/hooks/useEnhancedCSVImport';
import { useImportBatchOperations } from '@/hooks/useImportBatchOperations';
import { DuplicateValidationReport } from '@/components/DuplicateValidationReport';
import type { Category, ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const [importName, setImportName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [deletingBatchName, setDeletingBatchName] = useState<string | null>(null);
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    importCSVData,
    validateCSVFile,
    clearValidation,
    isImporting,
    isValidating,
    validationResult
  } = useEnhancedCSVImport();

  const {
    handleDeleteBatch: deleteBatch,
    isDeleting
  } = useImportBatchOperations();

  const clearFile = useCallback(() => {
    setCsvData([]);
    setFileName('');
    setFileError(null);
    setImportName('');
    setSelectedCategory('');
    setShowValidationReport(false);
    clearValidation();
  }, [clearValidation]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setFileError(null);
    setShowValidationReport(false);
    clearValidation();

    // Auto-generate import name from file name
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setImportName(nameWithoutExtension);
    
    const reader = new FileReader();
    reader.onload = async e => {
      const fileContent = e.target?.result as string;
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
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
        error: error => {
          setFileError(`CSV parsing error: ${error.message}`);
        }
      });
    };
    reader.readAsText(file);
  }, [clearValidation]);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  // Utility: Get the UUID for a category name or handle creation
  const getSelectedCategoryId = async () => {
    if (!selectedCategory || !user?.id) return undefined;
    
    // Check if it's an existing category first
    const found = categories.find(cat => cat.name === selectedCategory);
    if (found) {
      return found.id;
    }
    
    // If not found, create new category using findOrCreateCategory
    try {
      const { findOrCreateCategory } = await import('@/utils/importBatchManager');
      const categoryId = await findOrCreateCategory(selectedCategory, categories, importName, user.id);
      console.log('📂 Created/found category ID:', categoryId);
      return categoryId;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      return undefined;
    }
  };

  const handleValidate = async () => {
    if (csvData.length === 0) {
      setFileError('No data to validate. Please upload a CSV file.');
      return;
    }
    if (!importName.trim()) {
      setFileError('Please provide a name for this import.');
      return;
    }
    try {
      await validateCSVFile(csvData, fileName, strictMode, user?.id);
      setShowValidationReport(true);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleImport = async () => {
    try {
      const categoryId = await getSelectedCategoryId(); // Get UUID, not name
      console.log('🏷️ Using category ID for import:', categoryId);
      const success = await importCSVData(csvData, fileName, importName, categoryId, true, user?.id);
      if (success) {
        clearFile();
        onImportComplete();
      }
    } catch (error) {
      console.error('❌ Import failed:', error);
    }
  };

  const getStatusIcon = () => {
    if (fileError) return <XCircle className="h-5 w-5 text-destructive" />;
    if (fileName && csvData.length > 0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  const getStatusBadgeVariant = (batch: ImportBatch): "default" | "secondary" | "destructive" => {
    const successRate = batch.totalLeads > 0 ? batch.successfulImports / batch.totalLeads * 100 : 0;
    if (successRate === 100) return "default";
    if (successRate >= 80) return "secondary";
    return "destructive";
  };

  const getBatchLeadCount = (batchId: string) => {
    return existingLeads.filter(lead => lead.importBatchId === batchId).length;
  };

  const handleViewBatchLeads = (batchId: string) => {
    navigate('/?tab=leads&batch=' + batchId);
  };

  const handleDeleteBatch = (batchId: string, batchName?: string) => {
    setDeletingBatchId(batchId);
    setDeletingBatchName(batchName || '');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingBatchId) {
      await deleteBatch(deletingBatchId, deletingBatchName || undefined);
    }
    setDeleteDialogOpen(false);
    setDeletingBatchId(null);
    setDeletingBatchName(null);
  };

  const isReadyToValidate = csvData.length > 0 && !fileError && importName.trim() !== '';
  const isReadyToImport = showValidationReport && validationResult?.canProceed && !isImporting;

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
            {!showValidationReport ? (
              <>
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold">Import Leads</h1>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                    Upload your CSV file to import leads. Enhanced duplicate detection ensures data quality.
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
                    <div {...getRootProps()} className={`
                        relative border-2 border-dashed rounded-xl p-6 sm:p-8 cursor-pointer transition-all duration-200 min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center gap-3 sm:gap-4
                        ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                        ${fileError ? 'border-destructive/50 bg-destructive/5' : ''}
                        ${fileName && !fileError ? 'border-green-500/50 bg-green-50/50' : ''}
                      `}>
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
                              Enhanced duplicate detection included
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

                    {/* Data Preview */}
                    {csvData.length > 0 && !fileError && (
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                            <Eye className="h-5 w-5" />
                            Data Preview
                          </CardTitle>
                          <CardDescription className="text-blue-700">
                            First 5 rows of your CSV data
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(csvData[0] || {}).slice(0, 6).map((header, index) => (
                                    <TableHead key={index} className="text-xs font-medium">
                                      {header}
                                    </TableHead>
                                  ))}
                                  {Object.keys(csvData[0] || {}).length > 6 && (
                                    <TableHead className="text-xs font-medium">...</TableHead>
                                  )}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {csvData.slice(0, 5).map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    {Object.values(row).slice(0, 6).map((value: any, cellIndex) => (
                                      <TableCell key={cellIndex} className="text-xs max-w-[120px] truncate">
                                        {String(value || '')}
                                      </TableCell>
                                    ))}
                                    {Object.values(row).length > 6 && (
                                      <TableCell className="text-xs">...</TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          {csvData.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Showing 5 of {csvData.length} rows
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Import Configuration */}
                    {fileName && csvData.length > 0 && !fileError && (
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
                              onChange={e => setImportName(e.target.value)} 
                              className="w-full" 
                            />
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
                          </div>

                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="strict-mode" 
                              checked={strictMode} 
                              onChange={e => setStrictMode(e.target.checked)} 
                              className="rounded border-gray-300" 
                            />
                            <Label htmlFor="strict-mode" className="text-sm font-medium flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Strict Duplicate Detection
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enable stricter validation including fuzzy name matching
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Error Messages */}
                    {fileError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Upload Error</AlertTitle>
                        <AlertDescription className="text-sm">{fileError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      {fileName && (
                        <Button 
                          variant="outline" 
                          onClick={clearFile} 
                          disabled={isValidating || isImporting} 
                          className="w-full sm:w-auto min-w-[140px] order-2 sm:order-1" 
                          size="lg"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Clear File
                        </Button>
                      )}
                      <Button 
                        onClick={handleValidate} 
                        disabled={!isReadyToValidate || isValidating || isImporting} 
                        className={`w-full min-w-[140px] order-1 sm:order-2 ${fileName ? 'sm:w-auto' : ''}`} 
                        size="lg"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {isValidating ? 'Validating...' : 'Validate & Preview'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Validation Report */
              <div className="mx-auto max-w-4xl">
                <div className="text-center space-y-2 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold">Validation Report</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Review duplicate detection results before importing
                  </p>
                </div>

                {validationResult && (
                  <DuplicateValidationReport 
                    validationResult={validationResult} 
                    totalRows={csvData.length} 
                    onProceed={handleImport} 
                    onCancel={() => setShowValidationReport(false)} 
                    isLoading={isImporting} 
                  />
                )}
              </div>
            )}

            {/* Help Section */}
            {!showValidationReport && (
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
                      <h4 className="font-medium text-sm">Enhanced Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• File duplicate detection</li>
                        <li>• Advanced lead matching</li>
                        <li>• Detailed validation reports</li>
                        <li>• Fuzzy name matching</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-4 sm:p-6 space-y-6 mt-0">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">Import History</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-sm:text-base">
                Review your previous CSV imports and manage your batches.
              </p>
            </div>

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
                importBatches.map(batch => {
                  const leadCount = getBatchLeadCount(batch.id);
                  return (
                    <Card key={batch.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-base truncate">{batch.name}</h3>
                              <Badge variant={getStatusBadgeVariant(batch)} className="text-xs">
                                {batch.failedImports === 0 ? 'Complete' : 'Partial'}
                              </Badge>
                              {batch.categoryId && (
                                <Badge variant="outline" className="text-xs">
                                  {categories.find(cat => cat.id === batch.categoryId)?.name || 'Unknown Category'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(batch.createdAt, 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{batch.totalLeads} total leads</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{leadCount} current leads</span>
                              </div>
                            </div>
                            {batch.sourceFile && (
                              <div className="text-sm text-muted-foreground">
                                Source: {batch.sourceFile}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2 text-destructive hover:text-destructive" 
                              onClick={() => handleDeleteBatch(batch.id, batch.name)} 
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-green-600">{batch.successfulImports}</div>
                              <div className="text-xs text-muted-foreground">Successful</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-red-600">{batch.failedImports || 0}</div>
                              <div className="text-xs text-muted-foreground">Failed</div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <div className="text-lg font-semibold text-blue-600">
                                {batch.totalLeads > 0 ? Math.round(batch.successfulImports / batch.totalLeads * 100) : 0}%
                              </div>
                              <div className="text-xs text-muted-foreground">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Import Batch</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the import batch "{deletingBatchName}"? 
                    This will permanently delete all leads associated with this batch and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleConfirmDelete} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Batch
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
