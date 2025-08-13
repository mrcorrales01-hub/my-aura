import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Brain, 
  Users, 
  Globe, 
  Shield,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    key: 'aiCoaching',
    description: 'Get personalized guidance from Auri, our empathetic AI coach trained in CBT, DBT, and ACT techniques.'
  },
  {
    icon: Brain,
    key: 'moodTracking',
    description: 'Track your emotional patterns and identify trends to understand your mental health journey.'
  },
  {
    icon: Users,
    key: 'relationships',
    description: 'Build stronger, healthier connections with guided conversations and role-play scenarios.'
  },
  {
    icon: Globe,
    key: 'multilingual',
    description: 'Available in 22 languages with culturally-sensitive support worldwide.'
  },
  {
    icon: Shield,
    key: 'privacy',
    description: 'Your data is secure and confidential with GDPR-compliant privacy protection.'
  },
  {
    icon: Heart,
    key: 'design',
    description: 'Beautiful, calming interface designed to promote emotional well-being.'
  }
];

const testimonials = [
  {
    name: 'Emma',
    location: 'Sweden',
    text: 'My Aura har hjälpt mig förstå mina känslor bättre. Auri känns som en riktig coach som bryr sig om mig.',
    rating: 5
  },
  {
    name: 'Carlos',
    location: 'Spain',
    text: 'The real-time coaching sessions have transformed how I handle stress. It\'s like having a therapist available 24/7.',
    rating: 5
  },
  {
    name: 'Priya',
    location: 'India',
    text: 'मुझे लगता है कि मैं अब अपनी भावनाओं को बेहतर तरीके से समझ सकती हूं। यह ऐप वास्तव में मददगार है।',
    rating: 5
  }
];

export default function Index() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('app.name')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {t('app.tagline')}
          </p>
          <p className="text-lg mb-12 opacity-80 max-w-2xl mx-auto">
            {t('welcome.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for <span className="text-primary">holistic wellness</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your mental health journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key} className="border-0 shadow-soft hover:shadow-wellness transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 wellness-gradient rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.key === 'aiCoaching' ? 'AI Coaching' : 
                       feature.key === 'moodTracking' ? 'Mood Tracking' :
                       feature.key === 'relationships' ? 'Relationships' :
                       feature.key === 'multilingual' ? 'Multilingual' :
                       feature.key === 'privacy' ? 'Privacy First' : 'Beautiful Design'}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by thousands worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from real people on their wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 wellness-gradient rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start your wellness journey?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands who are transforming their mental health with AI-powered coaching
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                View Plans
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}