import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  AlertTriangle, 
  Shield,
  Clock,
  Globe,
  User,
  Video,
  MapPin
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CrisisLevel {
  level: 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: any;
  actions: Array<{
    title: string;
    description: string;
    action: () => void;
    variant: 'default' | 'secondary' | 'destructive';
  }>;
}

const CrisisSupport = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const { toast } = useToast();

  const handleEmergencyCall = () => {
    toast({
      title: "Connecting to Emergency Services",
      description: "You will be connected to your local emergency number.",
    });
    // In real app, would trigger actual emergency call
    window.open('tel:988'); // US Suicide & Crisis Lifeline
  };

  const handleChatSupport = () => {
    toast({
      title: "Connecting to Crisis Chat",
      description: "Opening secure chat with trained crisis counselor.",
    });
    // Navigate to crisis chat interface
  };

  const handleVideoSupport = () => {
    toast({
      title: "Connecting to Video Support",
      description: "Scheduling immediate video session with licensed professional.",
    });
  };

  const handleAISupport = () => {
    toast({
      title: "Auri is here for you",
      description: "Starting specialized crisis support conversation.",
    });
    // Navigate to AI chat with crisis mode enabled
  };

  const crisisLevels: CrisisLevel[] = [
    {
      level: 'green',
      title: 'Talk Casually',
      description: 'I need someone to talk to about daily stress, work, or life challenges',
      color: 'text-aura-secondary',
      bgColor: 'bg-aura-secondary/10',
      icon: MessageCircle,
      actions: [
        {
          title: 'Chat with Auri',
          description: '24/7 AI wellness coach',
          action: handleAISupport,
          variant: 'secondary'
        },
        {
          title: 'Community Support',
          description: 'Connect with peer groups',
          action: () => {},
          variant: 'secondary'
        },
        {
          title: 'Mindfulness Exercises',
          description: 'Guided breathing and meditation',
          action: () => {},
          variant: 'secondary'
        }
      ]
    },
    {
      level: 'yellow',
      title: 'Professional Support',
      description: 'I\'m struggling with anxiety, depression, or need professional guidance',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: User,
      actions: [
        {
          title: 'Chat with Counselor',
          description: 'Licensed professional - available now',
          action: handleChatSupport,
          variant: 'default'
        },
        {
          title: 'Schedule Video Session',
          description: 'Book appointment within 2 hours',
          action: handleVideoSupport,
          variant: 'default'
        },
        {
          title: 'Crisis Text Line',
          description: 'Text HOME to 741741',
          action: () => window.open('sms:741741?body=HOME'),
          variant: 'secondary'
        }
      ]
    },
    {
      level: 'red',
      title: 'Emergency Help',
      description: 'I\'m having thoughts of self-harm or suicide, or I\'m in immediate danger',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      icon: AlertTriangle,
      actions: [
        {
          title: 'Call Emergency Services',
          description: 'Immediate professional help - Call 911',
          action: () => window.open('tel:911'),
          variant: 'destructive'
        },
        {
          title: 'Suicide & Crisis Lifeline',
          description: 'Call 988 - Free, confidential, 24/7',
          action: () => window.open('tel:988'),
          variant: 'destructive'
        },
        {
          title: 'Crisis Chat Now',
          description: 'Immediate chat with crisis counselor',
          action: handleChatSupport,
          variant: 'destructive'
        }
      ]
    }
  ];

  const emergencyContacts = [
    { country: 'United States', number: '988', name: 'Suicide & Crisis Lifeline' },
    { country: 'United Kingdom', number: '116 123', name: 'Samaritans' },
    { country: 'Canada', number: '1-833-456-4566', name: 'Talk Suicide Canada' },
    { country: 'Australia', number: '13 11 14', name: 'Lifeline Australia' },
    { country: 'Germany', number: '0800 111 0 111', name: 'Telefonseelsorge' },
    { country: 'France', number: '3114', name: 'National Suicide Prevention Line' }
  ];

  return (
    <div className="space-y-6">
      {/* Crisis Level Selection */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-aura-primary">Crisis Support</h1>
            <p className="text-foreground/70">Select the level of support you need right now</p>
          </div>
        </div>

        <div className="grid gap-4">
          {crisisLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.level}
                className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                  selectedLevel === level.level 
                    ? 'border-current shadow-lg' 
                    : 'border-transparent hover:border-gray-200'
                } ${level.bgColor}`}
                onClick={() => setSelectedLevel(selectedLevel === level.level ? '' : level.level)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full ${level.bgColor} flex items-center justify-center border-2 border-current`}>
                    <Icon className={`w-6 h-6 ${level.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${level.color} mb-2`}>{level.title}</h3>
                    <p className="text-foreground/80 mb-4">{level.description}</p>
                    
                    {selectedLevel === level.level && (
                      <div className="space-y-3 animate-fade-in">
                        {level.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.action();
                            }}
                            className="w-full justify-start text-left h-auto p-4"
                          >
                            <div>
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm opacity-80">{action.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Immediate Resources */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-destructive/10 border border-destructive/20">
          <div className="flex items-center space-x-3 mb-3">
            <Phone className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Need Help Right Now?</h3>
          </div>
          <p className="text-destructive/80 text-sm mb-4">
            If you're in immediate danger or having thoughts of self-harm
          </p>
          <div className="space-y-2">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={() => window.open('tel:911')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 911 (Emergency)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
              onClick={() => window.open('tel:988')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Call 988 (Crisis Line)
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-aura-secondary/10 border border-aura-secondary/20">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-5 h-5 text-aura-secondary" />
            <h3 className="font-semibold text-aura-secondary">24/7 Support Available</h3>
          </div>
          <p className="text-aura-secondary/80 text-sm mb-4">
            Professional counselors ready to help anytime
          </p>
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={handleChatSupport}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Crisis Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleVideoSupport}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Support
            </Button>
          </div>
        </Card>
      </div>

      {/* International Crisis Numbers */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-aura-primary" />
          <h3 className="font-semibold text-aura-primary">International Crisis Support</h3>
        </div>
        
        <div className="grid gap-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-aura-calm/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-aura-primary" />
                <div>
                  <div className="font-medium text-sm">{contact.country}</div>
                  <div className="text-xs text-foreground/60">{contact.name}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${contact.number}`)}
                className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white"
              >
                <Phone className="w-3 h-3 mr-2" />
                {contact.number}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety Plan */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <h3 className="font-semibold text-aura-primary mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Remember: You Are Not Alone
        </h3>
        <div className="space-y-3 text-sm text-foreground/80">
          <p>• Your feelings are valid, and seeking help is a sign of strength</p>
          <p>• Crisis situations are temporary - there are people who want to help</p>
          <p>• Professional counselors are trained to support you through difficult times</p>
          <p>• Your life has value and meaning, even when it doesn't feel that way</p>
        </div>
      </Card>
    </div>
  );
};

export default CrisisSupport;