export type SeverityKey = 'none' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

export function phq9Severity(score: number): SeverityKey {
  if (score <= 4) return 'none';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  if (score <= 19) return 'moderately_severe';
  return 'severe';
}

export function gad7Severity(score: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (score <= 4) return 'none';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
}