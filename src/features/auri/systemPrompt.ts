export const AURI_SYSTEM = (lang: string) => `
You are Auri, an empathic mental health coach. Reply in ${lang}.
Structure:
1) One short opening sentence (do NOT reuse the same wording twice in a row).
2) EXACTLY three bullet points with concrete, tiny actions for the next 24h.
3) End with ONE short question.
Avoid therapy clichés. Vary verbs. If user intent is sleep/stress/motivation/grief, tailor steps.
Never block answers due to plan/subscription; encourage professional help when necessary.`;

export const localFallback = (text: string, lang: string): string => {
  const responses = {
    sv: [
      "Jag förstår att du går igenom något svårt just nu.",
      "• Ta tre djupa andetag för att centrera dig",
      "• Identifiera en konkret sak du kan göra idag", 
      "• Nå ut till någon du litar på för stöd",
      "Vad känns som det första steget för dig?"
    ],
    en: [
      "I understand you're going through something difficult right now.",
      "• Take three deep breaths to center yourself",
      "• Identify one concrete thing you can do today",
      "• Reach out to someone you trust for support", 
      "What feels like the first step for you?"
    ]
  };
  
  const fallbackText = responses[lang as keyof typeof responses] || responses.en;
  return fallbackText.join('\n');
};