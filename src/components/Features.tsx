import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, MessageCircle, Users2, Smartphone, Globe, Shield } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: LineChart,
      title: t('features.moodTracking'),
      description: t('features.moodTrackingDesc'),
      color: "wellness-primary",
      gradient: "gradient-primary"
    },
    {
      icon: MessageCircle,
      title: t('features.aiCoaching'),
      description: t('features.aiCoachingDesc'),
      color: "calm",
      gradient: "gradient-calm"
    },
    {
      icon: Users2,
      title: t('features.relationships'),
      description: t('features.relationshipsDesc'),
      color: "coral",
      gradient: "gradient-wellness"
    },
    {
      icon: Smartphone,
      title: t('features.design'),
      description: t('features.designDesc'),
      color: "wellness-secondary",
      gradient: "gradient-primary"
    },
    {
      icon: Globe,
      title: t('features.multilingual'),
      description: t('features.multilingualDesc'),
      color: "lavender",
      gradient: "gradient-calm"
    },
    {
      icon: Shield,
      title: t('features.security'),
      description: t('features.securityDesc'),
      color: "calm",
      gradient: "gradient-wellness"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-wellness">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('features.title')}
            <span className="bg-gradient-primary bg-clip-text text-transparent"> {t('features.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            {t('features.subtitle')}
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
                  {t('features.learnMore')} →
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button variant="wellness" size="lg" className="shadow-glow">
            {t('features.exploreAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;