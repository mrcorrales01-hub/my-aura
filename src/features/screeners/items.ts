export type ScreenerId = 'phq9'|'gad7';
export type ScreenerItem = { id:string; sv:string; en:string; choices:number[] };

export const PHQ9: ScreenerItem[] = [
 {id:'p1', sv:'Lite intresse eller glädje i att göra saker', en:'Little interest or pleasure in doing things', choices:[0,1,2,3]},
 {id:'p2', sv:'Nedstämd, deppig eller hopplös', en:'Feeling down, depressed, or hopeless', choices:[0,1,2,3]},
 {id:'p3', sv:'Svårt att somna, sova eller sova för mycket', en:'Trouble falling or staying asleep, or sleeping too much', choices:[0,1,2,3]},
 {id:'p4', sv:'Trötthet eller brist på energi', en:'Feeling tired or having little energy', choices:[0,1,2,3]},
 {id:'p5', sv:'Dålig aptit eller överätande', en:'Poor appetite or overeating', choices:[0,1,2,3]},
 {id:'p6', sv:'Dålig självkänsla eller att du misslyckats', en:'Feeling bad about yourself — or that you are a failure', choices:[0,1,2,3]},
 {id:'p7', sv:'Svårt att koncentrera sig', en:'Trouble concentrating', choices:[0,1,2,3]},
 {id:'p8', sv:'Rör dig eller talar så långsamt (eller rastlös)', en:'Moving or speaking slowly (or restlessness)', choices:[0,1,2,3]},
 {id:'p9', sv:'Tankar om att du vore bättre död eller skada dig', en:'Thoughts that you would be better off dead or hurting yourself', choices:[0,1,2,3]}
];

export const GAD7: ScreenerItem[] = [
 {id:'g1', sv:'Känsla av nervositet, oro eller spändhet', en:'Feeling nervous, anxious, or on edge', choices:[0,1,2,3]},
 {id:'g2', sv:'Svårighet att stoppa oro', en:'Not being able to stop or control worrying', choices:[0,1,2,3]},
 {id:'g3', sv:'Oro för många olika saker', en:'Worrying too much about different things', choices:[0,1,2,3]},
 {id:'g4', sv:'Svårt att slappna av', en:'Trouble relaxing', choices:[0,1,2,3]},
 {id:'g5', sv:'Rastlöshet', en:'Being so restless that it is hard to sit still', choices:[0,1,2,3]},
 {id:'g6', sv:'Lättretlig', en:'Becoming easily annoyed or irritable', choices:[0,1,2,3]},
 {id:'g7', sv:'Rädsla som om något hemskt ska hända', en:'Feeling afraid as if something awful might happen', choices:[0,1,2,3]}
];

export function scorePHQ9(vals:number[]){ 
  const s=vals.reduce((a,b)=>a+b,0);
  const sev = s<=4?'Minimal': s<=9?'Mild': s<=14?'Måttlig': s<=19?'Ganska svår':'Svår';
  return {score:s, severity:sev};
}

export function scoreGAD7(vals:number[]){ 
  const s=vals.reduce((a,b)=>a+b,0);
  const sev = s<=4?'Minimal': s<=9?'Mild': s<=14?'Måttlig':'Svår';
  return {score:s, severity:sev};
}