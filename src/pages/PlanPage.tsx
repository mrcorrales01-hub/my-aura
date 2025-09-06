import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, Calendar } from 'lucide-react';

const PlanPage = () => {
  const { t } = useTranslation(['plan', 'common']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Min Plan</h1>
        <p className="text-muted-foreground">Sätt mål och följ din utveckling</p>
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold">Planering kommer snart</h2>
            <p className="text-muted-foreground">
              Skapa personliga mål, följ dina framsteg och håll dig motiverad med vår smarta planerings- och uppföljningsfunktion.
            </p>
            <div className="flex gap-2 justify-center">
              <Button disabled>
                <Plus className="w-4 h-4 mr-2" />
                Skapa mål
              </Button>
              <Button variant="outline" disabled>
                <Calendar className="w-4 h-4 mr-2" />
                Schemalägg
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanPage;