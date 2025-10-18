import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/welcome" className="text-lg font-semibold">My Aura</Link>
      </header>
      
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Integritetspolicy</h1>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Dataskydd och GDPR</h2>
          <p className="text-sm opacity-80">
            Vi följer GDPR och samlar in minimal data. All data lagras säkert i Supabase med Row Level Security (RLS). 
            Du har rätt att exportera och radera din data när som helst via appen.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Vilken data samlar vi in?</h2>
          <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
            <li>E-postadress och namn (vid registrering)</li>
            <li>Humördata och journalanteckningar (om du väljer att logga)</li>
            <li>Konversationer med Auri (AI-coach)</li>
            <li>Teknisk data (IP-adress, enhet) för säkerhet</li>
          </ul>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Viktig information</h2>
          <p className="text-sm opacity-80">
            My Aura tillhandahåller <strong>ingen medicinsk rådgivning</strong>. Informationen är endast för utbildningsändamål. 
            Vid akut fara, ring 112 eller 1177 omedelbart.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Kontakta oss</h2>
          <p className="text-sm opacity-80">
            Frågor om integritet? Maila support@my-aura.app
          </p>
        </section>
        
        <Link to="/welcome" className="text-sm underline inline-block mt-6">
          ← Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
