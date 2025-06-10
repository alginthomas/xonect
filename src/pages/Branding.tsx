
import React, { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BrandingSettings } from '@/components/BrandingSettings';

const Branding = () => {
  const { toast } = useToast();

  const handleSaveBranding = useCallback(async (branding: any) => {
    toast({
      title: "Branding saved",
      description: "Branding settings have been saved successfully",
    });
  }, [toast]);

  return (
    <div className="p-6">
      <BrandingSettings 
        branding={{
          companyName: '',
          companyLogo: '',
          companyWebsite: '',
          companyAddress: '',
          senderName: '',
          senderEmail: ''
        }}
        onSave={handleSaveBranding}
      />
    </div>
  );
};

export default Branding;
