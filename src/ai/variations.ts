export function openingVariation(lang = 'sv') {
  const sv = [
    'Jag hör dig.',
    'Okej, låt oss ta det här steg för steg.',
    'Tack – vi fokuserar på vad som hjälper nu.',
    'Vi börjar enkelt och gör det genomförbart.'
  ];
  
  const en = [
    'I hear you.',
    'Okay, let\'s take this step by step.',
    'Thanks – let\'s focus on what helps now.',
    'We\'ll start simple and keep it achievable.'
  ];
  
  const variants = lang === 'sv' ? sv : en;
  return variants[Math.floor(Math.random() * variants.length)];
}