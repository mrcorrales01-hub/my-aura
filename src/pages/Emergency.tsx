import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertTriangle, Phone, MessageCircle, Heart, Smartphone, Globe } from "lucide-react";

const Emergency = () => {
  const { t, language } = useLanguage();
  const [showAISupport, setShowAISupport] = useState(false);

  // Dynamic emergency contacts based on language/region
  const getEmergencyContacts = () => {
    const contacts = {
      en: [
        {
          name: t('emergency.contacts.healthcare.name'),
          description: t('emergency.contacts.healthcare.description'),
          phone: "1177",
          available: t('emergency.contacts.healthcare.available')
        },
        {
          name: t('emergency.contacts.suicide.name'),
          description: t('emergency.contacts.suicide.description'),
          phone: "90101",
          available: t('emergency.contacts.suicide.available')
        },
        {
          name: t('emergency.contacts.women.name'),
          description: t('emergency.contacts.women.description'),
          phone: "020-50 50 50",
          available: t('emergency.contacts.women.available')
        },
        {
          name: t('emergency.contacts.men.name'),
          description: t('emergency.contacts.men.description'),
          phone: "020-39 50 39",
          available: t('emergency.contacts.men.available')
        },
        {
          name: t('emergency.contacts.youth.name'),
          description: t('emergency.contacts.youth.description'),
          phone: "116 111",
          available: t('emergency.contacts.youth.available')
        }
      ],
      es: [
        {
          name: t('emergency.contacts.healthcare.name'),
          description: t('emergency.contacts.healthcare.description'),
          phone: "061",
          available: t('emergency.contacts.healthcare.available')
        },
        {
          name: t('emergency.contacts.suicide.name'),
          description: t('emergency.contacts.suicide.description'),
          phone: "717 003 717",
          available: t('emergency.contacts.suicide.available')
        },
        {
          name: t('emergency.contacts.women.name'),
          description: t('emergency.contacts.women.description'),
          phone: "016",
          available: t('emergency.contacts.women.available')
        },
        {
          name: t('emergency.contacts.men.name'),
          description: t('emergency.contacts.men.description'),
          phone: "900 100 036",
          available: t('emergency.contacts.men.available')
        },
        {
          name: t('emergency.contacts.youth.name'),
          description: t('emergency.contacts.youth.description'),
          phone: "900 20 20 10",
          available: t('emergency.contacts.youth.available')
        }
      ],
      zh: [
        {
          name: t('emergency.contacts.healthcare.name'),
          description: t('emergency.contacts.healthcare.description'),
          phone: "12320",
          available: t('emergency.contacts.healthcare.available')
        },
        {
          name: t('emergency.contacts.suicide.name'),
          description: t('emergency.contacts.suicide.description'),
          phone: "400-161-9995",
          available: t('emergency.contacts.suicide.available')
        },
        {
          name: t('emergency.contacts.women.name'),
          description: t('emergency.contacts.women.description'),
          phone: "12338",
          available: t('emergency.contacts.women.available')
        },
        {
          name: t('emergency.contacts.men.name'),
          description: t('emergency.contacts.men.description'),
          phone: "400-000-0000",
          available: t('emergency.contacts.men.available')
        },
        {
          name: t('emergency.contacts.youth.name'),
          description: t('emergency.contacts.youth.description'),
          phone: "400-1616-161",
          available: t('emergency.contacts.youth.available')
        }
      ],
      sv: [
        {
          name: t('emergency.contacts.healthcare.name'),
          description: t('emergency.contacts.healthcare.description'),
          phone: "1177",
          available: t('emergency.contacts.healthcare.available')
        },
        {
          name: t('emergency.contacts.suicide.name'),
          description: t('emergency.contacts.suicide.description'),
          phone: "90101",
          available: t('emergency.contacts.suicide.available')
        },
        {
          name: t('emergency.contacts.women.name'),
          description: t('emergency.contacts.women.description'),
          phone: "020-50 50 50",
          available: t('emergency.contacts.women.available')
        },
        {
          name: t('emergency.contacts.men.name'),
          description: t('emergency.contacts.men.description'),
          phone: "020-39 50 39",
          available: t('emergency.contacts.men.available')
        },
        {
          name: t('emergency.contacts.youth.name'),
          description: t('emergency.contacts.youth.description'),
          phone: "116 111",
          available: t('emergency.contacts.youth.available')
        }
      ]
    };
    return contacts[language as keyof typeof contacts] || contacts.en;
  };

  const emergencyContacts = getEmergencyContacts();
  
  // Get emergency data with proper fallbacks
  const getEmergencyData = () => {
    const messages = t('emergency.aiMessages');
    const steps = t('emergency.breathingSteps');
    
    return {
      aiSupportMessages: Array.isArray(messages) ? messages : [messages],
      breathingSteps: Array.isArray(steps) ? steps : [steps]
    };
  };
  
  const { aiSupportMessages, breathingSteps } = getEmergencyData();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
          <h1 className="text-3xl font-bold text-foreground">{t('emergency.title')}</h1>
        </div>
        <p className="text-lg text-foreground/70">
          {t('emergency.subtitle')}
        </p>
      </div>

      {/* Crisis Assessment */}
      <Card className="p-6 mb-8 border-destructive/20 bg-destructive/5">
        <h2 className="text-xl font-semibold text-destructive mb-4">
          {t('emergency.crisisTitle')}
        </h2>
        <p className="text-foreground/80 mb-4">
          {t('emergency.crisisDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="destructive" 
            size="lg"
            className="flex-1"
            onClick={() => window.open("tel:112")}
          >
            <Phone className="w-5 h-5 mr-2" />
            {t('emergency.callEmergency')}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => window.open(`tel:${emergencyContacts[0]?.phone || '1177'}`)}
          >
            <Phone className="w-5 h-5 mr-2" />
            {t('emergency.callHealthcare')}
          </Button>
        </div>
      </Card>

      {/* AI Support */}
      <Card className="p-6 mb-8 bg-wellness-primary/5 border-wellness-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-wellness-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            {t('emergency.aiSupportTitle')}
          </h2>
        </div>
        
        {!showAISupport ? (
          <div>
            <p className="text-foreground/80 mb-4">
              {t('emergency.aiSupportDesc')}
            </p>
            <Button 
              variant="wellness" 
              onClick={() => setShowAISupport(true)}
              className="w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('emergency.aiSupportButton')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {aiSupportMessages.map((message, index) => (
              <div key={index} className="bg-wellness-primary/10 rounded-lg p-4">
                <p className="text-foreground/90">{message}</p>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => setShowAISupport(false)}
              className="mt-4"
            >
              {t('emergency.aiSupportClose')}
            </Button>
          </div>
        )}
      </Card>

      {/* Breathing Exercise */}
      <Card className="p-6 mb-8 bg-calm/5 border-calm/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-calm rounded-full animate-pulse" />
          <h2 className="text-xl font-semibold text-foreground">
            {t('emergency.breathingTitle')}
          </h2>
        </div>
        <p className="text-foreground/80 mb-4">
          {t('emergency.breathingDesc')}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {breathingSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-calm/10 rounded-lg">
              <div className="w-6 h-6 bg-calm text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <p className="text-sm text-foreground/80">{step}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Contacts */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-6 h-6 text-wellness-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            {t('emergency.professionalTitle')}
          </h2>
        </div>
        
        <div className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{contact.name}</h3>
                <p className="text-sm text-foreground/70 mb-1">{contact.description}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'zh' ? '可用时间' : language === 'es' ? 'Disponible' : language === 'sv' ? 'Tillgänglig' : 'Available'}: {contact.available}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${contact.phone}`)}
                className="ml-4"
              >
                <Phone className="w-4 h-4 mr-2" />
                {contact.phone}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-wellness-primary/5 rounded-lg">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-wellness-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-2">{t('emergency.onlineResourcesTitle')}</h4>
              <p className="text-sm text-foreground/70">
                {t('emergency.onlineResourcesDesc')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Message */}
      <div className="text-center mt-8 p-6 bg-wellness-primary/5 rounded-xl">
        <Heart className="w-8 h-8 text-wellness-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('emergency.bottomTitle')}
        </h3>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          {t('emergency.bottomDesc')}
        </p>
      </div>
    </div>
  );
};

export default Emergency;