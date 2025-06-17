
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface EmailVerifiedStateProps {
  onComplete: () => void;
}

const EmailVerifiedState: React.FC<EmailVerifiedStateProps> = ({ onComplete }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-xl border border-border/20 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-4 pb-6 pt-8 px-8 bg-gradient-to-b from-green-50/30 to-transparent text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Email Verified!
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          Your account has been successfully verified
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to your dashboard in {countdown} seconds...</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerifiedState;
