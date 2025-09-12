import { CrisisResource } from './types';

export function getResources(country: 'SE' | 'OTHER' = 'SE'): CrisisResource[] {
  if (country === 'SE') {
    return [
      {
        id: 'se-112',
        label: '112 – Akut nödläge',
        kind: 'emergency',
        href: 'tel:112',
        note: 'Ring omedelbart vid fara'
      },
      {
        id: 'se-1177',
        label: '1177 – Sjukvårdsrådgivning',
        kind: 'advice',
        href: 'tel:1177',
        hours: 'Dygnet runt'
      },
      {
        id: 'se-mind-call',
        label: 'Mind Självmordslinjen (samtal)',
        kind: 'phone',
        href: 'tel:90101',
        hours: 'Vardagar 19-06, helger dygnet runt'
      },
      {
        id: 'se-mind-chat',
        label: 'Mind Självmordslinjen (chatt)',
        kind: 'chat',
        href: 'https://mind.se/hitta-hjalp/sjalvmordslinjen/',
        hours: 'Se webbsida för tider'
      },
      {
        id: 'se-jourhavande-prest',
        label: 'Jourhavande präst',
        kind: 'phone',
        href: 'tel:020-22 22 00',
        hours: 'Dygnet runt'
      },
      {
        id: 'se-bris-vuxen',
        label: 'BRIS Vuxentelefon',
        kind: 'phone',
        href: 'tel:077-150 50 50',
        hours: 'Vardagar 9-21, helger 15-21'
      }
    ];
  }
  
  // Safe generic fallbacks for other countries
  return [
    {
      id: 'intl-emergency',
      label: 'Local Emergency',
      kind: 'emergency',
      href: 'tel:112',
      note: 'Dial your country emergency number'
    },
    {
      id: 'intl-crisis',
      label: 'International Crisis Line',
      kind: 'phone',
      href: 'https://findahelpline.com',
      note: 'Find local crisis support'
    }
  ];
}

export function detectCountry(): 'SE' | 'OTHER' {
  const language = navigator.language || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  
  if (language.includes('sv') || timezone.includes('Stockholm') || timezone.includes('Europe/Stockholm')) {
    return 'SE';
  }
  
  return 'OTHER';
}