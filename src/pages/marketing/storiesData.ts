export type Story = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  minutes: number;
  hero?: string;
  excerpt: string;
  body: string;
};

export const STORIES: Story[] = [
  {
    slug: "phq9-vad-betyder-siffrorna",
    title: "PHQ-9: Vad betyder siffrorna egentligen?",
    date: "2025-09-01",
    tags: ["screeners", "phq9", "vardbesok"],
    minutes: 5,
    hero: "/blog/phq9.jpg",
    excerpt: "PHQ-9 är en kort självskattning. Så här tolkar du nivåerna – och hur du kan använda dem inför vårdbesök.",
    body: `### Kort om PHQ-9
Skalan går 0–27. 0–4 = minimal, 5–9 = lindrig, 10–14 = måttlig, 15–19 = ganska svår, 20–27 = svår.

**Tips:** Ta med din trend till vården. I My Aura kan du exportera en PDF från */besok*.`
  },
  {
    slug: "sa-gor-du-en-sakerhetsplan",
    title: "Så gör du en säkerhetsplan (på riktigt användbar)",
    date: "2025-09-03",
    tags: ["sakerhet", "kris", "vard"],
    minutes: 6,
    hero: "/blog/safety.jpg",
    excerpt: "En bra säkerhetsplan är kort, tydlig och nära till hands. Så här fyller du i den i My Aura.",
    body: `### 5 byggstenar
• Varningssignaler • Strategier som hjälper • Anledningar att fortsätta • Tryggare miljö • Kontakter/112/1177

**Prova:** Fyll i */safety* och generera en låsskärms-PDF.`
  },
  {
    slug: "rollspel-ovning-infor-svarta-samtal",
    title: "Rollspel: övning inför svåra samtal",
    date: "2025-09-05",
    tags: ["rollspel", "samtal", "arbete"],
    minutes: 4,
    hero: "/blog/roleplay.jpg",
    excerpt: "Att öva 2–3 minuter kan räcka. Så funkar Auri-rollspel i appen och hur du får mest effekt.",
    body: `### Snabbstart
Välj scenario, kör en runda, reflektera 30 sek. Repetera 3 dagar i rad.

**Mål:** Korta, konkreta formuleringar du vågar använda i verkligheten.`
  }
];
