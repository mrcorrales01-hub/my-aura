export type CoachFlowId = 'sleepTonight'|'panicReset'|'motivationBooster';

export type CoachStep = {
  id: string;
  kind: 'read'|'checklist'|'breath'|'action';
  title: Record<'sv'|'en',string>;
  body?: Record<'sv'|'en',string>;
  items?: Record<'sv'|'en',string[]>;  // for checklist
  breath?: { in: number; hold: number; out: number; cycles: number }; // seconds
  quickReplies?: Record<'sv'|'en',string[]>; // inject to Auri
};

export type CoachFlow = {
  id: CoachFlowId;
  title: Record<'sv'|'en',string>;
  estMinutes: number;
  steps: CoachStep[];
  planSuggestionSv: string;
  planSuggestionEn: string;
};

export const FLOWS: CoachFlow[] = [
  {
    id: 'sleepTonight',
    title: { sv:'Sov gott i kväll', en:'Sleep Tonight' },
    estMinutes: 5,
    planSuggestionSv: 'Kvällsrutin: skärmfri 30 min + andning 2×2 min',
    planSuggestionEn: 'Evening routine: 30 min no-screen + 2×2 min breathing',
    steps: [
      { 
        id:'s1', 
        kind:'read',
        title:{sv:'Nollställ kvällen', en:'Reset your evening'},
        body:{sv:'Minska starkt ljus, lägg bort skärmar, dämpa belysning.',
              en:'Dim the lights, reduce screens and bright exposure.'},
        quickReplies:{ sv:['Tips för att somna snabbare?','Har koffein påverkan nu?'],
                       en:['Tips to fall asleep faster?','Does caffeine still affect me?'] }
      },
      { 
        id:'s2', 
        kind:'breath', 
        title:{sv:'Andning 4-7-8', en:'4-7-8 Breathing'},
        breath:{ in:4, hold:7, out:8, cycles:4 } 
      },
      { 
        id:'s3', 
        kind:'checklist', 
        title:{sv:'Snabb kvällsrutin', en:'Quick evening routine'},
        items:{ sv:['Skriv ner 3 oros-punkter → lägg lappen åt sidan',
                    'Förbered morgondagens första steg',
                    'Mörklägg rummet + sänk temp om möjligt'],
                en:['Brain-dump 3 worries → put paper aside',
                    'Prepare first task for tomorrow',
                    'Darken room + lower temp if possible'] } 
      },
      { 
        id:'s4', 
        kind:'action',
        title:{sv:'Lätt kroppsskanning', en:'Light body scan'},
        body:{sv:'Flytta uppmärksamheten fot→huvud. Känn tyngden i madrassen.',
              en:'Sweep attention foot→head. Notice gravity into mattress.'} 
      }
    ]
  },
  {
    id:'panicReset',
    title:{sv:'Panik-reset', en:'Panic Reset'},
    estMinutes:3,
    planSuggestionSv:'Panik-reset övning 1×/dag',
    planSuggestionEn:'Panic reset drill 1×/day',
    steps:[
      { 
        id:'p1', 
        kind:'breath', 
        title:{sv:'Box-andning 4-4-4-4', en:'Box breathing 4-4-4-4'},
        breath:{ in:4, hold:4, out:4, cycles:6 } 
      },
      { 
        id:'p2', 
        kind:'checklist', 
        title:{sv:'Grounding 5-4-3-2-1', en:'Grounding 5-4-3-2-1'},
        items:{ sv:['5 saker du ser','4 saker du känner','3 saker du hör','2 saker du luktar','1 sak du smakar'],
                en:['5 things you see','4 you feel','3 you hear','2 you smell','1 you taste'] },
        quickReplies:{ sv:['Fler verktyg mot panik?'], en:['More tools for panic?'] } 
      },
      { 
        id:'p3', 
        kind:'read', 
        title:{sv:'Efteråt', en:'Aftercare'},
        body:{sv:'Drick vatten. Notera vad som hjälpte. Var snäll mot dig själv.',
              en:'Drink water. Note what helped. Be kind to yourself.'} 
      }
    ]
  },
  {
    id:'motivationBooster',
    title:{sv:'Motivations-boost', en:'Motivation Booster'},
    estMinutes:4,
    planSuggestionSv:'1 liten uppgift/dag med 2-minutersstart',
    planSuggestionEn:'One tiny task/day with 2-minute start',
    steps:[
      { 
        id:'m1', 
        kind:'checklist', 
        title:{sv:'Välj mini-uppgift', en:'Choose a tiny task'},
        items:{ sv:['Plocka i 2 min','Skicka ett meddelande','Gå 200 meter'],
                en:['Tidy for 2 min','Send one message','Walk 200 meters'] } 
      },
      { 
        id:'m2', 
        kind:'read', 
        title:{sv:'Sänk tröskeln', en:'Lower the bar'},
        body:{sv:'Gör det löjligt litet. Fokusera på start, inte resultat.',
              en:'Make it ridiculously small. Focus on starting, not finishing.'},
        quickReplies:{ sv:['Hur håller jag i det här?'], en:['How do I keep this habit?'] } 
      },
      { 
        id:'m3', 
        kind:'breath', 
        title:{sv:'Kickstart-andning 3×6', en:'Kickstart breathing 3×6'},
        breath:{ in:3, hold:0, out:6, cycles:4 } 
      }
    ]
  }
];