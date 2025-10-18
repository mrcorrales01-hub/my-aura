import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/welcome" className="text-lg font-semibold">My Aura</Link>
      </header>
      
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Användarvillkor</h1>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Acceptans av villkor</h2>
          <p className="text-sm opacity-80">
            Genom att använda My Aura accepterar du dessa villkor. Om du inte accepterar villkoren, 
            får du inte använda tjänsten.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Tjänsten tillhandahålls "i befintligt skick"</h2>
          <p className="text-sm opacity-80">
            My Aura tillhandahålls utan garantier av något slag. Vi ansvarar inte för eventuella skador 
            som uppstår genom användning av tjänsten.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Ingen medicinsk rådgivning</h2>
          <p className="text-sm opacity-80">
            My Aura och Auri (AI-coach) tillhandahåller <strong>ingen medicinsk rådgivning</strong>. 
            Informationen är endast för utbildningsändamål. Vid akut fara, ring 112 eller 1177 omedelbart.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Användaransvar</h2>
          <p className="text-sm opacity-80">
            Du ansvarar för att hålla ditt konto säkert. Dela inte ditt lösenord med andra. 
            Du är ansvarig för all aktivitet som sker under ditt konto.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Ändringar av villkor</h2>
          <p className="text-sm opacity-80">
            Vi förbehåller oss rätten att ändra dessa villkor när som helst. 
            Fortsatt användning efter ändringar innebär acceptans av de nya villkoren.
          </p>
        </section>
        
        <Link to="/welcome" className="text-sm underline inline-block mt-6">
          ← Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
