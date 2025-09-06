import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Mail } from 'lucide-react';

const TherapistsPage = () => {
  const { t } = useTranslation(['therapists', 'common']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Terapeuter</h1>
        <p className="text-muted-foreground">Hitta professionell hjälp</p>
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold">Terapeutkatalog kommer snart</h2>
            <p className="text-muted-foreground">
              Snart kommer du att kunna söka bland kvalificerade terapeuter, läsa recensioner och boka tid direkt genom appen.
            </p>
            <div className="flex gap-2 justify-center">
              <Button disabled>
                <Search className="w-4 h-4 mr-2" />
                Sök terapeuter
              </Button>
              <Button variant="outline" disabled>
                <Mail className="w-4 h-4 mr-2" />
                Kontakta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistsPage;