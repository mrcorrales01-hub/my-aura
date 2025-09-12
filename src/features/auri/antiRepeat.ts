export function needsDiversify(prev: string, next: string): boolean {
  if (!prev || !next) return false;
  
  // Simple similarity check: token overlap
  const normalize = (text: string) => text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  const prevTokens = new Set(normalize(prev));
  const nextTokens = new Set(normalize(next));
  
  if (prevTokens.size === 0 || nextTokens.size === 0) return false;
  
  const intersection = [...prevTokens].filter(token => nextTokens.has(token)).length;
  const union = new Set([...prevTokens, ...nextTokens]).size;
  
  const similarity = intersection / union;
  const tooShort = next.length < 60;
  
  return similarity > 0.4 || tooShort;
}

export function createDiversityPrompt(originalMessage: string, language: string): string {
  return `Please provide a fresh response to "${originalMessage}" in ${language}. 

Requirements:
- Avoid repeating previous wording
- Provide 3 concrete, situation-specific actions  
- End with 1 gentle check-in question
- Keep under 120 words
- Use varied vocabulary and sentence structures`;
}