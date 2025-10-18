import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/welcome" className="text-lg font-semibold">My Aura</Link>
      </header>
      
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Kontakt</h1>
        
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Har du frågor?</h2>
          <p className="text-sm opacity-80">
            Vi finns här för att hjälpa dig. Kontakta oss via:
          </p>
        </section>
        
        <section className="space-y-2">
          <h3 className="font-medium">E-post</h3>
          <p className="text-sm opacity-80">
            <a href="mailto:support@my-aura.app" className="underline hover:no-underline">
              support@my-aura.app
            </a>
          </p>
        </section>
        
        <section className="space-y-2">
          <h3 className="font-medium">För vårdcentraler och företag</h3>
          <p className="text-sm opacity-80">
            Är du intresserad av My Aura för din vårdcentral eller organisation? 
            Besök vår <Link to="/clinic" className="underline hover:no-underline">sida för kliniker</Link>.
          </p>
        </section>
        
        <section className="space-y-2">
          <h3 className="font-medium">Press och media</h3>
          <p className="text-sm opacity-80">
            För pressförfrågningar, besök vår <Link to="/press" className="underline hover:no-underline">pressida</Link>.
          </p>
        </section>
        
        <section className="space-y-2 border-t border-border pt-4 mt-6">
          <h3 className="font-medium">Akut hjälp</h3>
          <p className="text-sm opacity-80 text-red-600 dark:text-red-400">
            <strong>Vid akut fara eller självmordstankar:</strong><br />
            Ring 112 (akut) eller 1177 (sjukvårdsrådgivning) omedelbart.<br />
            My Aura är inte en akut tjänst.
          </p>
        </section>
        
        <Link to="/welcome" className="text-sm underline inline-block mt-6">
          ← Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
