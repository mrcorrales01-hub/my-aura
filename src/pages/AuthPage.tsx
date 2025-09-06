import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const { t } = useTranslation(['common', 'auth']);
  const { user, signIn, signUp, loading } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError(t('common:validation.passwordMatch'));
          return;
        }
        
        if (password.length < 6) {
          setError(t('common:validation.minLength', { count: 6 }));
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName || email.split('@')[0]
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Den här e-postadressen är redan registrerad. Försök logga in istället.');
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Fel e-postadress eller lösenord. Försök igen.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ett oväntat fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Skapa konto' : 'Välkommen tillbaka'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Börja din mentala hälsoresan med My Aura' 
              : 'Logga in på ditt My Aura-konto'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Fullständigt namn</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ditt namn"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth:email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth:password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth:confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isSignUp ? 'Skapar konto...' : 'Loggar in...'}
                </>
              ) : (
                isSignUp ? t('auth:signup') : t('auth:signin')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm"
            >
              {isSignUp 
                ? 'Har du redan ett konto? Logga in' 
                : 'Inget konto? Skapa ett nu'
              }
            </Button>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            <p>
              Genom att skapa ett konto godkänner du våra{' '}
              <a href="#" className="underline hover:text-foreground">användarvillkor</a>
              {' '}och{' '}
              <a href="#" className="underline hover:text-foreground">integritetspolicy</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;