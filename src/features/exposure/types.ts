export type ExposureStep = { 
  id: string; 
  label: string; 
  difficulty: number; // 0-10
}

export type ExposurePlan = {
  id: string; 
  name: string; 
  situation: string;
  steps: ExposureStep[]; // ideally 5
  createdAt: string; 
  updatedAt: string; 
  lang: 'sv' | 'en';
  shareToken?: string;
}

export type ExposureSession = {
  id: string; 
  planId: string; 
  stepId: string;
  before: number; 
  after?: number; 
  minutes?: number; 
  notes?: string;
  startedAt: string; 
  endedAt?: string;
}