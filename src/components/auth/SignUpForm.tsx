
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/security/PasswordStrengthIndicator';
import { validatePasswordStrength } from '@/utils/security/passwordValidation';

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
  const passwordStrength = validatePasswordStrength(password);
  const isPasswordValid = passwordStrength.isValid;
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground block">
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
        <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground block">
          Email Address
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
        <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground block">
          Password
        </Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={8}
          className="w-full h-12"
        />
        <PasswordStrengthIndicator password={password} />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 mt-8 rounded-xl font-semibold text-base transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
        disabled={loading || !isPasswordValid}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
