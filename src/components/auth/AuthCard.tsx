
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthCardProps {
  email: string;
  password: string;
  fullName: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
}

const AuthCard: React.FC<AuthCardProps> = ({
  email,
  password,
  fullName,
  loading,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSignIn,
  onSignUp,
}) => {
  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-left">Welcome</CardTitle>
        <CardDescription className="text-left">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-0">
            <SignInForm
              email={email}
              password={password}
              loading={loading}
              onEmailChange={onEmailChange}
              onPasswordChange={onPasswordChange}
              onSubmit={onSignIn}
            />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-0">
            <SignUpForm
              email={email}
              password={password}
              fullName={fullName}
              loading={loading}
              onEmailChange={onEmailChange}
              onPasswordChange={onPasswordChange}
              onFullNameChange={onFullNameChange}
              onSubmit={onSignUp}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthCard;
