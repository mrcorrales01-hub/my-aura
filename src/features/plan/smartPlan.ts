import { getLatestResult } from '../screeners/store';

export type SmartGoal = {
  id: string;
  title: string;
  done: boolean;
};

export type SmartPlan = {
  goals: SmartGoal[];
  week: string;
};

function getISOWeek(date: Date): string {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

const goalPools = {
  depression: [
    'Morgonljus 10 min',
    'Kontakt med vän 1 gång', 
    'Dagbok 1 rad',
    'Gå ut 15 min',
    'Laga en måltid'
  ],
  anxiety: [
    'Andning 2×2 min/dag',
    'Planera 1 trygg paus',
    'Rör dig 10 min',
    'Begränsa nyheter 1 dag',
    'Organisera 1 liten sak'
  ],
  neutral: [
    'Drick 6 glas vatten',
    'Läs 10 sidor',
    'Ring någon du bryr dig om',
    'Städa ett rum',
    'Prova något nytt'
  ]
};

function selectGoals(): SmartGoal[] {
  const phq9 = getLatestResult('phq9');
  const gad7 = getLatestResult('gad7');
  
  let pool = goalPools.neutral;
  
  if (phq9?.score && phq9.score >= 15) {
    pool = goalPools.depression;
  } else if (gad7?.score && gad7.score >= 10) {
    pool = goalPools.anxiety;
  }
  
  // Select 3 random goals
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((title, i) => ({
    id: `goal-${i}`,
    title,
    done: false
  }));
}

export function getSmartPlan(): SmartPlan {
  const currentWeek = getISOWeek(new Date());
  const storageKey = `aura.smartPlan.${currentWeek}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  
  // Generate new plan
  const plan: SmartPlan = {
    goals: selectGoals(),
    week: currentWeek
  };
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
  } catch {}
  
  return plan;
}

export function updateGoal(goalId: string, done: boolean) {
  const plan = getSmartPlan();
  const goal = plan.goals.find(g => g.id === goalId);
  if (goal) {
    goal.done = done;
    const storageKey = `aura.smartPlan.${plan.week}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(plan));
    } catch {}
  }
}