
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Linkedin, Send, Users, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

interface LinkedInAutomationProps {
  selectedLeads: Lead[];
  onClearSelection: () => void;
}

export const LinkedInAutomation: React.FC<LinkedInAutomationProps> = ({
  selectedLeads,
  onClearSelection
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState(
    "Hi {{firstName}}, I'd love to connect and explore potential collaboration opportunities at {{company}}. Best regards!"
  );
  const [followUpMessage, setFollowUpMessage] = useState(
    "Hi {{firstName}}, thanks for connecting! I wanted to reach out about {{company}} and see if there might be opportunities to work together."
  );
  const [delayBetweenRequests, setDelayBetweenRequests] = useState(30);
  const [sendFollowUp, setSendFollowUp] = useState(true);
  const [followUpDelay, setFollowUpDelay] = useState(24);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const { toast } = useToast();

  const connectToLinkedIn = async () => {
    // In a real implementation, this would open LinkedIn OAuth flow
    // For now, we'll simulate the connection
    try {
      toast({
        title: 'LinkedIn Connection',
        description: 'Opening LinkedIn authentication...'
      });
      
      // Simulate OAuth flow delay
      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: 'Connected to LinkedIn',
          description: 'Successfully connected to your LinkedIn account'
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to LinkedIn. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const disconnectLinkedIn = () => {
    setIsConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Disconnected from LinkedIn'
    });
  };

  const replaceVariables = (message: string, lead: Lead): string => {
    return message
      .replace(/{{firstName}}/g, lead.firstName)
      .replace(/{{lastName}}/g, lead.lastName)
      .replace(/{{company}}/g, lead.company)
      .replace(/{{title}}/g, lead.title);
  };

  const startAutomation = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No Leads Selected',
        description: 'Please select leads to send connection requests to',
        variant: 'destructive'
      });
      return;
    }

    if (!connectionMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a connection message',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setProgress({ sent: 0, total: selectedLeads.length, failed: 0 });

    // Simulate sending connection requests with realistic delays
    for (let i = 0; i < selectedLeads.length; i++) {
      const lead = selectedLeads[i];
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests * 1000));
        
        // Simulate connection request
        const personalizedMessage = replaceVariables(connectionMessage, lead);
        console.log(`Sending connection request to ${lead.firstName} ${lead.lastName}:`, personalizedMessage);
        
        // Simulate success/failure (90% success rate)
        if (Math.random() > 0.1) {
          setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
          
          // Schedule follow-up if enabled
          if (sendFollowUp) {
            setTimeout(async () => {
              const followUpText = replaceVariables(followUpMessage, lead);
              console.log(`Sending follow-up to ${lead.firstName} ${lead.lastName}:`, followUpText);
            }, followUpDelay * 60 * 60 * 1000); // Convert hours to milliseconds
          }
        } else {
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      } catch (error) {
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setIsRunning(false);
    toast({
      title: 'Automation Complete',
      description: `Sent ${progress.sent} connection requests, ${progress.failed} failed`
    });
    onClearSelection();
  };

  const stopAutomation = () => {
    setIsRunning(false);
    toast({
      title: 'Automation Stopped',
      description: 'LinkedIn automation has been stopped'
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Automation
          </CardTitle>
          <CardDescription>
            Automate LinkedIn connection requests and follow-up messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  To use LinkedIn automation, you need to connect your LinkedIn account. 
                  This will allow the system to send connection requests on your behalf.
                </AlertDescription>
              </Alert>
              <Button onClick={connectToLinkedIn} className="w-full">
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn Account
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="default">Connected</Badge>
                <span className="text-sm text-muted-foreground">
                  LinkedIn account connected
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectLinkedIn}>
                <Settings className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Templates */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>
              Customize your connection request and follow-up messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="connection-message">Connection Request Message</Label>
              <Textarea
                id="connection-message"
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Enter your connection request message..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available variables: {`{{firstName}}, {{lastName}}, {{company}}, {{title}}`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="follow-up-enabled"
                checked={sendFollowUp}
                onCheckedChange={setSendFollowUp}
              />
              <Label htmlFor="follow-up-enabled">Send follow-up message after connection</Label>
            </div>

            {sendFollowUp && (
              <>
                <div>
                  <Label htmlFor="follow-up-message">Follow-up Message</Label>
                  <Textarea
                    id="follow-up-message"
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Enter your follow-up message..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="follow-up-delay">Follow-up Delay (hours)</Label>
                  <Input
                    id="follow-up-delay"
                    type="number"
                    value={followUpDelay}
                    onChange={(e) => setFollowUpDelay(Number(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automation Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>
              Configure timing and limits for safe automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delay-between-requests">Delay Between Requests (seconds)</Label>
                <Input
                  id="delay-between-requests"
                  type="number"
                  value={delayBetweenRequests}
                  onChange={(e) => setDelayBetweenRequests(Number(e.target.value))}
                  min="10"
                  max="300"
                />
              </div>
              <div>
                <Label htmlFor="daily-limit">Daily Connection Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                LinkedIn has limits on connection requests. We recommend keeping under 50 requests per day 
                with at least 30 seconds between requests to avoid account restrictions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Lead Selection and Execution */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Connection Requests
            </CardTitle>
            <CardDescription>
              Start automation for selected leads
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

            {isRunning && (
              <div className="p-4 border rounded bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Automation in Progress</span>
                  <Button variant="outline" size="sm" onClick={stopAutomation}>
                    Stop
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Sent: {progress.sent} / {progress.total} | Failed: {progress.failed}
                </div>
              </div>
            )}

            <Button 
              onClick={startAutomation} 
              disabled={isRunning || selectedLeads.length === 0}
              className="w-full"
            >
              {isRunning ? 'Sending Requests...' : `Send ${selectedLeads.length} Connection Requests`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
