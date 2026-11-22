/**
 * Fortune Lab browser adapter.
 * Chart calculation: Renhuai123/ziwei-doushu, MIT, commit 39c0abd3b8dac609975dddfadd4d4e1d3a978deb.
 * English archetype labels and reflection prompts are original editorial content.
 * Astrology and numerology here are symbolic entertainment, not validated predictions.
 */
import { generateChart } from './ziwei/algorithm';

export const ENGINE_VERSION = 'ziwei-39c0abd3-fortune-adapter-1.0';
export const ENGINE_SOURCE = 'https://github.com/Renhuai123/ziwei-doushu/tree/39c0abd3b8dac609975dddfadd4d4e1d3a978deb';

export const STAR_PROFILES = {
  '紫微': { key:'ziwei', chinese:'紫微', pinyin:'Zi Wei', english:'Purple Star', archetype:'The Sovereign', traits:['Perspective','Leadership','Purpose'], reflection:'You may enjoy bringing people and possibilities into a clearer picture. Try using your influence to create space for someone else to lead.', practice:'Name the one decision that deserves your best attention this week.' },
  '天机': { key:'tianji', chinese:'天机', pinyin:'Tian Ji', english:'Heavenly Mechanism', archetype:'The Strategist', traits:['Curiosity','Adaptability','Insight'], reflection:'This symbol invites you to explore the connection between a good question and a useful next step. Let planning lead to one small experiment.', practice:'Write down a question, a possible answer, and a simple way to test it.' },
  '太阳': { key:'taiyang', chinese:'太阳', pinyin:'Tai Yang', english:'Sun', archetype:'The Radiant Guide', traits:['Generosity','Visibility','Initiative'], reflection:'The Sun is an invitation to make your contribution visible. Consider where sharing your perspective could help, and where you need time to replenish.', practice:'Share one useful thing you know, then leave a little time for yourself.' },
  '武曲': { key:'wuqu', chinese:'武曲', pinyin:'Wu Qu', english:'Martial Song', archetype:'The Builder', traits:['Focus','Discipline','Resourcefulness'], reflection:'This archetype turns attention toward tangible progress. Choose a useful task with a clear finish line and notice what steady effort makes possible.', practice:'Break one project into three steps and complete the smallest step today.' },
  '天同': { key:'tiantong', chinese:'天同', pinyin:'Tian Tong', english:'Heavenly Harmony', archetype:'The Harmonizer', traits:['Warmth','Ease','Connection'], reflection:'This symbol makes room for warmth and everyday enjoyment. Consider how you can protect a little ease while still naming what matters to you.', practice:'Plan one enjoyable moment and one clear boundary for the week.' },
  '廉贞': { key:'lianzhen', chinese:'廉贞', pinyin:'Lian Zhen', english:'Integrity', archetype:'The Alchemist', traits:['Passion','Discernment','Expression'], reflection:'The Alchemist invites you to give strong feelings a constructive form. A meaningful project can be a place to explore your values without forcing an answer.', practice:'Choose a creative outlet for something you have not yet found words for.' },
  '天府': { key:'tianfu', chinese:'天府', pinyin:'Tian Fu', english:'Heavenly Treasury', archetype:'The Steward', traits:['Stability','Patience','Care'], reflection:'This symbol asks what you want to cultivate and protect. Look at the routines, relationships, and resources that help your days feel supported.', practice:'Improve one small system that makes daily life easier.' },
  '太阴': { key:'taiyin', chinese:'太阴', pinyin:'Tai Yin', english:'Moon', archetype:'The Dreamer', traits:['Reflection','Imagination','Sensitivity'], reflection:'The Moon invites a quieter kind of attention. Give an idea time to take shape and check whether your own needs have a place in the picture.', practice:'Spend five minutes writing before asking anyone else what they think.' },
  '贪狼': { key:'tanlang', chinese:'贪狼', pinyin:'Tan Lang', english:'Seeking Wolf', archetype:'The Explorer', traits:['Curiosity','Creativity','Magnetism'], reflection:'The Explorer makes room for new experiences and connections. Notice which interests leave you feeling engaged and choose one to explore more deeply.', practice:'Try one unfamiliar activity without needing to be good at it.' },
  '巨门': { key:'jumen', chinese:'巨门', pinyin:'Ju Men', english:'Great Gate', archetype:'The Truth-Seeker', traits:['Inquiry','Expression','Depth'], reflection:'This symbol invites careful questions and thoughtful expression. What becomes clearer when you replace an assumption with a direct conversation?', practice:'Ask one open question and listen without preparing your reply.' },
  '天相': { key:'tianxiang', chinese:'天相', pinyin:'Tian Xiang', english:'Heavenly Minister', archetype:'The Diplomat', traits:['Fairness','Cooperation','Taste'], reflection:'The Diplomat invites you to look for a fair arrangement. Consider whether harmony includes your needs as well as the needs of the people around you.', practice:'Describe what a balanced outcome would look like for everyone involved.' },
  '天梁': { key:'tianliang', chinese:'天梁', pinyin:'Tian Liang', english:'Heavenly Beam', archetype:'The Guardian', traits:['Principle','Guidance','Compassion'], reflection:'This archetype centers the support you give and receive. Offering perspective can matter, and so can letting another person find their own way.', practice:'Offer help with a question: What kind of support would be useful?' },
  '七杀': { key:'qisha', chinese:'七杀', pinyin:'Qi Sha', english:'Seven Killings', archetype:'The Pioneer', traits:['Courage','Independence','Resolve'], reflection:'The Pioneer invites decisive action with a clear purpose. Choose a challenge you can approach thoughtfully, and define what enough progress means.', practice:'Take one bounded step toward a choice you have been postponing.' },
  '破军': { key:'pojun', chinese:'破军', pinyin:'Po Jun', english:'Breaking Army', archetype:'The Reinventor', traits:['Renewal','Experimentation','Freedom'], reflection:'This symbol asks what has run its course and what could take its place. Experiment on a small scale before making a sweeping change.', practice:'Retire one unhelpful habit and test a practical replacement for a week.' },
};

const NUMBER_PROFILES:Record<number,{archetype:string;traits:string[];reflection:string;practice:string}> = {
  1:{archetype:'The Initiator',traits:['Initiative','Independence','Direction'],reflection:'Use this number as a prompt to explore what you would choose if you gave your own perspective more room.',practice:'Start one small thing you have been waiting for permission to try.'},
  2:{archetype:'The Connector',traits:['Cooperation','Listening','Balance'],reflection:'Consider what a supportive partnership looks like when each person has space to be themselves.',practice:'Ask someone what helps them feel understood, then share your own answer.'},
  3:{archetype:'The Storyteller',traits:['Expression','Play','Imagination'],reflection:'Make room for an idea to become a story, a conversation, or a creative experiment.',practice:'Create something small that captures how this week feels.'},
  4:{archetype:'The Architect',traits:['Structure','Patience','Reliability'],reflection:'Explore the connection between a simple routine and the freedom it can create.',practice:'Build one repeatable step into a task that usually feels chaotic.'},
  5:{archetype:'The Adventurer',traits:['Variety','Curiosity','Flexibility'],reflection:'Notice where a fresh experience might help you see a familiar situation differently.',practice:'Change one small part of your routine and notice what you learn.'},
  6:{archetype:'The Nurturer',traits:['Care','Belonging','Responsibility'],reflection:'Reflect on how care can include both commitment to others and attention to your own needs.',practice:'Choose one act of care you can offer without overextending yourself.'},
  7:{archetype:'The Seeker',traits:['Inquiry','Reflection','Depth'],reflection:'Give a meaningful question enough quiet attention to discover what you actually think.',practice:'Write down one question worth carrying for a week, without rushing to settle it.'},
  8:{archetype:'The Organizer',traits:['Purpose','Stewardship','Follow-through'],reflection:'Consider how you want to use responsibility and influence in everyday decisions.',practice:'Define a practical outcome and the next action within your control.'},
  9:{archetype:'The Humanitarian',traits:['Perspective','Compassion','Completion'],reflection:'Think about what you want to contribute and what you are ready to set down.',practice:'Finish one lingering task or make a clear decision to release it.'},
  11:{archetype:'The Visionary',traits:['Imagination','Sensitivity','Meaning'],reflection:'Treat this symbolic number as an invitation to give an inspiring idea a practical first step.',practice:'Turn one broad intention into something you can do in ten minutes.'},
  22:{archetype:'The Master Builder',traits:['Vision','Structure','Collaboration'],reflection:'Explore how a meaningful ambition might become a series of manageable shared efforts.',practice:'Describe your goal in one sentence and identify the first useful milestone.'},
  33:{archetype:'The Mentor',traits:['Care','Expression','Service'],reflection:'Reflect on the experience you could share while remaining curious about what others have to teach you.',practice:'Share a lesson as a personal experience, then invite another perspective.'},
};

function parseDate(date:string) {
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError('Enter a date in YYYY-MM-DD format.');
  const [year,month,day]=date.split('-').map(Number);
  const probe=new Date(Date.UTC(year,month-1,day));
  if(year<1900||year>2099||probe.getUTCFullYear()!==year||probe.getUTCMonth()!==month-1||probe.getUTCDate()!==day) throw new RangeError('Enter a real date between 1900 and 2099.');
  return {year,month,day};
}

function reduceNumber(n:number,keepMaster=true) {
  const trace=[n];
  while(n>9&&!(keepMaster&&[11,22,33].includes(n))) { n=String(n).split('').reduce((s,d)=>s+Number(d),0); trace.push(n); }
  return {value:n,trace};
}

export function getNumerologyProfile(date:string,referenceYear=new Date().getFullYear()) {
  const d=parseDate(date);
  const digits=date.replace(/-/g,'').split('').map(Number);
  const sum=digits.reduce((a,b)=>a+b,0);
  const reduced=reduceNumber(sum);
  const yearDigits=String(d.month)+String(d.day)+String(referenceYear);
  const personalYear=reduceNumber(yearDigits.split('').reduce((a,b)=>a+Number(b),0),false).value;
  const content=NUMBER_PROFILES[reduced.value];
  return {mode:'numerology' as const,date,lifePath:reduced.value,personalYear,referenceYear,starKey:null,star:null,lifePalace:null,chart:null,...content,calculation:{digits,sum,reduction:reduced.trace,formula:digits.join(' + ')+' = '+reduced.trace.join(' → ')},methodology:'Sum all digits of the Gregorian birth date, then reduce while retaining 11, 22 or 33 at the final reduction stage. A symbolic numerology exercise; no birth chart is calculated without a known birth time.'};
}

export function generateProfile(input:{date:string;time?:string;clockTime?:string;hourBranch?:number;gender?:'male'|'female';unknownTime?:boolean}) {
  const birth=parseDate(input.date);
  const time=input.time??input.clockTime;
  if(input.unknownTime||(!time&&input.hourBranch===undefined)) return getNumerologyProfile(input.date);
  if(input.gender!=='male'&&input.gender!=='female') throw new RangeError('Choose the male or female setting used by the traditional chart algorithm.');
  let branch=input.hourBranch;
  let chartDate=input.date;
  let rolledToNextDay=false;
  if(time) {
    if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new RangeError('Enter a time in HH:mm format.');
    const [hours]=time.split(':').map(Number);
    branch=Math.floor((hours+1)/2)%12;
    if(hours===23) {
      const next=new Date(Date.UTC(birth.year,birth.month-1,birth.day+1));
      chartDate=next.toISOString().slice(0,10); rolledToNextDay=true;
    }
  }
  if(!Number.isInteger(branch)||branch!<0||branch!>11) throw new RangeError('Birth-hour branch must be an integer from 0 to 11.');
  const adjusted=parseDate(chartDate);
  const chart=generateChart({...adjusted,hour:branch!,gender:input.gender});
  const life=chart.palaces.find(p=>p.isMingGong)!;
  const majorStars=life.stars.filter(s=>s.type==='major').map(s=>({...STAR_PROFILES[s.name as keyof typeof STAR_PROFILES],brightness:s.brightnessRaw}));
  const borrowedStars=(life.borrowedStars||[]).map(n=>STAR_PROFILES[n as keyof typeof STAR_PROFILES]).filter(Boolean);
  const star=majorStars[0]||borrowedStars[0]||null;
  const numerology=getNumerologyProfile(input.date);
  return {
    mode:'ziwei' as const,engineVersion:ENGINE_VERSION,source:ENGINE_SOURCE,date:input.date,
    starKey:star?.key??null,star,archetype:star?.archetype??'The Open Sky',
    traits:star?.traits??['Possibility','Perspective','Adaptability'],
    reflection:star?.reflection??'An empty Life Palace invites looking across the whole chart rather than defining a person by one star.',
    practice:star?.practice??'Choose a question that helps you see your situation from a different perspective.',
    lifePath:numerology.lifePath,
    lifePalace:{branch:life.branch,originalName:life.name,name:'Life',isEmpty:majorStars.length===0,majorStars,borrowedStars,borrowedFromBranch:life.borrowedFromBranch??null},
    chart,
    calculation:{inputDate:input.date,chartDate,time:time??null,hourBranch:branch,rolledToNextDay,leapMonthPolicy:'split',brightnessSchool:'QS',timeBasis:'Entered local clock time; no longitude or daylight-saving correction.',primaryStarSource:majorStars.length?'Life Palace':'Opposite palace, because Life Palace has no major star'},
    methodology:'Zi Wei Dou Shu chart calculated locally with the MIT-licensed Renhuai123/ziwei-doushu engine. Traditional two-hour birth branches, split leap-month convention, and next-day charting for 23:00–23:59. English archetypes and reflections are original editorial interpretations, not the upstream reading dataset or validated predictions.'
  };
}

export const HOUR_BRANCHES = [
  {value:0,label:'Zi · 23:00–00:59'}, {value:1,label:'Chou · 01:00–02:59'}, {value:2,label:'Yin · 03:00–04:59'},
  {value:3,label:'Mao · 05:00–06:59'}, {value:4,label:'Chen · 07:00–08:59'}, {value:5,label:'Si · 09:00–10:59'},
  {value:6,label:'Wu · 11:00–12:59'}, {value:7,label:'Wei · 13:00–14:59'}, {value:8,label:'Shen · 15:00–16:59'},
  {value:9,label:'You · 17:00–18:59'}, {value:10,label:'Xu · 19:00–20:59'}, {value:11,label:'Hai · 21:00–22:59'}
];
