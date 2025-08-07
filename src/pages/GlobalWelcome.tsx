import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlobalLanguageSelector } from '@/components/GlobalLanguageSelector';
import { useGlobalLocalization } from '@/hooks/useGlobalLocalization';
import { usePWA } from '@/hooks/usePWA';
import { Globe, Smartphone, Heart, Brain, Users, Shield, Sparkles, Download } from 'lucide-react';

const GlobalWelcome = () => {
  const navigate = useNavigate();
  const { currentLanguage, t, currency, emergencyNumber } = useGlobalLocalization();
  const { canInstall, installApp } = usePWA();
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      icon: Globe,
      title: 'Global Wellness Platform',
      description: 'Culturally-aware mental health support in 12+ languages with regional emergency resources',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'Advanced AI Coach',
      description: 'AI that understands cultural context, communication styles, and wellness approaches',
      color: 'text-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile & Offline Ready',
      description: 'Works offline, installs as a native app, with smart notifications',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Human Connection',
      description: 'Connect with licensed therapists, join group sessions, and find peer support',
      color: 'text-coral'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'GDPR compliant, end-to-end encryption, with regional data residency',
      color: 'text-red-500'
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description: 'Mood tracking, mindfulness exercises, relationship tools, and progress analytics',
      color: 'text-pink-500'
    }
  ];

  useEffect(() => {
    const hasSeenGlobalWelcome = localStorage.getItem('aura-global-welcome-seen');
    if (hasSeenGlobalWelcome) {
      navigate('/');
    }
  }, [navigate]);

  const handleContinue = () => {
    localStorage.setItem('aura-global-welcome-seen', 'true');
    // Check if user needs language selection or can go to home
    const selectedLanguage = localStorage.getItem('aura-language');
    if (!selectedLanguage || selectedLanguage === 'en') {
      navigate('/welcome');
    } else {
      navigate('/');
    }
  };

  const handleInstallFirst = async () => {
    await installApp();
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Welcome to Global Aura
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your culturally-aware wellness companion, designed for everyone, everywhere
          </p>
        </div>

        {/* Language Selection */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Language & Region</h2>
              <p className="text-white/80">
                Your language choice enables cultural context and local resources
              </p>
            </div>
            <GlobalLanguageSelector variant="card" />
            
            {currentLanguage !== 'en' && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3 text-white">
                  <Sparkles className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Cultural Context Enabled</div>
                    <div className="text-sm text-white/80">
                      Emergency: {emergencyNumber} • Currency: {currency}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {canInstall && (
            <Button 
              onClick={handleInstallFirst}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App & Continue
            </Button>
          )}
          
          <Button 
            onClick={handleContinue}
            size="lg"
            variant="wellness"
            className="shadow-wellness"
          >
            <Heart className="w-5 h-5 mr-2" />
            Start Your Wellness Journey
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>50+ Countries</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Licensed Therapists</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>Works Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalWelcome;