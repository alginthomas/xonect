
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingData {
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyAddress: string;
  senderName: string;
  senderEmail: string;
}

interface BrandingSettingsProps {
  branding: BrandingData;
  onSave: (branding: BrandingData) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ branding, onSave }) => {
  const [formData, setFormData] = useState<BrandingData>(branding);
  const { toast } = useToast();

  const handleSave = () => {
    if (!formData.companyName || !formData.senderName || !formData.senderEmail) {
      toast({
        title: "Missing required fields",
        description: "Please fill in company name, sender name, and sender email",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Branding updated",
      description: "Your email branding settings have been saved",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Email Branding Settings
        </CardTitle>
        <CardDescription>
          Customize how your emails appear to recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="XONECT powered by Thomas & Niyogi"
            />
          </div>

          <div>
            <Label htmlFor="company-logo">Company Logo URL</Label>
            <Input
              id="company-logo"
              value={formData.companyLogo}
              onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
              placeholder="https://your-domain.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="sender-name">Default Sender Name *</Label>
            <Input
              id="sender-name"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="sender-email">Default Sender Email *</Label>
            <Input
              id="sender-email"
              type="email"
              value={formData.senderEmail}
              onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
              placeholder="john@company.com"
            />
          </div>

          <div>
            <Label htmlFor="company-website">Company Website</Label>
            <Input
              id="company-website"
              value={formData.companyWebsite}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
              placeholder="https://your-company.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company-address">Company Address</Label>
          <Textarea
            id="company-address"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
            placeholder="123 Business St, City, State 12345"
            rows={3}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Email Preview</h4>
          <div className="text-sm text-muted-foreground">
            <p><strong>From:</strong> {formData.senderName} &lt;{formData.senderEmail}&gt;</p>
            <p><strong>Company:</strong> {formData.companyName}</p>
            {formData.companyWebsite && <p><strong>Website:</strong> {formData.companyWebsite}</p>}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Branding Settings
        </Button>
      </CardContent>
    </Card>
  );
};
