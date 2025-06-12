
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
    <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold">Welcome</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 h-10">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
            >
              Sign Up
            </TabsTrigger>
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
