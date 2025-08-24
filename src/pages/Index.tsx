import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { GlobalLanguageSelector } from '@/components/GlobalLanguageSelector';
import { 
  Heart, 
  MessageCircle, 
  Brain, 
  Users, 
  Globe, 
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
  Phone,
  Video,
  Music,
  Award,
  Smartphone,
  CreditCard,
  Zap,
  Target,
  BookOpen,
  Calendar,
  HeadphonesIcon,
  PlayCircle
} from 'lucide-react';

const coreFeatures = [
  {
    icon: MessageCircle,
    title: 'AI Coach "Auri"',
    description: 'Real-time personalized guidance with chat & roleplay scenarios using CBT, DBT, and ACT techniques.',
    link: '/chat'
  },
  {
    icon: Brain,
    title: 'Mood Tracking',
    description: 'Advanced mood visualization with AI insights and patterns to understand your mental health journey.',
    link: '/mood'
  },
  {
    icon: Video,
    title: 'Therapist Marketplace',
    description: 'Connect with licensed therapists worldwide via secure video calls with instant booking.',
    link: '/therapist'
  },
  {
    icon: Phone,
    title: 'Crisis Support',
    description: '24/7 crisis button with instant access to local hotlines and emergency therapist chat.',
    link: '/crisis'
  },
  {
    icon: Music,
    title: 'Therapeutic Music',
    description: 'Curated calming music library with binaural beats and nature sounds. Pay-per-play or Premium.',
    link: '/music'
  },
  {
    icon: PlayCircle,
    title: 'Exercise Videos',
    description: 'Short guided meditation, breathing, and therapy exercises with multilingual voiceovers.',
    link: '/videos'
  },
  {
    icon: Users,
    title: 'Safe Community',
    description: 'Moderated support groups and forums in 22 languages with peer-to-peer connection.',
    link: '/community'
  },
  {
    icon: Award,
    title: 'Gamification',
    description: 'Earn rewards, maintain streaks, unlock badges, and track progress with our wellness game system.',
    link: '/profile'
  },
  {
    icon: Globe,
    title: '22 Languages',
    description: 'Full app support in 22 languages with auto-detection and culturally-sensitive content.',
    link: '/settings'
  }
];

const businessFeatures = [
  {
    icon: CreditCard,
    title: 'Multiple Payment Methods',
    description: 'Stripe, PayPal, Apple Pay, Google Pay, Klarna, Swish - all integrated seamlessly.'
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Responsive web app + native iOS & Android apps with full feature parity.'
  },
  {
    icon: Shield,
    title: 'GDPR + HIPAA Compliant',
    description: 'End-to-end encryption, secure data storage, and full privacy compliance.'
  },
  {
    icon: Zap,
    title: 'AI Personalization',
    description: 'Machine learning recommendations based on mood patterns and user behavior.'
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
  const { t } = useGlobalLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground">My Aura</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <GlobalLanguageSelector />
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/auth?tab=signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            My Aura
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-foreground/80 font-light">
            Complete Mental Health & Wellness Platform
          </p>
          <p className="text-lg md:text-xl mb-12 text-foreground/60 max-w-4xl mx-auto leading-relaxed">
            AI coaching, licensed therapists, mood tracking, crisis support, therapeutic music, 
            video exercises, and safe community - all in 22 languages with GDPR compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-foreground/60 mb-16">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>22 languages supported</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>GDPR & HIPAA compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Mental Health <span className="text-primary">Ecosystem</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Everything you need for mental wellness in one comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 border-0 bg-background/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <Link to={feature.link}>
                      <Button variant="ghost" className="text-primary hover:text-primary/80 p-0">
                        Explore →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for <span className="text-primary">Production</span>
            </h2>
            <p className="text-lg text-foreground/70">
              Enterprise-grade security, compliance, and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {businessFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 border-0 bg-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-foreground/70">
                        {feature.description}
                      </p>
                    </div>
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