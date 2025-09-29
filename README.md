# My Aura

**AI-driven mental health and wellness platform with multilingual support**

My Aura är en modern mental hälsoplattform byggd med React, TypeScript och Supabase. Appen erbjuder AI-driven coaching, självskattningar, krisstöd och personliga välmåendeplaner på 6 språk.

## ✨ Funktioner

- 🤖 **Auri AI Coach** - 24/7 AI-support för mental hälsa
- 📊 **Självskattningar** - PHQ-9 och GAD-7 med PDF-export
- 🎭 **Rollspel** - Träna sociala situationer med AI
- 🚨 **Krisstöd** - Omedelbar hjälp och säkerhetsplaner
- 🌍 **6 språk** - Svenska, engelska, spanska, norska, danska, finska
- 💳 **Stripe-integration** - Flexibla prenumerationsplaner
- 📱 **PWA** - Fungerar som native app

## 🚀 Utveckling

### Snabbstart

```bash
# 1. Installera paket
npm install

# 2. Kör lokalt
npm run dev

# 3. Öppna i webbläsare
# http://localhost:5173
```

### Miljövariabler (.env)

Kopiera `.env.example` till `.env` och fyll i dina värden:

```bash
# Supabase (krävs)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (för betalningar)
STRIPE_PUBLIC_KEY=pk_test_XXXX
STRIPE_SECRET_KEY=sk_test_XXXX
STRIPE_PRICE_BASIC=price_XXXX
STRIPE_PRICE_PREMIUM=price_YYYY

# Observability (valfritt)
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

## 📚 Dokumentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Komplett roadmap och utvecklingsplan
- **[Lovable Project](https://lovable.dev/projects/ad75c518-0b07-43a9-ab8c-a632301b859c)** - Live-redigering och deployment

## 🏗️ Teknisk Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth med Google OAuth
- **Betalningar**: Stripe Checkout + Portal
- **i18n**: react-i18next med 6 språkstöd
- **PWA**: Service Worker + Manifest

## 🔧 Kommandon

```bash
# Utveckling
npm run dev              # Starta dev-server
npm run build            # Bygg för produktion
npm run preview          # Förhandsgranska build

# Kvalitet
npm run lint             # ESLint kontroll
npm run type-check       # TypeScript validering

# Tester
npm run test             # Kör enhets-tester
npm run test:e2e         # Kör e2e-tester (Playwright)

# Supabase
npx supabase start       # Starta lokal Supabase
npx supabase db reset    # Återställ databas
npx supabase gen types   # Generera TypeScript-typer
```

## 📁 Projektstruktur

```
src/
├── app/                 # App-konfiguration och routing
├── components/          # Återanvändbara UI-komponenter
├── features/           # Funktions-specifika moduler
│   ├── assess/         # Självskattningar (PHQ-9, GAD-7)
│   ├── subscription/   # Prenumerationslogik
│   └── auth/           # Autentisering
├── hooks/              # Custom React hooks
├── lib/                # Verktyg och konfiguration
├── pages/              # Sidor och routes
└── integrations/       # Externa API:er (Supabase)

public/
└── locales/            # i18n översättningar
    ├── sv/             # Svenska
    ├── en/             # Engelska
    └── ...             # 4 andra språk
```

## 🌍 Internationalisering

Appen stöder 6 språk med automatisk språkdetektering:

- 🇸🇪 **Svenska** (standard)
- 🇺🇸 **English**
- 🇪🇸 **Español**
- 🇳🇴 **Norsk**
- 🇩🇰 **Dansk**
- 🇫🇮 **Suomi**

Översättningar finns i `public/locales/[lang]/` och hanteras av react-i18next.

## 🚀 Deployment

**Via Lovable (rekommenderat):**
1. Öppna [Lovable Project](https://lovable.dev/projects/ad75c518-0b07-43a9-ab8c-a632301b859c)
2. Klicka Share → Publish

**Manuellt:**
```bash
npm run build
# Ladda upp dist/ till din hosting-provider
```

## 🤝 Bidrag

1. Forka repot
2. Skapa en feature-branch: `git checkout -b feature/amazing-feature`
3. Committa dina ändringar: `git commit -m 'Add amazing feature'`
4. Pusha till branchen: `git push origin feature/amazing-feature`
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT License - se [LICENSE](LICENSE) för detaljer.

---

**Utvecklat med ❤️ för mental hälsa och välmående**