
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, Users, AlertTriangle } from 'lucide-react';
import { detectDuplicates } from '@/utils/duplicateDetection';
import { detectPhoneDuplicates } from '@/utils/phoneDeduplication';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onDeleteLead: (leadId: string) => Promise<void>;
}

interface DuplicateGroup {
  leads: Lead[];
  duplicateType: 'email' | 'phone' | 'name_company';
  matchingField: string;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onDeleteLead
}) => {
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  const duplicateGroups = useMemo(() => {
    const emailDuplicates = detectDuplicates(leads, 'email');
    const phoneDuplicates = detectPhoneDuplicates(leads);
    const nameCompanyDuplicates = detectDuplicates(leads, 'name_company');

    const groups: DuplicateGroup[] = [];

    // Process email duplicates
    Object.entries(emailDuplicates).forEach(([email, duplicateLeads]) => {
      if (duplicateLeads.length > 1) {
        groups.push({
          leads: duplicateLeads,
          duplicateType: 'email',
          matchingField: email
        });
      }
    });

    // Process phone duplicates
    Object.entries(phoneDuplicates).forEach(([phone, duplicateLeads]) => {
      if (duplicateLeads.length > 1) {
        groups.push({
          leads: duplicateLeads,
          duplicateType: 'phone',
          matchingField: phone
        });
      }
    });

    // Process name+company duplicates
    Object.entries(nameCompanyDuplicates).forEach(([nameCompany, duplicateLeads]) => {
      if (duplicateLeads.length > 1) {
        groups.push({
          leads: duplicateLeads,
          duplicateType: 'name_company',
          matchingField: nameCompany
        });
      }
    });

    return groups;
  }, [leads]);

  const handleDeleteLead = async (leadId: string) => {
    setDeletingLeadId(leadId);
    try {
      await onDeleteLead(leadId);
    } finally {
      setDeletingLeadId(null);
    }
  };

  const getDuplicateTypeLabel = (type: DuplicateGroup['duplicateType']) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone';
      case 'name_company':
        return 'Name & Company';
      default:
        return 'Unknown';
    }
  };

  const getDuplicateTypeBadgeVariant = (type: DuplicateGroup['duplicateType']) => {
    switch (type) {
      case 'email':
        return 'destructive';
      case 'phone':
        return 'secondary';
      case 'name_company':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (duplicateGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Duplicate Detection
          </CardTitle>
          <CardDescription>
            No duplicates found in your leads database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">All clean!</p>
            <p className="text-sm">No duplicate leads detected in your database.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Duplicate Leads Detected</h2>
        <Badge variant="secondary">{duplicateGroups.length} groups</Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Duplicate Detection Results</AlertTitle>
        <AlertDescription>
          Found {duplicateGroups.length} groups of duplicate leads. Review each group and remove duplicates to keep your database clean.
        </AlertDescription>
      </Alert>

      {duplicateGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant={getDuplicateTypeBadgeVariant(group.duplicateType)}>
                  {getDuplicateTypeLabel(group.duplicateType)}
                </Badge>
                Duplicate Group {groupIndex + 1}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {group.leads.length} leads
              </span>
            </div>
            <CardDescription>
              Matching {getDuplicateTypeLabel(group.duplicateType).toLowerCase()}: {group.matchingField}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.leads.map((lead, leadIndex) => (
                <div key={lead.id}>
                  {leadIndex > 0 && <Separator className="my-4" />}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
                      <AvatarFallback>
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm">
                            {lead.firstName} {lead.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {lead.title} at {lead.company}
                          </p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{lead.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Added {lead.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deletingLeadId === lead.id}
                          className="ml-4 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingLeadId === lead.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
