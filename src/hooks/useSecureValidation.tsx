import { useState, useCallback } from 'react';
import { validateContent, ContentValidation } from '@/utils/security';

export const useSecureValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ContentValidation | null>(null);

  const validateSecurely = useCallback(async (
    content: string,
    contentType: 'post' | 'comment' | 'message' | 'profile' = 'post'
  ): Promise<ContentValidation> => {
    setIsValidating(true);
    
    try {
      const validation = await validateContent(content, contentType);
      setLastValidation(validation);
      return validation;
    } catch (error) {
      console.error('Secure validation failed:', error);
      const errorValidation: ContentValidation = {
        isValid: false,
        riskScore: 100,
        issues: ['Validation failed - please try again'],
        crisisDetected: false,
        requiresReview: true
      };
      setLastValidation(errorValidation);
      return errorValidation;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const resetValidation = useCallback(() => {
    setLastValidation(null);
  }, []);

  return {
    validateSecurely,
    isValidating,
    lastValidation,
    resetValidation
  };
};