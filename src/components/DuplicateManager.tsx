
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Trash2, MergeIcon, Eye, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { findAllDuplicatesInDatabase, getDeduplicationPlan } from '@/utils/duplicateDetection';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onLeadsUpdated: () => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onLeadsUpdated
}) => {
  const [processing, setProcessing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Lead[] | null>(null);
  const { toast } = useToast();

  // Analyze duplicates in the database
  const duplicateAnalysis = useMemo(() => {
    return findAllDuplicatesInDatabase(leads);
  }, [leads]);

  const { emailDuplicateGroups, phoneDuplicateGroups, allDuplicateLeads } = duplicateAnalysis;

  // Get deduplication plan
  const deduplicationPlan = useMemo(() => {
    const allGroups = [...emailDuplicateGroups, ...phoneDuplicateGroups];
    return getDeduplicationPlan(allGroups);
  }, [emailDuplicateGroups, phoneDuplicateGroups]);

  const handleRemoveDuplicates = async () => {
    if (deduplicationPlan.leadsToRemove.length === 0) {
      toast({
        title: "No duplicates to remove",
        description: "No duplicate leads were found in your database",
      });
      return;
    }

    const confirmed = window.confirm(
      `This will permanently delete ${deduplicationPlan.leadsToRemove.length} duplicate leads and keep ${deduplicationPlan.leadsToKeep.length} unique leads. This action cannot be undone. Continue?`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      const leadIds = deduplicationPlan.leadsToRemove.map(lead => lead.id);
      
      // Use the database function to delete duplicates
      const { data, error } = await supabase.rpc('delete_duplicate_leads', {
        lead_ids: leadIds
      });

      if (error) {
        console.error('Error deleting duplicate leads:', error);
        throw error;
      }

      console.log(`Successfully deleted ${data} duplicate leads`);

      toast({
        title: "Duplicates removed successfully",
        description: `Removed ${data} duplicate leads from your database`,
      });

      // Refresh the leads data
      onLeadsUpdated();
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast({
        title: "Error removing duplicates",
        description: error instanceof Error ? error.message : "Failed to remove duplicate leads",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatLeadName = (lead: Lead) => {
    const name = `${lead.firstName} ${lead.lastName}`.trim();
    return name || lead.email;
  };

  const getLeadScore = (lead: Lead) => {
    return lead.completenessScore || 0;
  };

  return (
    <div className="space-y-6">
      {/* Duplicate Overview */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Duplicate Lead Management
          </CardTitle>
          <CardDescription>
            Identify and manage duplicate leads in your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email Duplicates</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {emailDuplicateGroups.reduce((sum, group) => sum + group.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    in {emailDuplicateGroups.length} groups
                  </p>
                </div>
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Duplicates</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {phoneDuplicateGroups.reduce((sum, group) => sum + group.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    in {phoneDuplicateGroups.length} groups
                  </p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Affected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {allDuplicateLeads.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    leads need attention
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {allDuplicateLeads.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Deduplication Plan Ready
                </h4>
                <p className="text-sm text-yellow-800">
                  Keep {deduplicationPlan.leadsToKeep.length} leads, remove {deduplicationPlan.leadsToRemove.length} duplicates
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGroup(allDuplicateLeads.slice(0, 10))}
                  className="whitespace-nowrap"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleRemoveDuplicates}
                  disabled={processing}
                  size="sm"
                  variant="destructive"
                  className="whitespace-nowrap"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Remove Duplicates
                </Button>
              </div>
            </div>
          )}

          {/* Duplicate Groups List */}
          {allDuplicateLeads.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Duplicate Groups</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...emailDuplicateGroups, ...phoneDuplicateGroups]
                  .filter(group => group.length > 1)
                  .slice(0, 10)
                  .map((group, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {group.length} duplicates
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {group[0].email || group[0].phone}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {group.slice(0, 3).map((lead, leadIndex) => (
                          <div key={lead.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {formatLeadName(lead)} - {lead.company}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant={leadIndex === 0 ? "default" : "outline"} className="text-xs">
                                Score: {getLeadScore(lead)}
                              </Badge>
                              {leadIndex === 0 && (
                                <Badge variant="default" className="text-xs">
                                  Keep
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {group.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{group.length - 3} more...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* No Duplicates Message */}
          {allDuplicateLeads.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                No Duplicates Found
              </h3>
              <p className="text-sm text-muted-foreground">
                Your lead database is clean and free of duplicates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal/Card */}
      {selectedGroup && (
        <Card className="apple-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Duplicate Group Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGroup(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Review leads that will be kept vs removed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedGroup.map((lead, index) => {
                const isKeep = deduplicationPlan.leadsToKeep.some(l => l.id === lead.id);
                return (
                  <div
                    key={lead.id}
                    className={`p-4 rounded-lg border ${
                      isKeep ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {formatLeadName(lead)}
                      </h4>
                      <Badge variant={isKeep ? "default" : "destructive"}>
                        {isKeep ? "Keep" : "Remove"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Company:</strong> {lead.company}</p>
                        <p><strong>Email:</strong> {lead.email}</p>
                        <p><strong>Phone:</strong> {lead.phone || "None"}</p>
                      </div>
                      <div>
                        <p><strong>Status:</strong> {lead.status}</p>
                        <p><strong>Completeness:</strong> {getLeadScore(lead)}%</p>
                        <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
