import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const SUPPORTED = ['sv','en','es','no','da','fi'] as const
type Lng = typeof SUPPORTED[number]
const KEY = 'aura.lang'

function detectInitial(): Lng {
  const saved = (localStorage.getItem(KEY)||'').toLowerCase()
  if (SUPPORTED.includes(saved as Lng)) return saved as Lng
  const langs = (navigator.languages || [navigator.language]).map(x=>x?.toLowerCase?.()||'')
  if (langs.some(l=>l.startsWith('sv'))) return 'sv'
  // Heuristic: timezone Sweden
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz.includes('Stockholm')) return 'sv'
  } catch {}
  return 'sv' // default to Swedish
}

function setHtmlLang(lng:Lng){
  const el = document.documentElement
  if (el) el.setAttribute('lang', lng)
}

export const SUPPORTED_LANGUAGES = SUPPORTED.map(code => ({ code, name: code.toUpperCase() }))

export const safeT = (t: any) => (key: string, def: string) => t(key, { defaultValue: def })

export async function setupI18n(){
  const initial = detectInitial()
  // Preload JSON resources via Vite dynamic import
  const loadNs = async (lng:Lng, ns:string) => (await import(/* @vite-ignore */`/public/locales/${lng}/${ns}.json`).catch(()=>({default:{}}))).default

  const resources:any = {}
  for (const lng of SUPPORTED){
    resources[lng] = {
      common: await loadNs(lng,'common').catch(()=>({})),
      nav: await loadNs(lng,'nav').catch(()=>({})),
      auth: await loadNs(lng,'auth').catch(()=>({})),
      home: await loadNs(lng,'home').catch(()=>({})),
      auri: await loadNs(lng,'auri').catch(()=>({})),
      roleplay: await loadNs(lng,'roleplay').catch(()=>({})),
      visit: await loadNs(lng,'visit').catch(()=>({})),
      coach: await loadNs(lng,'coach').catch(()=>({})),
      screeners: await loadNs(lng,'screeners').catch(()=>({})),
      timeline: await loadNs(lng,'timeline').catch(()=>({})),
      crisis: await loadNs(lng,'crisis').catch(()=>({})),
      profile: await loadNs(lng,'profile').catch(()=>({}))
    }
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initial,
      supportedLngs: SUPPORTED as unknown as string[],
      fallbackLng: ['sv','en'],
      ns: ['common','nav','auth','home','auri','roleplay','visit','coach','screeners','timeline','crisis','profile'],
      defaultNS: 'common',
      interpolation: { escapeValue:false },
      returnNull: false,
      returnEmptyString: true,
      cleanCode: true
    })

  // Persist + update <html lang>
  setHtmlLang(i18n.language as Lng)
  localStorage.setItem(KEY, i18n.language)
  i18n.on('languageChanged', (lng:string)=>{
    const L = (SUPPORTED.includes(lng as Lng) ? lng : 'sv') as Lng
    localStorage.setItem(KEY, L)
    setHtmlLang(L)
  })

  // Safe translator (never shows raw keys)
  // Usage: const st = safeT(t); st('profile:name','Namn')
  // @ts-ignore
  i18n.safeT = (t:any)=> (key:string, def:string)=> t(key, { defaultValue: def })

  // Dev-only missing key detection with CI-style logging
  if (import.meta.env.DEV) {
    const missing: string[] = []
    const exists = (k: string) => i18n.exists(k) || i18n.exists(`sv:${k}`) || i18n.exists(`en:${k}`)
    const scan = (keys: string[]) => keys.forEach(k => { if (!exists(k)) missing.push(k) })
    
    // Core keys to check
    const coreKeys = [
      'nav:home', 'nav:chat', 'nav:auri', 'nav:roleplay', 'nav:crisis',
      'home:greetingMorning', 'home:greetingAfternoon', 'home:greetingEvening',
      'home:today', 'home:tryNow', 'home:checkin', 'home:recommended',
      'auri:suggestions.mood', 'auri:suggestions.stress', 'auri:suggestions.anxiety',
      'auth:signin', 'auth:signup', 'auth:email', 'auth:password'
    ]
    scan(coreKeys)
    
    if (missing.length) {
      console.warn('🌍 [i18n] Missing translations:', missing)
      console.warn('🌍 [i18n] Current language:', i18n.language)
    } else {
      console.log('✅ [i18n] All core keys found for language:', i18n.language)
    }
    
    // Global missing key handler
    // @ts-ignore
    i18n.checkMissing = (key: string) => {
      if (!exists(key)) {
        console.warn(`🌍 [i18n] Runtime missing key: ${key}`)
      }
    }
  }

  return i18n
}

export default i18n