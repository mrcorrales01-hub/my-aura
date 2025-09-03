import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  strengthData?: {
    strength_score: number;
    is_strong: boolean;
    issues: string[];
    recommendation: string;
  };
  isLeaked?: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  strengthData,
  isLeaked = false 
}) => {
  if (!password) return null;

  const calculateStrength = (password: string) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push('Add special characters');

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeating characters');
    }

    return { score: Math.min(score, 100), feedback };
  };

  const localStrength = calculateStrength(password);
  const score = strengthData?.strength_score ?? localStrength.score;
  const feedback = strengthData?.issues ?? localStrength.feedback;

  const getStrengthColor = (score: number) => {
    if (isLeaked) return 'destructive';
    if (score < 40) return 'destructive';
    if (score < 70) return 'warning';
    return 'default';
  };

  const getStrengthText = (score: number) => {
    if (isLeaked) return 'Compromised';
    if (score < 40) return 'Weak';
    if (score < 70) return 'Medium';
    return 'Strong';
  };

  const getStrengthIcon = (score: number) => {
    if (isLeaked) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (score < 40) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (score < 70) return <Shield className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStrengthIcon(score)}
            <span>Password Strength:</span>
          </div>
          <span className={`font-medium ${
            isLeaked ? 'text-destructive' :
            score < 40 ? 'text-destructive' :
            score < 70 ? 'text-warning' : 'text-primary'
          }`}>
            {getStrengthText(score)}
          </span>
        </div>
        <Progress 
          value={isLeaked ? 0 : score} 
          className="h-2"
        />
      </div>

      {isLeaked && (
        <Alert variant="destructive" className="text-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This password has been found in data breaches. Please choose a different password for your security.
          </AlertDescription>
        </Alert>
      )}

      {feedback.length > 0 && !isLeaked && (
        <Alert variant={score < 40 ? "destructive" : "default"} className="text-sm">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">To improve your password:</p>
              <ul className="list-disc list-inside space-y-1">
                {feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {strengthData?.recommendation && (
        <div className="text-xs text-muted-foreground">
          <strong>Recommendation:</strong> {strengthData.recommendation}
        </div>
      )}
    </div>
  );
};