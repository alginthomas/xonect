
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MailchimpIntegration } from '@/components/MailchimpIntegration';
import { Mail } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface IntegrationsTabProps {
  selectedLeads: Lead[];
  onClearSelection: () => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  selectedLeads,
  onClearSelection
}) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="mailchimp" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="mailchimp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mailchimp
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mailchimp" className="mt-6">
          <MailchimpIntegration 
            selectedLeads={selectedLeads}
            onClearSelection={onClearSelection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
