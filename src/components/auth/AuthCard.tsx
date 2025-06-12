
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
    <Card className="bg-background/95 backdrop-blur-sm shadow-lg border-0 apple-blur apple-shadow-lg">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl text-center font-semibold tracking-tight">Welcome</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8 px-6">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/30 rounded-xl">
            <TabsTrigger 
              value="signin" 
              className="h-10 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm px-3 text-center overflow-hidden"
            >
              <span className="truncate">Sign In</span>
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="h-10 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm px-3 text-center overflow-hidden"
            >
              <span className="truncate">Sign Up</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-0 mt-0">
            <SignInForm
              email={email}
              password={password}
              loading={loading}
              onEmailChange={onEmailChange}
              onPasswordChange={onPasswordChange}
              onSubmit={onSignIn}
            />
          </TabsContent>

          <TabsContent value="signup" className="space-y-0 mt-0">
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
