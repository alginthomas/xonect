
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

interface MailchimpIntegrationProps {
  selectedLeads: Lead[];
  onClearSelection: () => void;
}

export const MailchimpIntegration: React.FC<MailchimpIntegrationProps> = ({
  selectedLeads,
  onClearSelection
}) => {
  const [apiKey, setApiKey] = useState('');
  const [audienceId, setAudienceId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [audiences, setAudiences] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const connectToMailchimp = async () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Mailchimp API key',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual Mailchimp API integration
      const response = await fetch('https://us1.api.mailchimp.com/3.0/lists', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAudiences(data.lists || []);
        setIsConnected(true);
        toast({
          title: 'Connected to Mailchimp',
          description: 'Successfully connected to your Mailchimp account'
        });
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Mailchimp. Please check your API key.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addLeadsToAudience = async () => {
    if (!audienceId || selectedLeads.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select an audience and leads to add',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call to add leads to Mailchimp audience
      const members = selectedLeads.map(lead => ({
        email_address: lead.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: lead.firstName,
          LNAME: lead.lastName,
          COMPANY: lead.company,
          TITLE: lead.title
        }
      }));

      // This would be the actual Mailchimp API call
      const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          members,
          update_existing: true
        })
      });

      if (response.ok) {
        toast({
          title: 'Leads Added',
          description: `Successfully added ${selectedLeads.length} leads to your Mailchimp audience`
        });
        onClearSelection();
      } else {
        throw new Error('Failed to add leads');
      }
    } catch (error) {
      toast({
        title: 'Failed to Add Leads',
        description: 'There was an error adding leads to your Mailchimp audience',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!campaignName || !subject || !emailContent || !audienceId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all campaign details',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call to create Mailchimp campaign
      const response = await fetch('https://us1.api.mailchimp.com/3.0/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'regular',
          recipients: {
            list_id: audienceId
          },
          settings: {
            subject_line: subject,
            title: campaignName,
            from_name: 'Your Company',
            reply_to: 'your-email@company.com'
          }
        })
      });

      if (response.ok) {
        const campaign = await response.json();
        toast({
          title: 'Campaign Created',
          description: `Campaign "${campaignName}" created successfully`
        });
        
        // Clear form
        setCampaignName('');
        setSubject('');
        setEmailContent('');
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      toast({
        title: 'Campaign Creation Failed',
        description: 'There was an error creating your campaign',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mailchimp Integration
          </CardTitle>
          <CardDescription>
            Connect your Mailchimp account to sync leads and create email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div>
                <Label htmlFor="mailchimp-api-key">Mailchimp API Key</Label>
                <Input
                  id="mailchimp-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Mailchimp API key"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from{' '}
                  <a href="https://mailchimp.com/help/about-api-keys/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Mailchimp Account Settings
                  </a>
                </p>
              </div>
              <Button onClick={connectToMailchimp} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect to Mailchimp'}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="default">Connected</Badge>
              <span className="text-sm text-muted-foreground">
                Connected to Mailchimp with {audiences.length} audiences
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsConnected(false)}>
                <Settings className="h-4 w-4 mr-1" />
                Reconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Management */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add Leads to Audience
            </CardTitle>
            <CardDescription>
              Add selected leads to your Mailchimp audience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm">
                {selectedLeads.length} leads selected
              </span>
              {selectedLeads.length > 0 && (
                <Button variant="outline" size="sm" onClick={onClearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="audience-select">Select Audience</Label>
              <Select value={audienceId} onValueChange={setAudienceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an audience..." />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map(audience => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={addLeadsToAudience} 
              disabled={loading || selectedLeads.length === 0 || !audienceId}
              className="w-full"
            >
              {loading ? 'Adding Leads...' : `Add ${selectedLeads.length} Leads to Audience`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign Creation */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Create Email Campaign
            </CardTitle>
            <CardDescription>
              Create and send email campaigns to your audiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject line"
              />
            </div>

            <div>
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Enter your email content..."
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="campaign-audience">Target Audience</Label>
              <Select value={audienceId} onValueChange={setAudienceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose target audience..." />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map(audience => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={createCampaign} disabled={loading} className="w-full">
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
