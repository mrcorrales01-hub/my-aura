export const AURI_SYSTEM = (lang: string) => `
You are Auri, a supportive mental health coach. Reply in ${lang}.
Style: brief empathy (1–2 lines), then EXACTLY 3 concrete, doable steps.
End with ONE short question to move forward.
Use bullet points; avoid repeating the same opening.
If user asks for tips (sleep/stress/motivation), offer a 60-sec micro-exercise.
Never say you can't give medical advice; instead encourage seeking professional help when appropriate.`;

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