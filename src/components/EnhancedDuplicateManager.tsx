
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Merge,
  Eye,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { findAdvancedDuplicates, generateDuplicateReport, mergeLeads, type DuplicateMatch } from '@/utils/advancedDuplicateDetection';
import type { Lead } from '@/types/lead';

interface EnhancedDuplicateManagerProps {
  leads: Lead[];
  onBulkAction: (action: 'delete' | 'merge', leadIds: string[]) => Promise<void>;
  onMergeLeads?: (leadsToMerge: Lead[], keepLead: Lead) => Promise<void>;
}

export const EnhancedDuplicateManager: React.FC<EnhancedDuplicateManagerProps> = ({
  leads,
  onBulkAction,
  onMergeLeads
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());
  const [showMergePreview, setShowMergePreview] = useState<string | null>(null);
  const [mergeGroups, setMergeGroups] = useState<Lead[][]>([]);

  // Generate comprehensive duplicate analysis
  const duplicateAnalysis = useMemo(() => {
    const report = generateDuplicateReport(leads);
    const allMatches: DuplicateMatch[] = [];
    const groups: Lead[][] = [];
    const processedIds = new Set<string>();

    // Find duplicate groups
    leads.forEach(lead => {
      if (processedIds.has(lead.id)) return;

      const matches = findAdvancedDuplicates(lead, leads.filter(l => l.id !== lead.id));
      if (matches.length > 0) {
        const group = [lead, ...matches.map(m => m.existingLead)];
        const uniqueGroup = group.filter(l => !processedIds.has(l.id));
        
        if (uniqueGroup.length > 1) {
          groups.push(uniqueGroup);
          uniqueGroup.forEach(l => processedIds.add(l.id));
          allMatches.push(...matches);
        }
      }
    });

    return { report, groups, matches: allMatches };
  }, [leads]);

  const handleSelectDuplicate = (leadId: string, checked: boolean) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleMergeGroup = async (group: Lead[]) => {
    if (group.length < 2) return;
    
    try {
      const mergedLead = mergeLeads(group);
      const idsToRemove = group.filter(l => l.id !== mergedLead.id).map(l => l.id);
      
      if (onMergeLeads) {
        await onMergeLeads(group, mergedLead);
      } else {
        await onBulkAction('delete', idsToRemove);
      }
      
      setSelectedDuplicates(new Set());
    } catch (error) {
      console.error('Error merging leads:', error);
    }
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
      case 'fuzzy_email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'name_company':
      case 'fuzzy_name':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Exact Email';
      case 'fuzzy_email':
        return 'Similar Email';
      case 'phone':
        return 'Phone Number';
      case 'name_company':
        return 'Name + Company';
      case 'fuzzy_name':
        return 'Similar Name';
      default:
        return 'Other';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with Quality Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Enhanced Duplicate Detection
              </CardTitle>
              <CardDescription>
                Advanced AI-powered duplicate detection and intelligent merging
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{duplicateAnalysis.report.qualityScore.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Data Quality</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{duplicateAnalysis.groups.length}</div>
              <div className="text-sm text-blue-600">Duplicate Groups</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{duplicateAnalysis.report.totalDuplicates}</div>
              <div className="text-sm text-red-600">Total Duplicates</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{leads.length - duplicateAnalysis.report.totalDuplicates}</div>
              <div className="text-sm text-green-600">Unique Leads</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(duplicateAnalysis.report.duplicatesByType).length}</div>
              <div className="text-sm text-purple-600">Match Types</div>
            </div>
          </div>

          {/* Quality Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Data Quality Score</span>
              <span className={`font-medium ${duplicateAnalysis.report.qualityScore >= 80 ? 'text-green-600' : duplicateAnalysis.report.qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {duplicateAnalysis.report.qualityScore.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={duplicateAnalysis.report.qualityScore} 
              className="h-2"
            />
          </div>

          {/* Recommendations */}
          {duplicateAnalysis.report.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
              <div className="space-y-1">
                {duplicateAnalysis.report.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Duplicate Groups</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          {duplicateAnalysis.groups.length > 0 ? (
            <div className="space-y-4">
              {duplicateAnalysis.groups.map((group, groupIndex) => {
                const primaryLead = mergeLeads(group);
                const matches = findAdvancedDuplicates(group[0], group.slice(1));
                
                return (
                  <Card key={groupIndex} className="border-l-4 border-l-yellow-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            Group {groupIndex + 1}
                          </Badge>
                          <span className="font-medium">{group.length} duplicates found</span>
                          {matches[0] && (
                            <Badge className={`${getConfidenceColor(matches[0].confidence)} border`}>
                              {getMatchTypeIcon(matches[0].matchType)}
                              <span className="ml-1">{getMatchTypeLabel(matches[0].matchType)}</span>
                              <span className="ml-1 font-mono text-xs">
                                {(matches[0].confidence * 100).toFixed(0)}%
                              </span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMergePreview(showMergePreview === `group-${groupIndex}` ? null : `group-${groupIndex}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview Merge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMergeGroup(group)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Merge className="h-4 w-4 mr-1" />
                            Auto Merge
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Merge Preview */}
                      {showMergePreview === `group-${groupIndex}` && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Merged Result Preview
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Name:</span>
                              <div>{primaryLead.firstName} {primaryLead.lastName}</div>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>
                              <div className="truncate">{primaryLead.email}</div>
                            </div>
                            <div>
                              <span className="font-medium">Company:</span>
                              <div className="truncate">{primaryLead.company}</div>
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>
                              <div>{primaryLead.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Individual Duplicates */}
                      <div className="space-y-2">
                        {group.map((lead, index) => (
                          <div key={lead.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedDuplicates.has(lead.id)}
                              onChange={(e) => handleSelectDuplicate(lead.id, e.target.checked)}
                              className="rounded"
                            />
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                <div className="text-sm text-muted-foreground">{lead.title}</div>
                              </div>
                              <div>
                                <div className="text-sm">{lead.email}</div>
                                <div className="text-xs text-muted-foreground">{lead.phone || 'No phone'}</div>
                              </div>
                              <div>
                                <div className="text-sm">{lead.company}</div>
                                <div className="text-xs text-muted-foreground">{lead.industry || 'No industry'}</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                  {index === 0 ? 'Primary' : `Duplicate ${index}`}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Score: {lead.completenessScore}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Great! No duplicate groups found in your leads database.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Duplicate Detection Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Match Types Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Duplicates by Match Type</h4>
                <div className="space-y-2">
                  {Object.entries(duplicateAnalysis.report.duplicatesByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {getMatchTypeIcon(type)}
                        <span className="font-medium">{getMatchTypeLabel(type)}</span>
                      </div>
                      <Badge variant="secondary">{count} matches</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quality Metrics */}
              <div>
                <h4 className="font-medium mb-3">Quality Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {((leads.length - duplicateAnalysis.report.totalDuplicates) / leads.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">Unique Rate</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {(duplicateAnalysis.report.totalDuplicates / leads.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-red-600">Duplicate Rate</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {duplicateAnalysis.groups.length > 0 ? (duplicateAnalysis.report.totalDuplicates / duplicateAnalysis.groups.length).toFixed(1) : '0'}
                    </div>
                    <div className="text-sm text-green-600">Avg per Group</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {duplicateAnalysis.report.qualityScore.toFixed(0)}
                    </div>
                    <div className="text-sm text-purple-600">Quality Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Duplicate Actions</CardTitle>
              <CardDescription>
                Perform actions on multiple duplicates at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {selectedDuplicates.size} leads selected
                </span>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDuplicates(new Set())}
                    disabled={selectedDuplicates.size === 0}
                  >
                    Clear Selection
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      onBulkAction('delete', Array.from(selectedDuplicates));
                      setSelectedDuplicates(new Set());
                    }}
                    disabled={selectedDuplicates.size === 0}
                  >
                    Delete Selected ({selectedDuplicates.size})
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Auto-merge all high-confidence duplicates
                      duplicateAnalysis.groups.forEach(group => {
                        const matches = findAdvancedDuplicates(group[0], group.slice(1));
                        if (matches[0]?.confidence >= 0.9) {
                          handleMergeGroup(group);
                        }
                      });
                    }}
                    className="justify-start"
                  >
                    <Merge className="h-4 w-4 mr-2" />
                    Auto-merge High Confidence (90%+)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const emailDuplicates = duplicateAnalysis.groups.filter(group => {
                        const matches = findAdvancedDuplicates(group[0], group.slice(1));
                        return matches[0]?.matchType === 'email';
                      });
                      emailDuplicates.forEach(handleMergeGroup);
                    }}
                    className="justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Merge Exact Email Matches
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
