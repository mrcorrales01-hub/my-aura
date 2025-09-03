import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MessageCircle, Heart } from 'lucide-react';

interface CrisisDetectionAlertProps {
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedTerms?: string[];
  onDismiss?: () => void;
  onGetHelp?: () => void;
}

export const CrisisDetectionAlert: React.FC<CrisisDetectionAlertProps> = ({
  severityLevel,
  detectedTerms = [],
  onDismiss,
  onGetHelp
}) => {
  const getMessage = (level: string) => {
    switch (level) {
      case 'critical':
        return "We've detected language that suggests you may be in crisis. Your safety is our priority.";
      case 'high':
        return "We noticed some concerning language in your message. Support is available if you need it.";
      case 'medium':
        return "It looks like you might be going through a difficult time. Remember, help is available.";
      default:
        return "We're here to support you through any challenges you're facing.";
    }
  };

  const getVariant = (level: string) => {
    return level === 'critical' || level === 'high' ? 'destructive' : 'default';
  };

  const getCrisisResources = () => [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '988',
      available: '24/7'
    },
    {
      name: 'Crisis Text Line',
      text: 'Text HOME to 741741',
      available: '24/7'
    },
    {
      name: 'Emergency Services',
      phone: '911',
      available: 'Emergency situations'
    }
  ];

  if (severityLevel === 'low') return null;

  return (
    <Alert variant={getVariant(severityLevel)} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-4">
        <div>
          <p className="font-medium mb-2">{getMessage(severityLevel)}</p>
          
          {(severityLevel === 'critical' || severityLevel === 'high') && (
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Immediate Help Available:</strong>
              </p>
              
              <div className="grid gap-2">
                {getCrisisResources().map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-background/50 rounded text-sm">
                    {resource.phone && <Phone className="h-3 w-3" />}
                    {resource.text && <MessageCircle className="h-3 w-3" />}
                    <div>
                      <span className="font-medium">{resource.name}</span>
                      <br />
                      <span className="text-xs opacity-90">
                        {resource.phone || resource.text} • {resource.available}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={severityLevel === 'critical' ? 'default' : 'outline'}
              onClick={onGetHelp}
              className="flex items-center gap-2"
            >
              <Heart className="h-3 w-3" />
              Get Support Resources
            </Button>
            
            {onDismiss && severityLevel !== 'critical' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
              >
                I'm Safe
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};