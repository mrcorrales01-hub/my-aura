import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useRecentJournalEntries } from '../api/homeQueries';

export const RecentJournal = () => {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();
  const { data: entries, isLoading, error, refetch } = useRecentJournalEntries(3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('journal.recent')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{t('error.failed')}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('error.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{t('journal.recent')}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/journal')}
            className="text-xs"
          >
            {t('journal.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!entries || entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            titleKey="journal.noEntries"
            descriptionKey="journal.emptyDescription"
            namespace="home"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/journal')}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                {t('journal.createFirst')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/journal/${entry.id}`)}
              >
                <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.title || t('journal.untitled', { defaultValue: 'Untitled Entry' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};