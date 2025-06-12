
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="signin-email" className="text-sm font-medium text-foreground/90 block">
          Email
        </Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="w-full h-12"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="signin-password" className="text-sm font-medium text-foreground/90 block">
          Password
        </Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          className="w-full h-12"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 mt-8 rounded-xl font-medium text-base transition-all duration-200 apple-button" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default SignInForm;
