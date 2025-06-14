
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Mail, Users, Send, Settings, ExternalLink, CheckCircle } from 'lucide-react';
import { useMailchimpIntegration } from '@/hooks/useMailchimpIntegration';
import type { Lead } from '@/types/lead';

interface MailchimpIntegrationProps {
  selectedLeads: Lead[];
  onClearSelection: () => void;
}

export const MailchimpIntegration: React.FC<MailchimpIntegrationProps> = ({
  selectedLeads,
  onClearSelection
}) => {
  const [audienceId, setAudienceId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');

  const {
    integration,
    audiences,
    loading,
    startOAuthFlow,
    addLeadsToAudience,
    createCampaign,
    disconnectIntegration,
  } = useMailchimpIntegration();

  const handleAddLeads = async () => {
    if (!audienceId || selectedLeads.length === 0) return;

    try {
      await addLeadsToAudience(audienceId, selectedLeads);
      onClearSelection();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || !subject || !audienceId) return;

    try {
      await createCampaign(campaignName, subject, audienceId, emailContent);
      
      // Clear form
      setCampaignName('');
      setSubject('');
      setEmailContent('');
    } catch (error) {
      // Error is handled in the hook
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
          {!integration ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-blue-50">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Secure OAuth Connection</h4>
                  <p className="text-sm text-blue-700">
                    Connect securely using Mailchimp's OAuth. Your credentials are never stored locally.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={startOAuthFlow} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect to Mailchimp'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Connected</Badge>
                    <span className="text-sm font-medium">{integration.accountName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {audiences.length} audience{audiences.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectIntegration}>
                  <Settings className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Management */}
      {integration && (
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
                      <div className="flex items-center justify-between w-full">
                        <span>{audience.name}</span>
                        {audience.member_count && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {audience.member_count} members
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddLeads} 
              disabled={loading || selectedLeads.length === 0 || !audienceId}
              className="w-full"
            >
              {loading ? 'Adding Leads...' : `Add ${selectedLeads.length} Leads to Audience`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign Creation */}
      {integration && (
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
              <Label htmlFor="email-content">Email Content (Optional)</Label>
              <Textarea
                id="email-content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Enter your email content..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can add content now or design it later in Mailchimp
              </p>
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
                      <div className="flex items-center justify-between w-full">
                        <span>{audience.name}</span>
                        {audience.member_count && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {audience.member_count} members
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateCampaign} 
              disabled={loading || !campaignName || !subject || !audienceId} 
              className="w-full"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
