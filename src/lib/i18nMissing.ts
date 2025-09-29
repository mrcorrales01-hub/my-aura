export function setupI18nMissing(i18n: any) {
  if (!i18n) return;
  
  const missing = new Set<string>();
  
  i18n.on('missingKey', (_lngs: any, ns: string, key: string) => {
    if (import.meta.env.DEV) {
      const fullKey = `${ns}:${key}`;
      if (!missing.has(fullKey)) {
        missing.add(fullKey);
        // eslint-disable-next-line no-console
        console.warn(`🌍 [i18n] Missing key: ${fullKey}`);
      }
    }
  });

  // Add a global method to get missing keys for debugging
  if (import.meta.env.DEV) {
    // @ts-ignore
    window.getMissingI18nKeys = () => Array.from(missing);
  }
}