import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Play, Filter } from 'lucide-react';

const ExercisesPage = () => {
  const { t } = useTranslation(['exercises', 'common']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <Dumbbell className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Övningar</h1>
        <p className="text-muted-foreground">Välbefinnande genom guidning och träning</p>
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-semibold">Övningar kommer snart</h2>
            <p className="text-muted-foreground">
              Upptäck andningsövningar, meditation, mindfulness och andra tekniker för att förbättra ditt mentala välbefinnande.
            </p>
            <div className="flex gap-2 justify-center">
              <Button disabled>
                <Play className="w-4 h-4 mr-2" />
                Starta övning
              </Button>
              <Button variant="outline" disabled>
                <Filter className="w-4 h-4 mr-2" />
                Filtrera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExercisesPage;