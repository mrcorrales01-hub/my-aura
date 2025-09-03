import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateField, logSecurityEvent, checkRateLimit, checkPasswordLeak } from '@/utils/security';
import { PasswordStrength } from './PasswordStrength';

interface AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  showPassword: boolean;
  rememberMe: boolean;
}

interface SecurityState {
  passwordStrength: number;
  isPasswordLeaked: boolean;
  securityScore: number;
  warnings: string[];
  strengthData?: any;
}

export const EnhancedAuth: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [authState, setAuthState] = useState<AuthState>({
    email: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    showPassword: false,
    rememberMe: false
  });
  
  const [securityState, setSecurityState] = useState<SecurityState>({
    passwordStrength: 0,
    isPasswordLeaked: false,
    securityScore: 0,
    warnings: []
  });

  // Enhanced password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;
    
    return Math.min(strength, 100);
  };

  // Enhanced password validation with database function
  const validatePasswordSecurity = async (password: string) => {
    if (!password) return;

    try {
      const leakCheck = await checkPasswordLeak(password);
      const strength = calculatePasswordStrength(password);
      
      const warnings: string[] = [];
      
      if (strength < 60) warnings.push('Password is too weak');
      if (password.length < 8) warnings.push('Password must be at least 8 characters');
      if (!/[A-Z]/.test(password)) warnings.push('Add uppercase letters');
      if (!/[0-9]/.test(password)) warnings.push('Add numbers');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) warnings.push('Add special characters');
      
      if (activeTab === 'signup' && authState.confirmPassword && password !== authState.confirmPassword) {
        warnings.push('Passwords do not match');
      }

      if (leakCheck.isLeaked) {
        warnings.push('Password found in data breaches');
      }

      setSecurityState(prev => ({
        ...prev,
        passwordStrength: strength,
        isPasswordLeaked: leakCheck.isLeaked,
        securityScore: leakCheck.isLeaked ? Math.max(strength - 50, 0) : strength,
        warnings,
        strengthData: leakCheck.strengthAnalysis
      }));
    } catch (error) {
      console.error('Password validation error:', error);
    }
  };

  // Real-time password validation with enhanced security
  useEffect(() => {
    if (authState.password) {
      // Debounce password validation to avoid excessive API calls
      const timeoutId = setTimeout(() => {
        validatePasswordSecurity(authState.password);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      // Reset security state when password is empty
      setSecurityState({
        passwordStrength: 0,
        isPasswordLeaked: false,
        securityScore: 0,
        warnings: [],
        strengthData: null
      });
    }
  }, [authState.password, authState.confirmPassword, activeTab]);

  const handleInputChange = (field: keyof AuthState, value: string | boolean) => {
    setAuthState(prev => ({ ...prev, [field]: value }));
  };

  const validateInputs = (): boolean => {
    const { email, password, confirmPassword } = authState;
    
    if (!validateField(email, 'email')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (activeTab === 'signup') {
      if (securityState.passwordStrength < 60) {
        toast({
          title: "Weak Password",
          description: "Password must be stronger for account security",
          variant: "destructive"
        });
        return false;
      }

      if (securityState.isPasswordLeaked) {
        toast({
          title: "Compromised Password",
          description: "This password has been found in data breaches. Please choose a different one.",
          variant: "destructive"
        });
        return false;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    const { email, password } = authState;
    
    // Rate limiting check
    const action = activeTab === 'signin' ? 'login_attempt' : 'signup_attempt';
    if (!checkRateLimit(action, 5, 300000)) { // 5 attempts per 5 minutes
      toast({
        title: "Rate Limited",
        description: "Too many attempts. Please wait before trying again.",
        variant: "destructive"
      });
      return;
    }

    if (!validateInputs()) return;

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      if (activeTab === 'signin') {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        await logSecurityEvent('successful_login', 'low', {
          email,
          timestamp: new Date().toISOString(),
          method: 'email_password'
        }, 20);

        toast({
          title: "Welcome back!",
          description: "Successfully signed in"
        });

      } else {
        // Sign up with enhanced security
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              security_score: securityState.securityScore
            }
          }
        });

        if (error) throw error;

        await logSecurityEvent('successful_signup', 'low', {
          email,
          password_strength: securityState.passwordStrength,
          security_score: securityState.securityScore,
          timestamp: new Date().toISOString()
        }, 25);

        toast({
          title: "Account Created!",
          description: "Please check your email for verification"
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      await logSecurityEvent('failed_authentication', 'medium', {
        email,
        error_message: error.message,
        auth_type: activeTab,
        timestamp: new Date().toISOString()
      }, 60);

      let errorMessage = 'Authentication failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Account already exists with this email';
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-destructive';
    if (strength < 70) return 'bg-warning';
    return 'bg-primary';
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Secure Authentication</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Protected by advanced security measures
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={authState.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={authState.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={authState.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => handleInputChange('showPassword', !authState.showPassword)}
                  >
                    {authState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAuth}
                disabled={authState.isLoading}
                className="w-full"
              >
                {authState.isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={authState.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={authState.showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={authState.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => handleInputChange('showPassword', !authState.showPassword)}
                  >
                    {authState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Enhanced Password Strength Indicator */}
                <PasswordStrength 
                  password={authState.password}
                  strengthData={securityState.strengthData}
                  isLeaked={securityState.isPasswordLeaked}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={authState.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>

              {/* Security Warnings */}
              {securityState.warnings.length > 0 && (
                <Alert variant={securityState.isPasswordLeaked ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="text-sm space-y-1">
                      {securityState.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleAuth}
                disabled={authState.isLoading || securityState.passwordStrength < 60}
                className="w-full"
              >
                {authState.isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Security Score Display */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Security Score:
              </span>
              <span className="font-medium">{securityState.securityScore}/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};