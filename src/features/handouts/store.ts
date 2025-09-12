import { Handout } from './types';
import { supabase } from '@/integrations/supabase/client';

const HANDOUTS_KEY = 'aura.handouts';

function generateShareToken(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function listHandouts(): Handout[] {
  try {
    const stored = localStorage.getItem(HANDOUTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getHandout(slug: string): Handout | null {
  const handouts = listHandouts();
  return handouts.find(h => h.slug === slug) || null;
}

export function saveHandout(handout: Partial<Handout>): Handout {
  const handouts = listHandouts();
  const now = new Date().toISOString();
  
  let saved: Handout;
  
  if (handout.id) {
    const index = handouts.findIndex(h => h.id === handout.id);
    if (index !== -1) {
      saved = { ...handouts[index], ...handout, updatedAt: now } as Handout;
      handouts[index] = saved;
    } else {
      saved = {
        id: handout.id,
        slug: handout.slug || '',
        title: handout.title || '',
        sections: handout.sections || [],
        createdAt: now,
        updatedAt: now,
        lang: 'sv',
        shareToken: generateShareToken(),
        ...handout
      } as Handout;
      handouts.push(saved);
    }
  } else {
    saved = {
      id: crypto.randomUUID(),
      slug: handout.slug || '',
      title: handout.title || '',
      sections: handout.sections || [],
      createdAt: now,
      updatedAt: now,
      lang: 'sv',
      shareToken: generateShareToken(),
      ...handout
    } as Handout;
    handouts.push(saved);
  }
  
  localStorage.setItem(HANDOUTS_KEY, JSON.stringify(handouts));
  
  // Soft mirror to Supabase
  mirrorToSupabase(saved);
  
  return saved;
}

export function ensureDefaults(): void {
  const existing = listHandouts();
  const defaults = [
    {
      slug: 'sleep',
      title: 'Sömnhygien',
      sections: [
        {
          title: 'Kvällsrutin',
          bullets: ['Skärmfritt 30 min', 'Dämpa ljus', 'Skriv ner oroslista']
        },
        {
          title: 'Miljö',
          bullets: ['Mörkt & svalt', 'Tyst eller vitt brus', 'Endast sängen för sömn']
        }
      ]
    },
    {
      slug: 'anxiety',
      title: 'Ångestverktyg',
      sections: [
        {
          title: 'Akuta verktyg',
          bullets: ['Box-andning 4-4-4-4', '5-4-3-2-1 grounding', 'Is-skölj/ansikte']
        },
        {
          title: 'Vardag',
          bullets: ['Planera oro-fönster', 'Koffein lagom', 'Rörelse 10 min']
        }
      ]
    },
    {
      slug: 'activation',
      title: 'Aktivering (vid nedstämdhet)',
      sections: [
        {
          title: 'Små steg dagligen',
          bullets: ['2-min start', 'Promenad 10 min', 'Kontakta en vän']
        },
        {
          title: 'Belöning',
          bullets: ['Mini-belöning efter aktivitet', 'Fira mikrosegrar']
        }
      ]
    },
    {
      slug: 'custom',
      title: 'Egen handout',
      sections: []
    }
  ];
  
  defaults.forEach(def => {
    if (!existing.find(h => h.slug === def.slug)) {
      saveHandout(def);
    }
  });
}

async function mirrorToSupabase(handout: Handout): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Try to mirror to exercises table or similar
    await supabase.from('exercises').upsert({
      id: handout.id,
      title: { en: handout.title, sv: handout.title },
      description: { en: JSON.stringify(handout.sections), sv: JSON.stringify(handout.sections) },
      slug: handout.slug,
      duration_seconds: 300,
      tags: ['handout']
    });
  } catch {
    // Silent fail
  }
}