
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

interface SignUpSuccessStateProps {
  email: string;
  onBackToSignIn: () => void;
  onResendEmail: () => void;
  resending: boolean;
}

const SignUpSuccessState: React.FC<SignUpSuccessStateProps> = ({
  email,
  onBackToSignIn,
  onResendEmail,
  resending,
}) => {
  return (
    <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-xl border border-border/20 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-4 pb-6 pt-8 px-8 bg-gradient-to-b from-green-50/30 to-transparent text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Check Your Email
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed">
          We've sent a verification link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-blue-900">Next Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be automatically signed in to your account</li>
              </ol>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-amber-50/50 rounded-lg border border-amber-200/50">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-amber-900">Having trouble?</h4>
              <p className="text-sm text-amber-800">
                If the verification link doesn't work, try requesting a new one below. Make sure to use the same device and browser.
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              onClick={onResendEmail}
              disabled={resending}
              className="w-full"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </Button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={onBackToSignIn}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpSuccessState;
