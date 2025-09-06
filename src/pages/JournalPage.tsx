import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search } from 'lucide-react';

const JournalPage = () => {
  const { t } = useTranslation(['journal', 'common']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <BookOpen className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Dagbok</h1>
        <p className="text-muted-foreground">Skriv ner dina tankar och känslor</p>
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold">Dagbok kommer snart</h2>
            <p className="text-muted-foreground">
              Snart kommer du att kunna skriva och organisera dina dagboksanteckningar med riktexteditor, taggar och känslospårning.
            </p>
            <div className="flex gap-2 justify-center">
              <Button disabled>
                <Plus className="w-4 h-4 mr-2" />
                Nytt inlägg
              </Button>
              <Button variant="outline" disabled>
                <Search className="w-4 h-4 mr-2" />
                Sök
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalPage;