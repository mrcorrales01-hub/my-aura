import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MessageCircle, Heart, Smartphone, Globe } from "lucide-react";

const Emergency = () => {
  const [showAISupport, setShowAISupport] = useState(false);

  const emergencyContacts = [
    {
      name: "1177 Vårdguiden",
      description: "Sjukvårdsrådgivning dygnet runt",
      phone: "1177",
      available: "24/7"
    },
    {
      name: "Mind Självmordslinjen",
      description: "För dig som har självmordstankar",
      phone: "90101",
      available: "Vardagar 12-24, Helger 16-24"
    },
    {
      name: "Kvinnojouren",
      description: "Stöd för kvinnor som utsatts för våld",
      phone: "020-50 50 50",
      available: "24/7"
    },
    {
      name: "Mansjouren",
      description: "Stöd för män i kris",
      phone: "020-39 50 39",
      available: "Vardagar 18-22"
    },
    {
      name: "BRIS",
      description: "För barn och unga upp till 25 år",
      phone: "116 111",
      available: "24/7"
    }
  ];

  const aiSupportMessages = [
    "Jag märker att du behöver extra stöd just nu. Det var modigt av dig att söka hjälp.",
    "Dina känslor är viktiga och giltiga. Du förtjänar att må bra.",
    "Kom ihåg att andas djupt. In genom näsan, håll kvar i 4 sekunder, ut genom munnen.",
    "Du är inte ensam i det här. Det finns människor som bryr sig om dig.",
    "Denna känsla kommer att passera. Du har kommit igenom svåra stunder förut."
  ];

  const breathingExercise = [
    "Sätt dig bekvämt med fötterna i golvet",
    "Lägg en hand på bröstet, en på magen",
    "Andas in sakta genom näsan i 4 sekunder",
    "Håll andan i 4 sekunder",
    "Andas ut genom munnen i 6 sekunder",
    "Upprepa tills du känner dig lugnare"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
          <h1 className="text-3xl font-bold text-foreground">Akutläge</h1>
        </div>
        <p className="text-lg text-foreground/70">
          Du är inte ensam. Här finns omedelbar hjälp och stöd.
        </p>
      </div>

      {/* Crisis Assessment */}
      <Card className="p-6 mb-8 border-destructive/20 bg-destructive/5">
        <h2 className="text-xl font-semibold text-destructive mb-4">
          Akut fara?
        </h2>
        <p className="text-foreground/80 mb-4">
          Om du har tankar på att skada dig själv eller andra, eller om du befinner dig i omedelbar fara:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="destructive" 
            size="lg"
            className="flex-1"
            onClick={() => window.open("tel:112")}
          >
            <Phone className="w-5 h-5 mr-2" />
            Ring 112 (Akut)
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => window.open("tel:1177")}
          >
            <Phone className="w-5 h-5 mr-2" />
            Ring 1177 (Vårdguiden)
          </Button>
        </div>
      </Card>

      {/* AI Support */}
      <Card className="p-6 mb-8 bg-wellness-primary/5 border-wellness-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-wellness-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Omedelbart AI-stöd
          </h2>
        </div>
        
        {!showAISupport ? (
          <div>
            <p className="text-foreground/80 mb-4">
              Behöver du någon att prata med just nu? Vår AI-coach kan ge dig omedelbart stöd och lugnande tekniker.
            </p>
            <Button 
              variant="wellness" 
              onClick={() => setShowAISupport(true)}
              className="w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Börja prata med AI-coach
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
              Stäng AI-stöd
            </Button>
          </div>
        )}
      </Card>

      {/* Breathing Exercise */}
      <Card className="p-6 mb-8 bg-calm/5 border-calm/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-calm rounded-full animate-pulse" />
          <h2 className="text-xl font-semibold text-foreground">
            Andningsövning för ångest
          </h2>
        </div>
        <p className="text-foreground/80 mb-4">
          När du känner dig överväldigad, kan denna enkla andningsövning hjälpa dig att återfå kontrollen:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {breathingExercise.map((step, index) => (
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
            Professionell hjälp
          </h2>
        </div>
        
        <div className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{contact.name}</h3>
                <p className="text-sm text-foreground/70 mb-1">{contact.description}</p>
                <p className="text-xs text-muted-foreground">Tillgänglig: {contact.available}</p>
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
              <h4 className="font-medium text-foreground mb-2">Fler resurser online</h4>
              <p className="text-sm text-foreground/70">
                Besök <strong>1177.se</strong> för mer information om mental hälsa och var du kan få hjälp i din region.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Message */}
      <div className="text-center mt-8 p-6 bg-wellness-primary/5 rounded-xl">
        <Heart className="w-8 h-8 text-wellness-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Du är värdefull
        </h3>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Oavsett vad du går igenom just nu, kom ihåg att du förtjänar kärlek, stöd och att må bra. 
          Det är okej att be om hjälp - det visar styrka, inte svaghet.
        </p>
      </div>
    </div>
  );
};

export default Emergency;