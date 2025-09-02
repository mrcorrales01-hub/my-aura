// Enhanced security utilities for client-side protection
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityConfig {
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  maxInputLength: number;
  allowedTags: string[];
  allowedAttributes: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  enableXSSProtection: true,
  enableCSRFProtection: true,
  maxInputLength: 5000,
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
  allowedAttributes: ['class']
};

// XSS Protection - Sanitize user input
export function sanitizeInput(
  input: string, 
  config: Partial<SecurityConfig> = {}
): string {
  const mergedConfig = { ...defaultSecurityConfig, ...config };
  
  if (!mergedConfig.enableXSSProtection) return input;
  
  // Trim and limit length
  const trimmed = input.trim().substring(0, mergedConfig.maxInputLength);
  
  // Configure DOMPurify
  const cleanHTML = DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: mergedConfig.allowedTags,
    ALLOWED_ATTR: mergedConfig.allowedAttributes,
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    RETURN_TRUSTED_TYPE: false
  });
  
  return cleanHTML;
}

// Enhanced content validation
export interface ContentValidation {
  isValid: boolean;
  riskScore: number;
  issues: string[];
  crisisDetected: boolean;
  requiresReview: boolean;
}

export async function validateContent(
  content: string,
  contentType: 'post' | 'comment' | 'message' | 'profile' = 'post'
): Promise<ContentValidation> {
  try {
    // Client-side pre-validation
    const sanitized = sanitizeInput(content);
    const issues: string[] = [];
    let riskScore = 0;

    // Length validation
    if (content.length === 0) {
      issues.push('Content cannot be empty');
      return { isValid: false, riskScore: 0, issues, crisisDetected: false, requiresReview: false };
    }

    if (content.length > 5000) {
      issues.push('Content exceeds maximum length');
      riskScore += 20;
    }

    // Basic pattern detection (client-side screening)
    const suspiciousPatterns = [
      /javascript:/i,
      /<script/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        issues.push('Potentially unsafe content detected');
        riskScore += 50;
        break;
      }
    }

    // Crisis keywords (basic detection)
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'self-harm', 'hurt myself', 'want to die'
    ];
    
    const lowerContent = content.toLowerCase();
    const crisisDetected = crisisKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );

    if (crisisDetected) {
      riskScore += 100;
      // Log crisis detection for immediate response
      logSecurityEvent('crisis_content_detected', 'critical', {
        content_type: contentType,
        content_length: content.length
      }, 90);
    }

    // Server-side validation for comprehensive analysis
    const { data: serverValidation } = await supabase.rpc(
      'enhanced_content_moderation',
      { 
        content_text: sanitized,
        content_type: contentType 
      }
    );

    if (serverValidation && typeof serverValidation === 'object') {
      const validation = serverValidation as {
        risk_score?: number;
        flagged?: boolean;
        reasons?: string[];
        crisis_detected?: boolean;
        requires_review?: boolean;
      };
      
      riskScore = Math.max(riskScore, validation.risk_score || 0);
      if (validation.flagged && validation.reasons) {
        issues.push(...validation.reasons);
      }
      
      return {
        isValid: riskScore < 70 && issues.length === 0,
        riskScore,
        issues,
        crisisDetected: crisisDetected || validation.crisis_detected || false,
        requiresReview: riskScore > 40 || validation.requires_review || false
      };
    }

    return {
      isValid: riskScore < 70 && issues.length === 0,
      riskScore,
      issues,
      crisisDetected,
      requiresReview: riskScore > 40
    };

  } catch (error) {
    console.error('Content validation error:', error);
    return {
      isValid: false,
      riskScore: 100,
      issues: ['Validation failed - please try again'],
      crisisDetected: false,
      requiresReview: true
    };
  }
}

// Security event logging
export async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  details: Record<string, any> = {},
  riskScore: number = 50
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase.rpc('log_security_event_v2', {
      p_user_id: user.id,
      p_event_type: eventType,
      p_severity_level: severity,
      p_event_details: details,
      p_risk_score: riskScore
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Rate limiting for client-side actions
const actionTimestamps = new Map<string, number[]>();

export function checkRateLimit(
  action: string,
  limit: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!actionTimestamps.has(action)) {
    actionTimestamps.set(action, []);
  }
  
  const timestamps = actionTimestamps.get(action)!;
  
  // Remove old timestamps
  const validTimestamps = timestamps.filter(ts => ts > windowStart);
  
  if (validTimestamps.length >= limit) {
    logSecurityEvent('rate_limit_exceeded', 'medium', {
      action,
      attempt_count: validTimestamps.length + 1,
      window_ms: windowMs
    }, 60);
    return false;
  }
  
  // Add current timestamp
  validTimestamps.push(now);
  actionTimestamps.set(action, validTimestamps);
  
  return true;
}

// Client-side encryption utilities (for future use)
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Input validation schemas
export const validationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  name: /^[a-zA-Z\s\-']{1,50}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

export function validateField(value: string, field: keyof typeof validationSchemas): boolean {
  return validationSchemas[field].test(value);
}

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}