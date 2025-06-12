import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import AuthCard from '@/components/auth/AuthCard';
const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle email confirmation on component mount
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      if (token && type === 'signup') {
        try {
          const {
            error
          } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          if (error) {
            toast({
              title: 'Email verification failed',
              description: error.message,
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Email verified!',
              description: 'Your account has been verified successfully.'
            });
          }
        } catch (error: any) {
          toast({
            title: 'Email verification failed',
            description: 'There was an error verifying your email.',
            variant: 'destructive'
          });
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
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.'
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 py-0 px-0">
      <div className="w-full max-w-md">
        <AuthBrandHeader />
        
        <AuthCard email={email} password={password} fullName={fullName} loading={loading} onEmailChange={setEmail} onPasswordChange={setPassword} onFullNameChange={setFullName} onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 Thomas & Niyogi. All rights reserved.
          </p>
        </div>
      </div>
    </div>;
};
export default Auth;