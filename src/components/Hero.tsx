import { Button } from "@/components/ui/button";
import heroImage from "@/assets/aura-hero.jpg";
import { Heart, Brain, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-wellness-secondary/30 rounded-full animate-float" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-coral/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-lavender/40 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
        {/* Brand + SEO H1 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Aura Wellness — Mental Health & Relationship Coaching
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 font-light">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="flex flex-col items-center gap-2 animate-wellness-glow">
            <div className="p-4 bg-wellness-primary/20 rounded-full">
              <Brain className="w-8 h-8 text-wellness-primary" />
            </div>
            <span className="text-sm font-medium">{t('hero.mentalHealth')}</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-wellness-glow" style={{ animationDelay: '1s' }}>
            <div className="p-4 bg-coral/20 rounded-full">
              <Heart className="w-8 h-8 text-coral" />
            </div>
            <span className="text-sm font-medium">{t('hero.emotionalBalance')}</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-wellness-glow" style={{ animationDelay: '2s' }}>
            <div className="p-4 bg-calm/20 rounded-full">
              <Users className="w-8 h-8 text-calm" />
            </div>
            <span className="text-sm font-medium">{t('hero.relationshipCoaching')}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="wellness" 
            size="hero" 
            className="min-w-[200px] hover-scale"
            onClick={() => navigate('/auth')}
          >
            {t('home.getStarted')}
          </Button>
          <Button 
            variant="outline" 
            size="hero" 
            className="min-w-[200px] border-foreground/20 hover:bg-foreground/10 hover-scale"
            onClick={() => {
              const featuresSection = document.getElementById('features-section');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {t('hero.learnMore')}
          </Button>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          {t('home.description')}
        </p>
      </div>
    </section>
  );
};

export default Hero;