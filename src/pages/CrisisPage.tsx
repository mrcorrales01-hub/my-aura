import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MessageSquare, Heart, ExternalLink } from 'lucide-react';

const CrisisPage = () => {
  const { t } = useTranslation(['crisis', 'common']);

  const crisisHotlines = [
    {
      name: 'Självmordslinjen',
      number: '90101',
      description: 'För personer i självmordskris',
      hours: '24/7',
      type: 'crisis'
    },
    {
      name: 'BRIS Vuxentelefon',
      number: '077-150 50 50', 
      description: 'För vuxna som oroar sig för barn',
      hours: 'Vardagar 9-21',
      type: 'support'
    },
    {
      name: 'Jourhavande medmänniska',
      number: '08-702 16 80',
      description: 'Krishjälp och stödsamtal',
      hours: '21-06',
      type: 'crisis'
    },
    {
      name: '1177 Vårdguiden',
      number: '1177',
      description: 'Sjukvårdsrådgivning',
      hours: '24/7',
      type: 'medical'
    }
  ];

  const emergencyNumber = '112';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Krishjälp</h1>
        <p className="text-muted-foreground">Omedelbar hjälp finns alltid tillgänglig</p>
      </div>

      {/* Emergency Alert */}
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <AlertDescription className="text-red-700 dark:text-red-300">
          <strong>Akut fara:</strong> Ring 112 omedelbart om du eller någon annan är i omedelbar fara.
        </AlertDescription>
      </Alert>

      {/* Emergency Button */}
      <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6 text-center">
          <Button 
            size="lg" 
            className="bg-red-500 hover:bg-red-600 text-white text-xl px-8 py-4 h-auto"
            onClick={() => window.location.href = `tel:${emergencyNumber}`}
          >
            <Phone className="w-6 h-6 mr-3" />
            Ring {emergencyNumber} - Akut
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            För livshotande situationer
          </p>
        </CardContent>
      </Card>

      {/* Crisis Hotlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crisisHotlines.map((hotline, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{hotline.name}</CardTitle>
                <Badge 
                  variant={hotline.type === 'crisis' ? 'destructive' : 
                           hotline.type === 'medical' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {hotline.hours}
                </Badge>
              </div>
              <CardDescription>{hotline.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => window.location.href = `tel:${hotline.number}`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {hotline.number}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Ytterligare resurser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <MessageSquare className="w-5 h-5 mr-3 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Chatta med Auri</div>
                <div className="text-sm text-muted-foreground">Din AI-coach finns här</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <ExternalLink className="w-5 h-5 mr-3 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Mind.se</div>
                <div className="text-sm text-muted-foreground">Stöd för mental hälsa</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Viktigt:</strong> My Aura ersätter inte professionell vård. 
            Vid allvarliga problem, kontakta alltid sjukvård eller krishjälp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisPage;