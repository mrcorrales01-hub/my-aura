export type Severity = 'green' | 'amber' | 'red';

export type SleepAnswers = {
  troubleFalling: 0 | 1 | 2 | 3; // 0=aldrig ... 3=nästan varje natt
  awakenings: 0 | 1 | 2 | 3;
  sleepHours: number; // 0–24
  sleepLatencyMin: number; // 0–180
  caffeineAfter15: boolean;
  snoringOrApnea: boolean;
  notes?: string;
};

export type GAD7 = [number, number, number, number, number, number, number]; // 0..3
export type PHQ9 = [number, number, number, number, number, number, number, number, number]; // 0..3

export type VisitBundle = {
  id: string; // uuid
  createdAt: string;
  updatedAt: string;
  lang: 'sv' | 'en';
  name?: string;
  sleep?: SleepAnswers;
  gad7?: GAD7;
  phq9?: PHQ9;
  notes?: string;
  scores?: {
    sleep: { score: number; severity: Severity };
    gad7: { score: number; severity: Severity };
    phq9: { score: number; severity: Severity };
  };
  shareToken?: string; // 24-char
};