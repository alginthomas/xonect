
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  email: string;
  password: string;
  fullName: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  password,
  fullName,
  loading,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="signup-name" className="text-sm font-medium text-foreground/90 block">
          Full Name
        </Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          required
          className="w-full h-12"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="signup-email" className="text-sm font-medium text-foreground/90 block">
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="w-full h-12"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="signup-password" className="text-sm font-medium text-foreground/90 block">
          Password
        </Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={6}
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};

export default SignUpForm;
