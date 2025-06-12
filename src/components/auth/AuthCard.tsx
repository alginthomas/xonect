
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
  onSignUp
}) => {
  return <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-xl border border-border/20 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-4 pb-8 pt-8 px-8 bg-gradient-to-b from-muted/30 to-transparent">
        <CardTitle className="text-3xl text-center font-bold tracking-tight text-foreground">
          Welcome
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-base leading-relaxed">
          Sign in to your account or create a new one to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/10">
            <TabsTrigger 
              value="signin" 
              className="h-12 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 text-muted-foreground hover:text-foreground data-[state=active]:scale-[0.98] px-6"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="h-12 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 text-muted-foreground hover:text-foreground data-[state=active]:scale-[0.98] px-6"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-0 mt-0 focus-visible:outline-none">
            <SignInForm email={email} password={password} loading={loading} onEmailChange={onEmailChange} onPasswordChange={onPasswordChange} onSubmit={onSignIn} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-0 mt-0 focus-visible:outline-none">
            <SignUpForm email={email} password={password} fullName={fullName} loading={loading} onEmailChange={onEmailChange} onPasswordChange={onPasswordChange} onFullNameChange={onFullNameChange} onSubmit={onSignUp} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
};
export default AuthCard;
