import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'

const LANG_KEY = 'aura.lang'

export default function AuthLanguageSync() {
  const { i18n } = useTranslation()

  // Apply lang to <html>
  const setHtmlLang = (lng: string) => {
    document.documentElement.lang = lng || 'en'
  }

  // On mount: load from localStorage first
  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored)
      setHtmlLang(stored)
    } else {
      setHtmlLang(i18n.language)
    }
    // listen to changes and persist
    const onChanged = (lng: string) => {
      localStorage.setItem(LANG_KEY, lng)
      setHtmlLang(lng)
    }
    i18n.on('languageChanged', onChanged)
    return () => { i18n.off('languageChanged', onChanged) }
  }, [i18n])

  // After auth events: read/write profile.language
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const user = session.user
      // read profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('language_preference')
        .eq('id', user.id)
        .maybeSingle()

      const current = localStorage.getItem(LANG_KEY) || i18n.language || 'sv'
      const profileLang = prof?.language_preference

      // If profile missing → upsert with current
      if (!profileLang) {
        await supabase.from('profiles').update({ language_preference: current }).eq('id', user.id)
      } else if (profileLang !== current) {
        // prefer profile (server truth)
        i18n.changeLanguage(profileLang)
        localStorage.setItem(LANG_KEY, profileLang)
        document.documentElement.lang = profileLang
      }
    })
    return () => sub.data.subscription.unsubscribe()
  }, [i18n])

  return null
}