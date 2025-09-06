import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Heart, 
  BookOpen, 
  Target,
  TrendingUp,
  Clock,
  Smile,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMoodData } from '@/features/mood/hooks/useMoodData';
import { useJournalData } from '@/features/journal/hooks/useJournalData';
import { usePlanData } from '@/features/plan/hooks/usePlanData';

const AuraHome = () => {
  const { t } = useTranslation(['common', 'mood', 'journal', 'plan']);
  const { user } = useAuthContext();
  const { todaysMood, weeklyAverage } = useMoodData();
  const { recentEntries } = useJournalData();
  const { activePlans, completedTasksToday } = usePlanData();

  const quickActions = [
    {
      title: t('auri:title'),
      description: t('auri:subtitle'),
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-blue-500',
      badge: 'AI'
    },
    {
      title: t('mood:today'),
      description: t('mood:subtitle'),
      icon: Heart,
      href: '/mood',
      color: 'bg-pink-500',
      badge: todaysMood ? '✓' : '!'
    },
    {
      title: t('journal:title'),
      description: t('journal:subtitle'),
      icon: BookOpen,
      href: '/journal',
      color: 'bg-green-500',
      badge: recentEntries?.length > 0 ? '✓' : ''
    },
    {
      title: t('plan:title'),
      description: t('plan:subtitle'),
      icon: Target,
      href: '/plan',
      color: 'bg-purple-500',
      badge: activePlans?.length > 0 ? activePlans.length.toString() : ''
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('common:time.morning')} {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Hur mår du idag? Din mentala hälsoresan fortsätter här.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} to={action.href}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{action.title}</CardTitle>
                <CardDescription className="text-sm">{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              {t('mood:title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysMood ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{todaysMood.mood_value}/10</div>
                <p className="text-sm text-muted-foreground">Idag</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Smile className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Ingen mätning idag</p>
                <Link to="/mood">
                  <Button size="sm" className="mt-2">Lägg till humör</Button>
                </Link>
              </div>
            )}
            
            {weeklyAverage && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Veckosnitt:</span>
                  <span className="font-medium">{weeklyAverage.toFixed(1)}/10</span>
                </div>
                <Progress value={weeklyAverage * 10} className="mt-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Senaste aktivitet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEntries && recentEntries.length > 0 ? (
              recentEntries.slice(0, 3).map((entry: any) => (
                <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  <BookOpen className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {entry.title || 'Dagboksinlägg'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Ingen aktivitet än</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress & Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Mina mål
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePlans && activePlans.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completedTasksToday || 0}</div>
                  <p className="text-sm text-muted-foreground">Uppgifter klara idag</p>
                </div>
                
                <div className="space-y-2">
                  {activePlans.slice(0, 2).map((plan: any) => (
                    <div key={plan.id} className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium truncate">{plan.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Aktiv</span>
                        <Badge variant="outline" className="text-xs">
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Zap className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Inga aktiva mål</p>
                <Link to="/plan">
                  <Button size="sm" className="mt-2">Skapa mål</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Emergency Support */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Behöver du omedelbar hjälp?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Om du upplever en kris eller behöver prata med någon omedelbart, finns hjälp tillgänglig 24/7.
          </p>
          <div className="flex gap-2">
            <Link to="/crisis">
              <Button variant="destructive" size="sm">
                Krishjälp
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" size="sm">
                Chatta med Auri
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuraHome;