import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'

const KEY = 'aura.lang'

export default function AuthLanguageSync() {
  const { i18n } = useTranslation()
  
  useEffect(() => {
    // Just sync language to localStorage, no Supabase operations
    const lng = localStorage.getItem(KEY) || i18n.language || 'sv'
    if (lng !== i18n.language) {
      i18n.changeLanguage(lng)
    }
  }, [])
  
  return null
}