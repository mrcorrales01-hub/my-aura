export default function ResetPage() {
  async function nuke() {
    try {
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      
      // Clear caches
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const k of keys) await caches.delete(k);
      }
      
      // Clear localStorage keys we commonly set
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (
          k.startsWith('i18next') || 
          k.startsWith('aura.') || 
          k === 'lng' || 
          k.includes('reminder')
        ) {
          localStorage.removeItem(k);
        }
      }
      
      // Clear session storage
      sessionStorage.clear();
      
      alert('Cache, SW och lokala inställningar rensade. Appen laddas om.');
      location.href = '/?v=' + Date.now();
    } catch (e: any) {
      alert('Reset fel: ' + e?.message);
    }
  }
  
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Återställ app (nuke cache)</h1>
      <p className="text-sm opacity-70">
        Rensar Service Worker, cache och lokala inställningar (språk m.m.).
      </p>
      <button 
        onClick={nuke} 
        className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors"
      >
        Rensa & ladda om
      </button>
      <div className="text-xs opacity-60 mt-2">
        Om du kör i iOS PWA: öppna i Safari-flik och kör här, sen öppna PWA igen.
      </div>
    </div>
  );
}
