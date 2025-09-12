export type TriageResult = {
  ts: string;
  answers: {
    dangerNow: boolean;
    havePlan: boolean;
    accessMeans: boolean;
    underInfluence: boolean;
    alone: boolean;
  };
  level: 'green' | 'amber' | 'red';
};

export type SafetyContact = {
  name: string;
  phone?: string;
  sms?: string;
  email?: string;
};

export type SafetyPlan = {
  id: string;
  createdAt: string;
  updatedAt: string;
  lang: 'sv' | 'en';
  name?: string;
  signals: string[];
  coping: string[];
  people: SafetyContact[];
  places: string[];
  reasons: string[];
  removeMeans: string[];
  professionals: SafetyContact[];
  checkinEveryMin: number;
  remindersOn: boolean;
  shareToken?: string;
};

export type CrisisResource = {
  id: string;
  label: string;
  kind: 'emergency' | 'advice' | 'chat' | 'phone' | 'sms';
  href: string;
  hours?: string;
  note?: string;
};