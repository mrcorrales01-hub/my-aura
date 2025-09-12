import { getResults } from '../screeners/store';

export type TimelinePoint = { date: string; v: number };

export function buildTimeline(): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  const today = new Date();
  
  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let intensity = 0;
    let count = 0;
    
    // Try to get mood data from localStorage
    try {
      const moodData = JSON.parse(localStorage.getItem('aura.mood_entries') || '[]');
      const dayMood = moodData.find((m: any) => m.date === dateStr);
      if (dayMood && dayMood.mood_rating) {
        // Convert 1-10 mood to 0-10 intensity (inverted: lower mood = higher intensity)
        intensity += (11 - dayMood.mood_rating);
        count++;
      }
    } catch {}
    
    // Add screener data (smear recent results across last 7 days)
    if (i < 7) {
      try {
        const results = getResults();
        const recent = results.filter(r => {
          const resultDate = new Date(r.date);
          const daysDiff = (today.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        
        recent.forEach(result => {
          if (result.id === 'phq9') {
            intensity += (result.score / 27) * 10;
            count++;
          } else if (result.id === 'gad7') {
            intensity += (result.score / 21) * 10;
            count++;
          }
        });
      } catch {}
    }
    
    points.push({
      date: dateStr,
      v: count > 0 ? intensity / count : 0
    });
  }
  
  return points;
}