
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MailchimpIntegration } from '@/components/MailchimpIntegration';
import { LinkedInAutomation } from '@/components/LinkedInAutomation';
import { Mail, Linkedin } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mailchimp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mailchimp
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mailchimp" className="mt-6">
          <MailchimpIntegration 
            selectedLeads={selectedLeads}
            onClearSelection={onClearSelection}
          />
        </TabsContent>
        
        <TabsContent value="linkedin" className="mt-6">
          <LinkedInAutomation 
            selectedLeads={selectedLeads}
            onClearSelection={onClearSelection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
