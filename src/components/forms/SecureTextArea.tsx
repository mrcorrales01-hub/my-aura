import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { CrisisDetectionAlert } from '@/components/security/CrisisDetectionAlert';
import { sanitizeInput } from '@/utils/security';

interface SecureTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  contentType?: 'post' | 'comment' | 'message' | 'profile';
  maxLength?: number;
  required?: boolean;
  showSecurityIndicator?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export const SecureTextArea: React.FC<SecureTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Enter your message...",
  label,
  contentType = 'message',
  maxLength = 2000,
  required = false,
  showSecurityIndicator = true,
  onValidationChange
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [lastValidatedValue, setLastValidatedValue] = useState('');
  const { validateSecurely, isValidating, lastValidation } = useSecureValidation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue, { maxInputLength: maxLength });
    onChange(sanitizedValue);
  }, [onChange, maxLength]);

  const handleValidation = useCallback(async () => {
    if (value && value !== lastValidatedValue) {
      const validation = await validateSecurely(value, contentType);
      setLastValidatedValue(value);
      onValidationChange?.(validation.isValid);
    }
  }, [value, lastValidatedValue, validateSecurely, contentType, onValidationChange]);

  // Auto-validate on blur or after typing stops
  const handleBlur = useCallback(() => {
    handleValidation();
  }, [handleValidation]);

  const getSecurityColor = () => {
    if (!lastValidation) return 'text-muted-foreground';
    if (lastValidation.crisisDetected) return 'text-destructive';
    if (lastValidation.riskScore > 70) return 'text-destructive';
    if (lastValidation.riskScore > 40) return 'text-warning';
    return 'text-primary';
  };

  const getSecurityIcon = () => {
    if (!lastValidation) return <Shield className="h-3 w-3" />;
    if (lastValidation.crisisDetected) return <AlertTriangle className="h-3 w-3" />;
    if (lastValidation.riskScore > 70) return <AlertTriangle className="h-3 w-3" />;
    return <Shield className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label htmlFor="secure-textarea">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {/* Crisis Detection Alert */}
      {lastValidation?.crisisDetected && (
        <CrisisDetectionAlert
          severityLevel={
            lastValidation.riskScore >= 70 ? 'critical' :
            lastValidation.riskScore >= 40 ? 'high' : 'medium'
          }
          detectedTerms={[]}
          onGetHelp={() => {
            // Navigate to crisis resources
            window.open('/emergency', '_blank');
          }}
        />
      )}

      <div className="relative">
        <Textarea
          id="secure-textarea"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`min-h-[100px] ${
            lastValidation?.crisisDetected ? 'border-destructive' :
            lastValidation?.riskScore && lastValidation.riskScore > 70 ? 'border-destructive' :
            lastValidation?.riskScore && lastValidation.riskScore > 40 ? 'border-warning' : ''
          }`}
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-6 w-6 p-0"
          >
            {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Character Count and Security Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {showSecurityIndicator && (
            <div className={`flex items-center gap-1 ${getSecurityColor()}`}>
              {getSecurityIcon()}
              <span>
                {isValidating ? 'Validating...' :
                 lastValidation?.crisisDetected ? 'Crisis detected' :
                 lastValidation?.riskScore ? `Security: ${100 - lastValidation.riskScore}%` :
                 'Secure'}
              </span>
            </div>
          )}
        </div>
        <span className={value.length > maxLength * 0.9 ? 'text-warning' : ''}>
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Validation Issues */}
      {lastValidation?.issues && lastValidation.issues.length > 0 && !lastValidation.crisisDetected && (
        <Alert variant={lastValidation.riskScore > 70 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Content Review:</p>
              <ul className="list-disc list-inside space-y-1">
                {lastValidation.issues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode */}
      {showPreview && value && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Preview:</div>
          <div className="text-sm whitespace-pre-wrap break-words">
            {sanitizeInput(value)}
          </div>
        </div>
      )}
    </div>
  );
};