
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
        return <Mail className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'phone':
        return <Phone className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'name_company':
      case 'fuzzy_name':
        return <Users className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Building className="h-3 w-3 sm:h-4 sm:w-4" />;
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
    <div className="h-full flex flex-col">
      {/* Mobile-optimized Header with Quality Score */}
      <div className="p-3 sm:p-6 border-b bg-background">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">Enhanced Duplicate Detection</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Advanced AI-powered duplicate detection
                </CardDescription>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{duplicateAnalysis.report.qualityScore.toFixed(0)}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Data Quality</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile-first stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{duplicateAnalysis.groups.length}</div>
                <div className="text-xs sm:text-sm text-blue-600">Duplicate Groups</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{duplicateAnalysis.report.totalDuplicates}</div>
                <div className="text-xs sm:text-sm text-red-600">Total Duplicates</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{leads.length - duplicateAnalysis.report.totalDuplicates}</div>
                <div className="text-xs sm:text-sm text-green-600">Unique Leads</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">{Object.keys(duplicateAnalysis.report.duplicatesByType).length}</div>
                <div className="text-xs sm:text-sm text-purple-600">Match Types</div>
              </div>
            </div>

            {/* Quality Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
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

            {/* Mobile-optimized Recommendations */}
            {duplicateAnalysis.report.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-xs sm:text-sm">Recommendations:</h4>
                <div className="space-y-1">
                  {duplicateAnalysis.report.recommendations.map((rec, index) => (
                    <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="groups" className="flex-1 flex flex-col">
          <div className="px-3 sm:px-6 py-2 border-b">
            <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
              <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="bulk" className="text-xs sm:text-sm">Bulk Actions</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="groups" className="p-3 sm:p-6 space-y-3 sm:space-y-4 mt-0">
              {duplicateAnalysis.groups.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {duplicateAnalysis.groups.map((group, groupIndex) => {
                    const primaryLead = mergeLeads(group);
                    const matches = findAdvancedDuplicates(group[0], group.slice(1));
                    
                    return (
                      <Card key={groupIndex} className="border-l-4 border-l-yellow-400">
                        <CardHeader className="pb-3">
                          <div className="space-y-3">
                            {/* Mobile-first header layout */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                  Group {groupIndex + 1}
                                </Badge>
                                <span className="font-medium text-sm">{group.length} duplicates</span>
                              </div>
                              {matches[0] && (
                                <Badge className={`${getConfidenceColor(matches[0].confidence)} border text-xs flex items-center gap-1`}>
                                  {getMatchTypeIcon(matches[0].matchType)}
                                  <span className="hidden xs:inline">{getMatchTypeLabel(matches[0].matchType)}</span>
                                  <span className="font-mono">
                                    {(matches[0].confidence * 100).toFixed(0)}%
                                  </span>
                                </Badge>
                              )}
                            </div>
                            
                            {/* Mobile-optimized action buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMergePreview(showMergePreview === `group-${groupIndex}` ? null : `group-${groupIndex}`)}
                                className="w-full sm:w-auto text-xs sm:text-sm"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Preview Merge
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMergeGroup(group)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                              >
                                <Merge className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Auto Merge
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 sm:space-y-4">
                          {/* Mobile-optimized Merge Preview */}
                          {showMergePreview === `group-${groupIndex}` && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 space-y-3">
                              <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                Merged Result Preview
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                                <div>
                                  <span className="font-medium">Name:</span>
                                  <div className="truncate">{primaryLead.firstName} {primaryLead.lastName}</div>
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
                                  <div className="truncate">{primaryLead.phone || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Mobile-optimized Individual Duplicates */}
                          <div className="space-y-2">
                            {group.map((lead, index) => (
                              <div key={lead.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedDuplicates.has(lead.id)}
                                  onChange={(e) => handleSelectDuplicate(lead.id, e.target.checked)}
                                  className="rounded mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  {/* Mobile-first lead info layout */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm truncate">{lead.firstName} {lead.lastName}</div>
                                        <div className="text-xs text-muted-foreground truncate">{lead.title}</div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                                          {index === 0 ? 'Primary' : `Dup ${index}`}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                          {lead.completenessScore}%
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <div className="text-xs truncate">{lead.email}</div>
                                      <div className="text-xs text-muted-foreground truncate">{lead.phone || 'No phone'}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs truncate">{lead.company}</div>
                                        <div className="text-xs text-muted-foreground">{lead.industry || 'No industry'}</div>
                                      </div>
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
                  <AlertDescription className="text-sm">
                    Great! No duplicate groups found in your leads database.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="p-3 sm:p-6 space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Duplicate Detection Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mobile-optimized Match Types Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Duplicates by Match Type</h4>
                    <div className="space-y-2">
                      {Object.entries(duplicateAnalysis.report.duplicatesByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getMatchTypeIcon(type)}
                            <span className="font-medium text-sm truncate">{getMatchTypeLabel(type)}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">{count} matches</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Mobile-optimized Quality Metrics */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Quality Metrics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-blue-600">
                          {((leads.length - duplicateAnalysis.report.totalDuplicates) / leads.length * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-600">Unique Rate</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-red-600">
                          {(duplicateAnalysis.report.totalDuplicates / leads.length * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-red-600">Duplicate Rate</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-green-600">
                          {duplicateAnalysis.groups.length > 0 ? (duplicateAnalysis.report.totalDuplicates / duplicateAnalysis.groups.length).toFixed(1) : '0'}
                        </div>
                        <div className="text-xs text-green-600">Avg per Group</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-purple-600">
                          {duplicateAnalysis.report.qualityScore.toFixed(0)}
                        </div>
                        <div className="text-xs text-purple-600">Quality Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk" className="p-3 sm:p-6 space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Duplicate Actions</CardTitle>
                  <CardDescription className="text-sm">
                    Perform actions on multiple duplicates at once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {selectedDuplicates.size} leads selected
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDuplicates(new Set())}
                        disabled={selectedDuplicates.size === 0}
                        className="w-full sm:w-auto text-xs"
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
                        className="w-full sm:w-auto text-xs"
                      >
                        Delete Selected ({selectedDuplicates.size})
                      </Button>
                    </div>
                  </div>

                  {/* Mobile-optimized Quick Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="justify-start text-xs sm:text-sm h-auto py-3"
                      >
                        <Merge className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span>Auto-merge High Confidence (90%+)</span>
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
                        className="justify-start text-xs sm:text-sm h-auto py-3"
                      >
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span>Merge Exact Email Matches</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
