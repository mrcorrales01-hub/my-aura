import { Severity, SleepAnswers, GAD7, PHQ9 } from './types';

export function scoreGAD7(answers: GAD7): { score: number; severity: Severity } {
  const score = answers.reduce((sum, val) => sum + val, 0);
  
  let severity: Severity;
  if (score <= 4) severity = 'green';
  else if (score <= 9) severity = 'amber';
  else severity = 'red';
  
  return { score, severity };
}

export function scorePHQ9(answers: PHQ9): { score: number; severity: Severity } {
  const score = answers.reduce((sum, val) => sum + val, 0);
  
  let severity: Severity;
  if (score <= 4) severity = 'green';
  else if (score <= 14) severity = 'amber';
  else severity = 'red';
  
  return { score, severity };
}

export function scoreSleep(answers: SleepAnswers): { score: number; severity: Severity } {
  let score = answers.troubleFalling + answers.awakenings;
  
  // Sleep latency buckets
  if (answers.sleepLatencyMin < 20) score += 0;
  else if (answers.sleepLatencyMin <= 39) score += 1;
  else if (answers.sleepLatencyMin <= 59) score += 2;
  else score += 3;
  
  // Sleep hours penalty
  if (answers.sleepHours < 6) score += 2;
  else if (answers.sleepHours <= 7) score += 1;
  else if (answers.sleepHours <= 9) score += 0;
  else score += 1;
  
  // Additional factors
  if (answers.caffeineAfter15) score += 1;
  if (answers.snoringOrApnea) score += 2;
  
  let severity: Severity;
  if (score <= 3) severity = 'green';
  else if (score <= 6) severity = 'amber';
  else severity = 'red';
  
  return { score, severity };
}

export function getOverallFlag(scores: {
  sleep?: { severity: Severity };
  gad7?: { severity: Severity };
  phq9?: { severity: Severity };
}): Severity {
  const severities = [
    scores.sleep?.severity,
    scores.gad7?.severity,
    scores.phq9?.severity
  ].filter(Boolean);
  
  if (severities.includes('red')) return 'red';
  if (severities.includes('amber')) return 'amber';
  return 'green';
}