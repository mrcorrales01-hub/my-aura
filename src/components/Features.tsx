import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, MessageCircle, Users2, Smartphone, Globe, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: LineChart,
      title: "Daglig Mood Tracking",
      description: "Följ dina känslor och humör med vackra visualiseringar och insiktsfulla analyser.",
      color: "wellness-primary",
      gradient: "gradient-primary"
    },
    {
      icon: MessageCircle,
      title: "AI-stödd Coaching",
      description: "Få personliga råd och coaching baserat på din unika resa och dina mål.",
      color: "calm",
      gradient: "gradient-calm"
    },
    {
      icon: Users2,
      title: "Parterapi & Relationer",
      description: "Verktyg och övningar för att stärka kommunikation och intimitet i din relation.",
      color: "coral",
      gradient: "gradient-wellness"
    },
    {
      icon: Smartphone,
      title: "Intuitiv Design",
      description: "Vacker och användarvänlig design som gör det enkelt att hålla koll på ditt välbefinnande.",
      color: "wellness-secondary",
      gradient: "gradient-primary"
    },
    {
      icon: Globe,
      title: "Flerspråkigt Stöd",
      description: "Tillgänglig på flera språk för att nå användare över hela världen.",
      color: "lavender",
      gradient: "gradient-calm"
    },
    {
      icon: Shield,
      title: "Säkerhet & Integritet",
      description: "Dina personliga data är säkra med oss. Full kryptering och GDPR-kompatibel.",
      color: "calm",
      gradient: "gradient-wellness"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-wellness">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Allt du behöver för ditt
            <span className="bg-gradient-primary bg-clip-text text-transparent"> välbefinnande</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Aura kombinerar vetenskapligt beprövade metoder med modern teknologi för att ge dig de bästa verktygen för emotionell och relationell hälsa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-8 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-wellness transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-16 h-16 bg-${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-wellness-glow`}>
                  <IconComponent className={`w-8 h-8 text-white`} />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-foreground/70 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <Button variant="ghost" className="text-wellness-primary hover:text-wellness-primary/80 p-0">
                  Läs mer →
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button variant="wellness" size="lg" className="shadow-glow">
            Utforska alla funktioner
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;