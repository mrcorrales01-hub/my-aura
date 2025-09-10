export type Scenario = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  steps: {
    goal: Record<string, string>;
    hints?: Record<string, string>;
  }[];
  rubric?: Record<string, number>;
};

const modules = import.meta.glob('./scenarios/*.json', { eager: true });

export const scenarios: Scenario[] = Object.values(modules).map((m: any) => m.default);

export const getScenarioList = (lng: string) =>
  scenarios.map(s => ({ 
    id: s.id, 
    title: s.title?.[lng] || s.title?.en || s.id,
    description: s.description?.[lng] || s.description?.en || ''
  }));

export const listFor = (lng: string) => getScenarioList(lng);