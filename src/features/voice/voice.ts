export function speak(text: string, lang = 'sv') {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang.includes('sv') ? 'sv-SE' : 'en-US'
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    // Silent fail if not supported
  }
}

export function canSTT(): boolean {
  return typeof window !== 'undefined' && !!(window as any).webkitSpeechRecognition
}

export function startSTT(
  lang = 'sv',
  onText: (t: string) => void,
  onEnd?: () => void
): (() => void) {
  try {
    // @ts-ignore
    const R = new webkitSpeechRecognition()
    R.lang = lang.includes('sv') ? 'sv-SE' : 'en-US'
    R.interimResults = true
    R.continuous = false
    
    let final = ''
    R.onresult = (e: any) => {
      for (const res of e.results) {
        if (res.isFinal) {
          final += res[0].transcript + ' '
        }
      }
    }
    
    R.onend = () => {
      if (final) onText(final.trim())
      onEnd?.()
    }
    
    R.start()
    return () => R.abort()
  } catch {
    return () => {}
  }
}