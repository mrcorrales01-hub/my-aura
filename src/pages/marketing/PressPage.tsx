import { Link } from 'react-router-dom';

export default function PressPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/welcome" className="text-lg font-semibold">My Aura</Link>
      </header>
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Presskit</h1>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Om My Aura</h2>
          <p className="text-sm opacity-80">
            My Aura är en svensk välmåendeapp som kombinerar AI-coaching (Auri), säkerhetsplan, 
            rollspel och besöks-PDF för att hjälpa användare mellan vårdbesök.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Kort beskrivning (50 ord)</h2>
          <p className="text-sm opacity-80 bg-muted p-3 rounded">
            My Aura är en AI-driven välmåendeapp på svenska. Med Auri (AI-coach), personlig säkerhetsplan, 
            rollspelsfunktion och automatiska besöks-PDFer stöttar vi användare i vardagen mellan vårdbesök.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Lång beskrivning (150 ord)</h2>
          <p className="text-sm opacity-80 bg-muted p-3 rounded">
            My Aura är utvecklad för svensk vård och bygger på principer från KBT och DBT. 
            Appen hjälper användare att hantera vardagliga utmaningar genom fyra huvudfunktioner:
            <br /><br />
            <strong>Auri (AI-coach):</strong> Empatisk AI som ger konkreta steg på svenska.<br />
            <strong>Säkerhetsplan:</strong> Personlig plan för svåra stunder, exporterbar som låsskärms-PDF.<br />
            <strong>Rollspel:</strong> Öva svåra samtal (vård, jobb, familj) i en trygg miljö.<br />
            <strong>Besöks-PDF:</strong> 14-dagars sammanfattning av humör och aktiviteter för läkare.
            <br /><br />
            My Aura tillhandahåller ingen medicinsk rådgivning och är ett komplement till professionell vård, 
            inte en ersättning.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Pressresurser</h2>
          <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
            <li>Logotyper (svart/vit, färg) - Tillgängliga på förfrågan</li>
            <li>Skärmdumpar (webb + mobil) - Tillgängliga på förfrågan</li>
            <li>Grundarbilder - Tillgängliga på förfrågan</li>
            <li>Presskommuniké - Tillgänglig på förfrågan</li>
          </ul>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Kontakt för press</h2>
          <p className="text-sm opacity-80">
            E-post: <a href="mailto:press@my-aura.app" className="underline hover:no-underline">press@my-aura.app</a>
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Nyckeldata</h2>
          <ul className="text-sm opacity-80 space-y-1">
            <li><strong>Grundat:</strong> 2024</li>
            <li><strong>Bas:</strong> Sverige</li>
            <li><strong>Språk:</strong> Svenska (primär), + 5 språk</li>
            <li><strong>Plattformar:</strong> Webb, iOS, Android (kommande)</li>
          </ul>
        </section>
        
        <Link to="/welcome" className="text-sm underline inline-block mt-6">
          ← Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
