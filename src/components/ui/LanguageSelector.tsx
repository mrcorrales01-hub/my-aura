import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LANGUAGES = [
  { code: 'sv', name: 'Svenska' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' }
]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
    localStorage.setItem('aura.lang', value)
  }
  
  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(({ code, name }) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}