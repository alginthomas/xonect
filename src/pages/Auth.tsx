
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import AuthCard from '@/components/auth/AuthCard';
import SignUpSuccessState from '@/components/auth/SignUpSuccessState';
import EmailVerifiedState from '@/components/auth/EmailVerifiedState';

type AuthState = 'auth' | 'signup-success' | 'email-verified';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authState, setAuthState] = useState<AuthState>('auth');
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle email confirmation on component mount
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // Handle verification errors from URL params
      if (error) {
        console.log('Verification error from URL:', error, errorDescription);
        toast({
          title: 'Email verification failed',
          description: errorDescription || 'The verification link is invalid or has expired. Please request a new one.',
          variant: 'destructive',
        });
        setAuthState('auth');
        return;
      }
      
      if (token && type === 'signup') {
        setAuthState('email-verified');
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (error) {
            console.log('Verification error:', error);
            toast({
              title: 'Email verification failed',
              description: 'The verification link is invalid or has expired. Please request a new verification email.',
              variant: 'destructive',
            });
            setAuthState('auth');
          } else {
            toast({
              title: 'Welcome!',
              description: 'Your account has been verified successfully.',
            });
          }
        } catch (error: any) {
          console.log('Verification catch error:', error);
          toast({
            title: 'Email verification failed',
            description: 'There was an error verifying your email. Please try requesting a new verification email.',
            variant: 'destructive',
          });
          setAuthState('auth');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, toast]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the current window location for the redirect
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead or use a different email address.');
        }
        throw error;
      }

      // Clear form and show success state
      setPassword('');
      setFullName('');
      setAuthState('signup-success');
      
      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please provide your email address to resend verification.',
        variant: 'destructive',
      });
      return;
    }

    setResendLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      toast({
        title: 'Email sent!',
        description: 'We\'ve sent another verification email to your inbox.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resend email',
        description: error.message || 'An error occurred while resending the email.',
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setAuthState('auth');
    setPassword('');
    setFullName('');
  };

  const handleEmailVerificationComplete = () => {
    // The auth context will handle the redirect automatically
    // This is just a fallback
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (authState) {
      case 'signup-success':
        return (
          <SignUpSuccessState
            email={email}
            onBackToSignIn={handleBackToSignIn}
            onResendEmail={handleResendEmail}
            resending={resendLoading}
          />
        );
      case 'email-verified':
        return (
          <EmailVerifiedState onComplete={handleEmailVerificationComplete} />
        );
      default:
        return (
          <AuthCard
            email={email}
            password={password}
            fullName={fullName}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onFullNameChange={setFullName}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center px-4 py-8 lg:px-8">
      <div className="w-full max-w-lg mx-auto">
        <AuthBrandHeader />
        
        {renderContent()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Thomas & Niyogi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
