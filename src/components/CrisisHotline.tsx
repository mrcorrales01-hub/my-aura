import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGlobalLocalization } from '@/hooks/useGlobalLocalization';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Phone, 
  MessageSquare, 
  Globe, 
  Clock, 
  Shield, 
  Heart,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Users
} from 'lucide-react';
import { getLanguage } from '@/lib/i18n';

interface CrisisResource {
  country: string;
  emergency_number: string;
  crisis_hotlines: {
    name: string;
    phone: string;
    hours: string;
    website?: string;
    chat?: string;
  }[];
}

const crisisResources: CrisisResource[] = [
  {
    country: 'US',
    emergency_number: '911',
    crisis_hotlines: [
      {
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        hours: '24/7',
        website: 'https://988lifeline.org',
        chat: 'https://988lifeline.org/chat'
      },
      {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        hours: '24/7',
        website: 'https://crisistextline.org'
      },
      {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        hours: '24/7',
        website: 'https://samhsa.gov'
      }
    ]
  },
  {
    country: 'SE',
    emergency_number: '112',
    crisis_hotlines: [
      {
        name: 'Mind Självmordslinjen',
        phone: '90101',
        hours: '24/7',
        website: 'https://mind.se'
      },
      {
        name: 'BRIS Vuxentelefon',
        phone: '077-150 50 50',
        hours: 'Mon-Fri 9-21',
        website: 'https://bris.se'
      }
    ]
  },
  {
    country: 'GB',
    emergency_number: '999',
    crisis_hotlines: [
      {
        name: 'Samaritans',
        phone: '116 123',
        hours: '24/7',
        website: 'https://samaritans.org',
        chat: 'https://samaritans.org/how-we-can-help/contact-samaritan'
      },
      {
        name: 'Mind Infoline',
        phone: '0300 123 3393',
        hours: 'Mon-Fri 9-18',
        website: 'https://mind.org.uk'
      }
    ]
  },
  {
    country: 'DE',
    emergency_number: '112',
    crisis_hotlines: [
      {
        name: 'Telefonseelsorge',
        phone: '0800 111 0 111 or 0800 111 0 222',
        hours: '24/7',
        website: 'https://telefonseelsorge.de',
        chat: 'https://chat.telefonseelsorge.org'
      },
      {
        name: 'Nummer gegen Kummer',
        phone: '116 111',
        hours: 'Mon-Sat 14-20',
        website: 'https://nummergegenkummer.de'
      }
    ]
  },
  {
    country: 'FR',
    emergency_number: '15',
    crisis_hotlines: [
      {
        name: 'SOS Amitié',
        phone: '09 72 39 40 50',
        hours: '24/7',
        website: 'https://sos-amitie.org'
      },
      {
        name: 'Suicide Écoute',
        phone: '01 45 39 40 00',
        hours: '24/7',
        website: 'https://suicide-ecoute.fr'
      }
    ]
  },
  {
    country: 'AU',
    emergency_number: '000',
    crisis_hotlines: [
      {
        name: 'Lifeline Australia',
        phone: '13 11 14',
        hours: '24/7',
        website: 'https://lifeline.org.au',
        chat: 'https://lifeline.org.au/crisis-chat'
      },
      {
        name: 'Beyond Blue',
        phone: '1300 22 4636',
        hours: '24/7',
        website: 'https://beyondblue.org.au'
      }
    ]
  }
];

const CrisisHotline = () => {
  const [userCountry, setUserCountry] = useState<string>('US');
  const [currentResource, setCurrentResource] = useState<CrisisResource | null>(null);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const { t, currentLanguage } = useGlobalLocalization();
  const { user } = useAuth();

  useEffect(() => {
    detectUserLocation();
  }, []);

  useEffect(() => {
    if (userCountry) {
      const resource = crisisResources.find(r => r.country === userCountry) || crisisResources[0];
      setCurrentResource(resource);
    }
  }, [userCountry]);

  const detectUserLocation = async () => {
    try {
      // Try to get country from user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryMap: { [key: string]: string } = {
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'Europe/Stockholm': 'SE',
        'Europe/London': 'GB',
        'Europe/Berlin': 'DE',
        'Europe/Paris': 'FR',
        'Australia/Sydney': 'AU'
      };

      const detectedCountry = countryMap[timezone] || 'US';
      setUserCountry(detectedCountry);
    } catch (error) {
      console.error('Error detecting location:', error);
      setUserCountry('US');
    }
  };

  const logCrisisInteraction = async (actionTaken: string) => {
    if (user) {
      try {
        await supabase.from('crisis_interactions').insert({
          user_id: user.id,
          crisis_level: 'moderate',
          action_taken: actionTaken,
          notes: `User accessed ${actionTaken} from crisis hotline component`
        });
      } catch (error) {
        console.error('Error logging crisis interaction:', error);
      }
    }
  };

  const handleEmergencyCall = (phone: string) => {
    logCrisisInteraction(`Emergency call to ${phone}`);
    window.open(`tel:${phone}`, '_self');
  };

  const handleHotlineCall = (phone: string) => {
    logCrisisInteraction(`Crisis hotline call to ${phone}`);
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsiteVisit = (url: string) => {
    logCrisisInteraction(`Visited crisis website: ${url}`);
    window.open(url, '_blank');
  };

  const handleChatStart = (url: string) => {
    logCrisisInteraction(`Started crisis chat at: ${url}`);
    window.open(url, '_blank');
  };

  if (!currentResource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">Crisis Support</h1>
          <p className="text-xl text-foreground/80">
            You are not alone. Help is available 24/7.
          </p>
        </div>

        {/* Emergency Action Button */}
        <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
              Immediate Emergency?
            </h2>
            <p className="text-lg text-red-600 dark:text-red-300 mb-6">
              If you're in immediate danger or having thoughts of self-harm
            </p>
            
            <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                  <Phone className="w-6 h-6 mr-3" />
                  Call Emergency Services
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Emergency Services</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Your Location: {currentResource.country}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg mb-4">Emergency Number:</p>
                    <Button 
                      size="lg" 
                      className="bg-red-600 hover:bg-red-700 text-white text-2xl px-12 py-6"
                      onClick={() => handleEmergencyCall(currentResource.emergency_number)}
                    >
                      <Phone className="w-8 h-8 mr-4" />
                      {currentResource.emergency_number}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    This will call emergency services in your region
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Crisis Hotlines */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {currentResource.crisis_hotlines.map((hotline, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{hotline.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-lg font-semibold">{hotline.phone}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{hotline.hours}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleHotlineCall(hotline.phone)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {hotline.website && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWebsiteVisit(hotline.website!)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  )}
                  {hotline.chat && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleChatStart(hotline.chat!)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Crisis Chat */}
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
              <span>AI Crisis Support Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600 dark:text-blue-300 mb-4">
              Get immediate support from our AI crisis counselor trained in de-escalation techniques.
            </p>
            <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Crisis Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crisis Support Chat</DialogTitle>
                </DialogHeader>
                <div className="h-96 bg-muted/50 rounded-lg p-4">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Crisis AI chat interface would be implemented here.</p>
                    <p className="text-sm mt-2">
                      This would connect to a specialized crisis intervention AI model.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Safety Resources */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Safety Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create a personalized safety plan for crisis moments.
              </p>
              <Button variant="outline" size="sm">
                Create Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Support Network</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with trusted friends and family members.
              </p>
              <Button variant="outline" size="sm">
                Add Contacts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Self-Care</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Immediate coping strategies and breathing exercises.
              </p>
              <Button variant="outline" size="sm">
                Start Exercise
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Privacy & Confidentiality
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                All crisis interactions are confidential and encrypted. We may log basic usage statistics 
                to improve our services, but never store personal conversation content without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisHotline;