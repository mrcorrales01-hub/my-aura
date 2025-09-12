import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { getResources, detectCountry } from '@/features/crisis/resources';
import { useToast } from '@/hooks/use-toast';

export default function CrisisResourcesPage() {
  const { t } = useTranslation('crisis');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const country = detectCountry();
  const resources = getResources(country);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t('copied') });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({ title: 'Kunde inte kopiera', variant: 'destructive' });
    }
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'emergency': return <Phone className="h-5 w-5 text-red-600" />;
      case 'phone': return <Phone className="h-5 w-5 text-blue-600" />;
      case 'chat': return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'sms': return <MessageCircle className="h-5 w-5 text-purple-600" />;
      default: return <ExternalLink className="h-5 w-5 text-gray-600" />;
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'phone': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chat': return 'bg-green-100 text-green-800 border-green-200';
      case 'advice': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleResourceClick = (resource: any) => {
    if (resource.href.startsWith('tel:')) {
      window.open(resource.href, '_self');
    } else {
      window.open(resource.href, '_blank', 'noopener,noreferrer');
    }
  };

  const extractPhoneNumber = (href: string) => {
    return href.replace('tel:', '');
  };

  const auriPrompt = "Hur använder jag dessa resurser idag? 3 konkreta steg.";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/crisis')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('resources')}</h1>
              <p className="text-sm text-muted-foreground">
                {country === 'SE' ? 'Sverige' : 'International'}
              </p>
            </div>
          </div>

          {/* Resources List */}
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getKindIcon(resource.kind)}
                      <div>
                        <CardTitle className="text-lg">{resource.label}</CardTitle>
                        <Badge className={`mt-1 ${getKindColor(resource.kind)}`}>
                          {resource.kind}
                        </Badge>
                      </div>
                    </div>
                    
                    {resource.href.startsWith('tel:') && (
                      <Button
                        onClick={() => copyToClipboard(extractPhoneNumber(resource.href))}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {resource.hours && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{resource.hours}</span>
                      </div>
                    )}
                    
                    {resource.note && (
                      <p className="text-sm text-muted-foreground">{resource.note}</p>
                    )}
                    
                    <Button
                      onClick={() => handleResourceClick(resource)}
                      className={`w-full ${
                        resource.kind === 'emergency' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : ''
                      }`}
                      size="lg"
                    >
                      {resource.kind === 'emergency' && <Phone className="h-4 w-4 mr-2" />}
                      {resource.kind === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                      {resource.kind === 'chat' && <MessageCircle className="h-4 w-4 mr-2" />}
                      
                      {resource.href.startsWith('tel:') ? 'Ring' : 'Öppna'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Auri Quick Prompt */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-medium">Fråga Auri</h4>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => {
                    navigate(`/chat?prompt=${encodeURIComponent(auriPrompt)}`);
                  }}
                >
                  "{auriPrompt}"
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}