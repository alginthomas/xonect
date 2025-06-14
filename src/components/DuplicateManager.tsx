
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Users, Mail, Phone, Trash2 } from 'lucide-react';
import { findAllDuplicatesInDatabase, getDeduplicationPlan } from '@/utils/duplicateDetection';
import { useToast } from "@/hooks/use-toast";
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onRemoveDuplicates: (leadIds: string[]) => Promise<void>;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({ leads, onRemoveDuplicates }) => {
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<{
    emailDuplicateGroups: Lead[][];
    phoneDuplicateGroups: Lead[][];
    allDuplicateLeads: Lead[];
  } | null>(null);
  const [deduplicationPlan, setDeduplicationPlan] = useState<{
    leadsToKeep: Lead[];
    leadsToRemove: Lead[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    analyzeDuplicates();
  }, [leads]);

  const analyzeDuplicates = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = findAllDuplicatesInDatabase(leads);
      setDuplicateAnalysis(analysis);
      
      // Create deduplication plan
      const allDuplicateGroups = [
        ...analysis.emailDuplicateGroups,
        ...analysis.phoneDuplicateGroups
      ];
      const plan = getDeduplicationPlan(allDuplicateGroups);
      setDeduplicationPlan(plan);
    } catch (error) {
      console.error('Error analyzing duplicates:', error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to analyze duplicates. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!deduplicationPlan) return;
    
    setIsRemoving(true);
    try {
      const leadIdsToRemove = deduplicationPlan.leadsToRemove.map(lead => lead.id);
      await onRemoveDuplicates(leadIdsToRemove);
      
      toast({
        variant: "default",
        title: "Duplicates Removed",
        description: `Successfully removed ${leadIdsToRemove.length} duplicate leads.`,
      });
      
      // Re-analyze after removal
      await analyzeDuplicates();
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast({
        variant: "destructive",
        title: "Removal Error",
        description: "Failed to remove duplicates. Please try again.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Progress value={undefined} className="flex-1" />
          <span className="text-sm text-muted-foreground">Analyzing duplicates...</span>
        </div>
      </Card>
    );
  }

  if (!duplicateAnalysis) {
    return null;
  }

  const totalDuplicates = duplicateAnalysis.allDuplicateLeads.length;
  const duplicateGroups = duplicateAnalysis.emailDuplicateGroups.length + duplicateAnalysis.phoneDuplicateGroups.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Duplicates</p>
              <p className="text-2xl font-bold">{totalDuplicates}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Email Duplicates</p>
              <p className="text-2xl font-bold">{duplicateAnalysis.emailDuplicateGroups.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Phone Duplicates</p>
              <p className="text-2xl font-bold">{duplicateAnalysis.phoneDuplicateGroups.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {totalDuplicates === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>No Duplicates Found</AlertTitle>
          <AlertDescription>
            Your database is clean! No duplicate leads were detected.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Deduplication Plan */}
          {deduplicationPlan && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Deduplication Plan</AlertTitle>
              <AlertDescription>
                Found {deduplicationPlan.leadsToRemove.length} duplicate leads that can be safely removed, 
                keeping {deduplicationPlan.leadsToKeep.length} best quality leads.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          {deduplicationPlan && deduplicationPlan.leadsToRemove.length > 0 && (
            <div className="flex justify-end">
              <Button 
                onClick={handleRemoveDuplicates}
                disabled={isRemoving}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  {isRemoving ? 'Removing...' : `Remove ${deduplicationPlan.leadsToRemove.length} Duplicates`}
                </span>
              </Button>
            </div>
          )}

          {/* Detailed View */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList>
              <TabsTrigger value="email">Email Duplicates ({duplicateAnalysis.emailDuplicateGroups.length})</TabsTrigger>
              <TabsTrigger value="phone">Phone Duplicates ({duplicateAnalysis.phoneDuplicateGroups.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              {duplicateAnalysis.emailDuplicateGroups.map((group, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Email: {group[0].email}</h4>
                    <Badge variant="outline">{group.length} duplicates</Badge>
                  </div>
                  <div className="space-y-2">
                    {group.map((lead) => (
                      <div key={lead.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <span>{lead.first_name} {lead.last_name} - {lead.company}</span>
                        <Badge variant={deduplicationPlan?.leadsToKeep.find(l => l.id === lead.id) ? "default" : "secondary"}>
                          {deduplicationPlan?.leadsToKeep.find(l => l.id === lead.id) ? "Keep" : "Remove"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              {duplicateAnalysis.phoneDuplicateGroups.map((group, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Phone: {group[0].phone}</h4>
                    <Badge variant="outline">{group.length} duplicates</Badge>
                  </div>
                  <div className="space-y-2">
                    {group.map((lead) => (
                      <div key={lead.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <span>{lead.first_name} {lead.last_name} - {lead.company}</span>
                        <Badge variant={deduplicationPlan?.leadsToKeep.find(l => l.id === lead.id) ? "default" : "secondary"}>
                          {deduplicationPlan?.leadsToKeep.find(l => l.id === lead.id) ? "Keep" : "Remove"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
