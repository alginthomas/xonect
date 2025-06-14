
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, XCircle, Users, FileText, Database } from 'lucide-react';
import type { DuplicateValidationResult, DuplicateDetail } from '@/utils/advancedDuplicateValidation';
import type { Lead } from '@/types/lead';

interface DuplicateValidationReportProps {
  validationResult: DuplicateValidationResult;
  totalRows: number;
  onProceed: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DuplicateValidationReport: React.FC<DuplicateValidationReportProps> = ({
  validationResult,
  totalRows,
  onProceed,
  onCancel,
  isLoading = false
}) => {
  const {
    isValid,
    duplicateCount,
    duplicateDetails,
    recommendations,
    canProceed
  } = validationResult;

  const uniqueLeadsCount = totalRows - duplicateCount;
  const duplicatePercentage = totalRows > 0 ? (duplicateCount / totalRows * 100).toFixed(1) : '0';

  const getStatusIcon = () => {
    if (!isValid) return <XCircle className="h-5 w-5 text-destructive" />;
    if (duplicateCount === 0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusVariant = () => {
    if (!isValid) return 'destructive';
    if (duplicateCount === 0) return 'default';
    return 'default';
  };

  const renderDuplicateTable = (duplicates: DuplicateDetail[], title: string) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {title === 'Within File' ? <FileText className="h-5 w-5" /> : <Database className="h-5 w-5" />}
          {title} ({duplicates.length})
        </CardTitle>
        <CardDescription>
          Leads that would be skipped during import
        </CardDescription>
      </CardHeader>
      <CardContent>
        {duplicates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No duplicates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Lead Info</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicates.slice(0, 10).map((duplicate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {duplicate.index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {duplicate.lead.first_name || duplicate.lead['First Name']} {duplicate.lead.last_name || duplicate.lead['Last Name']}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {duplicate.lead.email || duplicate.lead.Email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {duplicate.lead.company || duplicate.lead.Company}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {duplicate.duplicateType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={duplicate.confidence >= 0.9 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {(duplicate.confidence * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {duplicate.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {duplicates.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 10 of {duplicates.length} duplicates
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      <Alert variant={getStatusVariant()}>
        {getStatusIcon()}
        <AlertTitle>
          {duplicateCount === 0 
            ? 'All Clear - No Duplicates Found' 
            : `${duplicateCount} Duplicate${duplicateCount > 1 ? 's' : ''} Detected`
          }
        </AlertTitle>
        <AlertDescription>
          {duplicateCount === 0 
            ? `All ${totalRows} leads are unique and ready for import.`
            : `Found ${duplicateCount} duplicate lead${duplicateCount > 1 ? 's' : ''} (${duplicatePercentage}% of total). ${uniqueLeadsCount} unique leads will be imported.`
          }
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalRows}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Unique Leads</p>
                <p className="text-2xl font-bold text-green-600">{uniqueLeadsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Duplicates</p>
                <p className="text-2xl font-bold text-red-600">{duplicateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Details */}
      {duplicateCount > 0 && (
        <Tabs defaultValue="within-file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="within-file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Within File ({duplicateDetails.withinFile.length})
            </TabsTrigger>
            <TabsTrigger value="against-database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Against Database ({duplicateDetails.againstDatabase.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="within-file" className="mt-6">
            {renderDuplicateTable(duplicateDetails.withinFile, 'Within File')}
          </TabsContent>
          
          <TabsContent value="against-database" className="mt-6">
            {renderDuplicateTable(duplicateDetails.againstDatabase, 'Against Database')}
          </TabsContent>
        </Tabs>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[140px]"
          size="lg"
        >
          Cancel Import
        </Button>
        
        <Button
          onClick={onProceed}
          disabled={!canProceed || isLoading}
          className="w-full sm:w-auto min-w-[140px]"
          size="lg"
        >
          {isLoading ? 'Importing...' : `Import ${uniqueLeadsCount} Unique Leads`}
        </Button>
      </div>
    </div>
  );
};
