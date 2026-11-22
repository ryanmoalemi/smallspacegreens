import {escapeHTML,parseDate,lifePath,paths,dateLabel,toast,downloadText,copyText,showView,wireModal} from '../assets/common.js';

const relationships={
  partner:{label:'Partners',title:'A partnership',description:'A familiar connection still has things to discover.',question:'What small thing would make our ordinary days feel more like a team?',activity:'Choose one small thing to do together this week, then decide who will make it happen.'},
  new:{label:'A new connection',title:'Something new',description:'Curiosity can make room for a connection to find its own pace.',question:'What helps you feel comfortable getting to know someone without rushing?',activity:'Suggest one low-pressure plan and leave room for either person to change the pace.'},
  friendship:{label:'Friends',title:'A friendship',description:'A friendship has its own rhythm, with room for both of your lives.',question:'What is a small way we could stay connected when life gets full?',activity:'Choose an easy way to check in that feels welcome to both of you.'}
};
const focuses={
  communication:{label:'Communication',title:'A little more understanding',description:'Find clearer words for what you each need.',action:'Take turns finishing this sentence: “What I want you to understand is…” Let the other person reflect it back before responding.',prompt:'When I bring something up, would you like listening, ideas or a practical next step?',week:'Name one conversation habit you want to keep and one you would like to change.'},
  time:{label:'Quality time',title:'Make the ordinary feel shared',description:'Create a little space for connection in real life.',action:'Each suggest a small, realistic way to spend time together. Choose one you would both enjoy and put a date to it.',prompt:'What ordinary moment together would you happily repeat more often?',week:'Pick a short shared ritual that still works during a busy week.'},
  independence:{label:'Room to be ourselves',title:'Close, with room to breathe',description:'Explore how togetherness and individuality can fit.',action:'Each name one thing you enjoy sharing and one thing you want to keep as your own. Decide how to make room for both.',prompt:'What does healthy space look like to you, and how can we make it feel clear rather than distant?',week:'Name a boundary that protects your time and a small gesture that keeps the connection warm.'},
  chapter:{label:'A new chapter',title:'Find the next shape of this connection',description:'Make a change easier to talk about.',action:'Write down one thing you want to carry forward and one thing you are ready to do differently. Compare your answers without treating them as a final decision.',prompt:'As things change, what would you most like us to keep making time for?',week:'Choose one small experiment for the next week, then agree when to discuss how it felt.'}
};
const styles={now:{label:'Talk it through now',description:'Talking helps me find the words.'},space:{label:'Take time to process',description:'A little space helps me get clear.'}};
const elementPairs={
  air_air:{title:'Room for possibility',strength:'Two imaginative themes can make a connection feel open, curious and full of possibilities.',friction:'Keeping every option open can leave a good idea without a next step.',practice:'Choose one shared idea and give it a day, a time and a small first version.'},
  air_earth:{title:'Possibility meets a foothold',strength:'One theme invites a fresh perspective while the other gives an idea a practical place to land.',friction:'Exploration can sound vague to one person; a detailed plan can feel too settled to the other.',practice:'Start with three possibilities. Choose one small plan together, leaving one part flexible.'},
  air_spark:{title:'A spark with room to move',strength:'Imagination and initiative can give your connection a playful sense of forward motion.',friction:'Starting something new may be easier than deciding what deserves your attention now.',practice:'Pick a shared experiment small enough to finish. Celebrate completing it before adding another.'},
  air_water:{title:'Perspective meets depth',strength:'A fresh point of view and a thoughtful inner world can bring different kinds of understanding.',friction:'An idea-based response can miss a feeling; a feeling-based response can leave a question unanswered.',practice:'Before offering an interpretation, ask what the other person wants you to notice.'},
  earth_earth:{title:'Something to rely on',strength:'Two grounded themes invite consistency, thoughtful effort and something built over time.',friction:'A comfortable routine can become an unspoken rule that neither person remembers choosing.',practice:'Keep one familiar ritual and give yourselves permission to change one small part of it.'},
  earth_spark:{title:'Energy finds a structure',strength:'An initiating theme and a grounded one can help a shared idea move from possibility to action.',friction:'Moving quickly and wanting a clear plan can create different expectations about timing.',practice:'Agree on the smallest useful step, who owns it and what does not need deciding yet.'},
  earth_water:{title:'Care with a steady place',strength:'A grounded theme and a reflective one invite practical care alongside emotional attention.',friction:'Doing something helpful may not communicate the feeling behind it, and an unspoken need can stay unseen.',practice:'Name both the gesture and the intention: “I can do this, because I want you to feel supported.”'},
  spark_spark:{title:'Two people who bring things to life',strength:'Two expressive or initiating themes can make space for play, new ideas and shared momentum.',friction:'When both people have an immediate direction, taking turns can be more useful than moving faster.',practice:'Let each person choose one part of a shared plan, then decide the remaining part together.'},
  spark_water:{title:'Initiative meets awareness',strength:'One theme brings movement while the other invites a closer look at what a moment means.',friction:'An immediate response and a reflective response can arrive at different speeds.',practice:'Leave a pause after the first idea so the quieter or slower response has somewhere to land.'},
  water_water:{title:'The space beneath the words',strength:'Two reflective themes invite attention to meaning, care and the subtleties of a connection.',friction:'Feeling attuned can make it tempting to assume you already know what the other person means.',practice:'Turn an assumption into a question. Ask for the answer even when you think you can guess it.'}
};

/** Pure, deterministic reading model. No compatibility score or scientific prediction. */
export function computePair(input){
  if(!input||!input.first||!input.second)throw new Error('Please add both people.');
  for(const person of [input.first,input.second]){
    if(!parseDate(person.date))throw new Error('Choose real birth dates between 1900 and today.');
    if(!styles[person.style])throw new Error('Choose a conversation preference for each person.');
  }
  if(!relationships[input.relationship])throw new Error('Choose your relationship type.');
  if(!focuses[input.focus])throw new Error('Choose what you want to explore.');
  const a={name:String(input.first.name||'Person one').trim().slice(0,40)||'Person one',date:input.first.date,style:input.first.style,number:lifePath(input.first.date)};
  const b={name:String(input.second.name||'Person two').trim().slice(0,40)||'Person two',date:input.second.date,style:input.second.style,number:lifePath(input.second.date)};
  a.path=paths[a.number];b.path=paths[b.number];
  const relation=relationships[input.relationship],focus=focuses[input.focus];
  const key=[a.path.element,b.path.element].sort().join('_');
  const base=elementPairs[key];
  const connection=a.number===b.number?{
    title:'A familiar frequency',
    strength:`Both dates reduce to ${a.number}, a symbolic theme of ${a.path.quality}. That gives this reading a shared starting point, even though you are two different people.`,
    friction:`A shared theme of ${a.path.quality} does not mean identical needs. What feels natural to one person may still need explaining to the other.`,
    practice:'Each give a different example of what this shared theme means in your own life. Notice the difference as much as the similarity.'
  }:base;
  let rhythm;
  if(a.style===b.style&&a.style==='now'){
    rhythm={title:'Leave a little space between turns',description:'You both chose to talk things through in the moment. That gives you a shared preference for talking, but both voices still need room.',agreement:'Try one minute each without interruption. Before adding your own view, say what you heard.',question:'How can we tell when a lively conversation needs a pause?'};
  }else if(a.style===b.style){
    rhythm={title:'Make a plan to come back',description:'You both chose time to process. Quiet can be useful when it comes with a clear way to reconnect.',agreement:'Take a short pause, choose a return time together, and each bring one thought rather than a finished argument.',question:'What would make a pause feel considerate instead of uncertain?'};
  }else{
    const fast=a.style==='now'?a:b,slow=a.style==='space'?a:b;
    rhythm={title:'Different clocks, one conversation',description:`${fast.name} chose to talk things through now. ${slow.name} chose time to process. You do not have to use the same pace to make a conversation work.`,agreement:`${fast.name} can name the topic in one sentence. ${slow.name} can suggest a specific time to return. Agree on that time together so the pause has a clear ending.`,question:'What is a useful amount of pause for us, and how will we know when we are ready to return?'};
  }
  const prompts=[focus.prompt,rhythm.question,relation.question,
    `${a.name}, what would you like ${b.name} to understand about your need for ${a.path.quality}? Then swap roles.`,
    `${b.name}, when does ${b.path.quality} feel easiest to express in this connection? Then invite ${a.name} to answer.`,
    'What is something we appreciate about each other that we have not said recently?',
    'What small promise can we both realistically keep this week?'];
  const days=[
    {title:'Notice without deciding',task:`Read your two themes, ${a.path.quality} and ${b.path.quality}. Each say what resonates and what does not. You are free to disagree with the reading.`},
    {title:'Make the first question easy',task:focus.prompt},
    {title:'Try each other’s pace',task:rhythm.agreement},
    {title:'Make a small plan',task:relation.activity},
    {title:'Name what is working',task:'Each describe one specific moment when you felt understood. Talk about what made that moment useful.'},
    {title:'Leave room for a difference',task:connection.practice},
    {title:'Choose what comes next',task:focus.week}
  ];
  return {a,b,relationship:input.relationship,focusKey:input.focus,relation,focus,connection,rhythm,prompts,days,
    method:'Digit sum of the full birth date, reduced to 1–9 with 11, 22 and 33 retained when encountered.',
    disclaimer:'Original symbolic reflection for entertainment. This is not a scientific compatibility test or a prediction of your relationship.'};
}

const fresh=()=>({first:{name:'',date:'',style:''},second:{name:'',date:'',style:''},relationship:'',focus:''});
let state=fresh(),step=0,reading=null,promptIndex=0;
const h=escapeHTML;
const get=id=>document.getElementById(id);

function localToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function choice(group,value,title,description,symbol){
  const current=group==='firstStyle'?state.first.style:group==='secondStyle'?state.second.style:state[group];
  return `<button type="button" class="choice" data-group="${group}" data-value="${value}" aria-pressed="${current===value}">${symbol?`<span class="symbol" aria-hidden="true">${symbol}</span>`:''}<span><strong>${h(title)}</strong><small>${h(description)}</small></span></button>`;
}
function birthdayFields(person,label){const v=state[person];return `<fieldset class="person-fields"><legend>${label}</legend><div class="fields-two"><div class="field"><label for="${person}-name">First name <small>(optional)</small></label><input type="text" id="${person}-name" data-person="${person}" data-field="name" maxlength="40" autocomplete="off" placeholder="${person==='first'?'Your first name':'Their first name'}" value="${h(v.name)}"></div><div class="field"><label for="${person}-date">Date of birth</label><input id="${person}-date" type="date" data-person="${person}" data-field="date" min="1900-01-01" max="${localToday()}" required value="${h(v.date)}"></div></div></fieldset>`;}
function ready(){if(step===0)return true;if(step===1)return !!state.relationship;if(step===2)return !!state.focus;return !!state.first.style&&!!state.second.style;}
function renderStep(focusTitle=true){
  const titles=['Who’s in this orbit?','What kind of connection?','What would you like to explore?','How do you each find the words?'];
  const subtitles=['First names are optional. Birthdays create your symbolic number themes.','Choose the context that feels closest to where you are now.','Choose one focus. Your reading and prompts will follow it.','Use your own impressions. These answers describe a preference, not a personality test.'];
  get('quiz-title').textContent=titles[step];get('quiz-subtitle').textContent=subtitles[step];
  get('step-label').textContent=`Step ${step+1} of 4`;get('quiz-progress').setAttribute('aria-valuenow',String(step+1));get('progress-fill').style.width=`${(step+1)*25}%`;
  if(step===0){get('quiz-fields').innerHTML=`<div class="form-card">${birthdayFields('first','You')}${birthdayFields('second','The other person')}<p class="relationship-note">Use details you are comfortable sharing. Nothing is sent to a server.</p></div>`;}
  if(step===1){get('quiz-fields').innerHTML=`<div class="choices" role="group" aria-label="Relationship type">${choice('relationship','partner','Partners','A connection you want to keep understanding.','∞')}${choice('relationship','new','A new connection','Something beginning, at your own pace.','✧')}${choice('relationship','friendship','Friends','A friendship with its own kind of closeness.','◌')}</div>`;}
  if(step===2){get('quiz-fields').innerHTML=`<div class="choices" role="group" aria-label="Your focus">${choice('focus','communication','Communication','Find clearer words for what you each need.','≋')}${choice('focus','time','Quality time','Make a little more room for each other.','◷')}${choice('focus','independence','Room to be ourselves','Balance connection and individuality.','◇')}${choice('focus','chapter','A new chapter','Talk about what stays and what changes.','✧')}</div>`;}
  if(step===3){get('quiz-fields').innerHTML=`<div class="form-card">${['first','second'].map((person,i)=>`<fieldset class="style-picker"><legend>${h(state[person].name.trim()||(i===0?'You':'The other person'))}</legend><div class="choices">${choice(`${person}Style`,'now',styles.now.label,styles.now.description)}${choice(`${person}Style`,'space',styles.space.label,styles.space.description)}</div></fieldset>`).join('')}</div>`;}
  get('quiz-error').textContent='';get('continue').disabled=!ready();get('continue').textContent=step===3?'Read our connection':'Continue';
  if(focusTitle){get('quiz-title').tabIndex=-1;get('quiz-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
function start(){step=0;renderStep(false);showView('quiz-view');}
function clearAndStart(){state=fresh();reading=null;promptIndex=0;start();}
function showError(message,field){get('quiz-error').textContent=message;if(field){get(field).setAttribute('aria-invalid','true');get(field).focus();}}
function advance(event){
  event.preventDefault();
  if(step===0){
    for(const [person,label]of [['first','your'],['second','the other person’s']]){
      if(!state[person].date){showError(`Please add ${label} date of birth.`,`${person}-date`);return;}
      if(!parseDate(state[person].date)){showError(`Please choose a real ${label} birth date between 1900 and today.`,`${person}-date`);return;}
    }
  }
  if(!ready()){showError('Choose an answer to continue.');return;}
  if(step<3){step++;renderStep();return;}
  try{reading=computePair(state);promptIndex=0;renderResult();showView('results-view');}catch(err){showError(err.message);}
}
function profile(person){return `<article class="reading-card"><div class="profile-line"><span class="number">${person.number}</span><h3><small>${h(person.name)} · ${h(dateLabel(person.date))}</small>${h(person.path.title)}</h3></div><p>${h(person.path.gift)}</p><p><strong>A useful reflection:</strong> ${h(person.path.growth)}</p></article>`;}
function renderResult(){
  const r=reading;
  get('result-content').innerHTML=`<div class="result-banner"><div><p class="result-subtitle">${h(r.relation.label)} · ${h(r.focus.label)}</p><h1 id="result-title">${h(r.a.name)} &amp; ${h(r.b.name)}</h1><span class="connection-label">${h(r.connection.title)}</span><p>${h(r.relation.description)} This reading brings together the symbolic themes of ${h(r.a.path.quality)} and ${h(r.b.path.quality)}.</p></div><div class="pair-badges" aria-label="Symbolic numbers ${r.a.number} and ${r.b.number}"><div class="sigil"><div><span>${r.a.number}</span><small class="badge-name">${h(r.a.name)}</small></div></div><div class="sigil"><div><span>${r.b.number}</span><small class="badge-name">${h(r.b.name)}</small></div></div></div></div>
    <div class="result-grid">${profile(r.a)}${profile(r.b)}</div>
    <div class="result-grid"><article class="reading-card"><p class="eyebrow">Where you can meet</p><h3>${h(r.connection.title)}</h3><p>${h(r.connection.strength)}</p></article><article class="reading-card"><p class="eyebrow">What needs a little room</p><h3>A difference worth naming</h3><p>${h(r.connection.friction)}</p></article></div>
    <article class="wide-panel"><p class="eyebrow">Your chosen focus · ${h(r.focus.label)}</p><h2>${h(r.focus.title)}</h2><p>${h(r.focus.action)}</p><div class="style-summary"><p><strong>${h(r.rhythm.title)}</strong><br>${h(r.rhythm.description)}</p><p>${h(r.rhythm.agreement)}</p></div></article>`;
  updatePrompt();renderMerchant();
}
function updatePrompt(){get('conversation-prompt').textContent=reading.prompts[promptIndex];get('prompt-counter').textContent=`Question ${promptIndex+1} of ${reading.prompts.length}`;}
function renderMerchant(){
  const friendship=reading.relationship==='friendship';
  const product=friendship?{name:'The Five Minute Journal',url:'https://www.intelligentchange.com/products/the-five-minute-journal',symbol:'≋',format:'One undated journal · 264 pages',why:'For a writing ritual of your own, with one prompt you might choose to discuss together.'}:{name:'Get Closer: Couples',url:'https://www.intelligentchange.com/collections/play/products/get-closer-couples-edition',symbol:'∞',format:'100 conversation cards · For adults 18+',why:reading.relationship==='new'?'For two adults who both want to explore a new connection through conversation.':'For two adults who want an easy, repeatable conversation ritual.'};
  get('merchant-content').innerHTML=`<section class="merchant-area" aria-labelledby="merchant-title"><p class="eyebrow">Carry the conversation into real life</p><h2 id="merchant-title">An optional next step.</h2><div class="merchant-card"><div class="merchant-art" aria-hidden="true">${product.symbol}</div><div><h3>${product.name}</h3><p>${product.format}</p><p>${product.why}</p></div><a class="btn secondary" href="${product.url}" target="_blank" rel="noopener noreferrer">View at Intelligent Change</a></div><div class="free-option"><strong>Or start with what you already have.</strong>Take the questions above to a walk, a shared meal or a simple notebook. You do not need to buy anything to use your reading.</div><p class="merchant-note">This demo uses ordinary, untracked product links. No affiliate commission is connected. Check the merchant for current price, availability and terms. Product symbols are illustrative.</p></section>`;
}
function reportText(){
  const r=reading;
  return `ORBIT TWO\n${r.a.name} & ${r.b.name}\nPersonalized pair report | Free demo preview\nProposed future price: $19 one time. No payment was collected.\n\n${r.relation.label} | Focus: ${r.focus.label}\n\nYOUR TWO THEMES\n${r.a.name} | ${dateLabel(r.a.date)} | ${r.a.number}: ${r.a.path.title}\n${r.a.path.gift}\nReflection: ${r.a.path.growth}\n\n${r.b.name} | ${dateLabel(r.b.date)} | ${r.b.number}: ${r.b.path.title}\n${r.b.path.gift}\nReflection: ${r.b.path.growth}\n\nWHERE YOU CAN MEET\n${r.connection.title}\n${r.connection.strength}\n\nA DIFFERENCE WORTH NAMING\n${r.connection.friction}\nTry: ${r.connection.practice}\n\nYOUR CHOSEN FOCUS\n${r.focus.title}\n${r.focus.action}\n\nYOUR CONVERSATION RHYTHM\n${r.rhythm.title}\n${r.rhythm.description}\n${r.rhythm.agreement}\n\nSEVEN DAYS OF SMALL CONVERSATIONS\n${r.days.map((day,i)=>`Day ${i+1}: ${day.title}\n${day.task}`).join('\n\n')}\n\nQUESTIONS TO COME BACK TO\n${r.prompts.map((q,i)=>`${i+1}. ${q}`).join('\n\n')}\n\nHOW THIS WAS MADE\n${r.method}\nRelationship type, selected focus and self-described conversation styles also change this report.\n\n${r.disclaimer}\n\nNames and birthdays are included in this personal copy. Share it only if both people are comfortable. No purchase or product is required to use the prompts.\n`;
}
function openReport(){
  const r=reading;
  get('full-report').innerHTML=`<p class="eyebrow">Orbit Two · A little closer</p><h2 id="report-title">${h(r.a.name)} &amp; ${h(r.b.name)}</h2><p class="report-meta">${h(r.relation.label)} · ${h(r.focus.label)}<br>Personalized pair report · Proposed future price: $19 one time</p><div class="report-callout">This complete preview is free. No payment was collected.</div>
    <h3>Your two themes</h3><p><strong>${h(r.a.name)} · ${h(dateLabel(r.a.date))} · ${r.a.number}: ${h(r.a.path.title)}</strong><br>${h(r.a.path.gift)}</p><p><strong>A useful reflection:</strong> ${h(r.a.path.growth)}</p><p><strong>${h(r.b.name)} · ${h(dateLabel(r.b.date))} · ${r.b.number}: ${h(r.b.path.title)}</strong><br>${h(r.b.path.gift)}</p><p><strong>A useful reflection:</strong> ${h(r.b.path.growth)}</p>
    <h3>Where you can meet</h3><p><strong>${h(r.connection.title)}</strong><br>${h(r.connection.strength)}</p><h3>A difference worth naming</h3><p>${h(r.connection.friction)}</p><p>${h(r.connection.practice)}</p>
    <h3>Your focus: ${h(r.focus.label)}</h3><p>${h(r.focus.action)}</p><h3>Your conversation rhythm</h3><p><strong>${h(r.rhythm.title)}</strong><br>${h(r.rhythm.description)}</p><div class="report-callout">${h(r.rhythm.agreement)}</div>
    <h3>Seven days of small conversations</h3><p>No perfect streak required. Use one of these whenever you have a little space for each other.</p><ol class="report-days">${r.days.map(d=>`<li><strong>${h(d.title)}</strong><br>${h(d.task)}</li>`).join('')}</ol>
    <h3>Questions to come back to</h3><ol>${r.prompts.map(p=>`<li>${h(p)}</li>`).join('')}</ol><div class="report-divider"></div><h3>How this was made</h3><p>${h(r.method)} Your relationship type, selected focus and self-described conversation styles also shape this report.</p><p class="small">${h(r.disclaimer)} No purchase or product is required to use these prompts. This personal copy includes names and birthdays; share it only if both people are comfortable.</p>`;
  get('report-modal').showModal();get('report-modal').scrollTop=0;
}
function shortReading(){const r=reading;return `Orbit Two: ${r.a.name} & ${r.b.name}\n\n${r.connection.title}\n${r.connection.strength}\n\nA small thing to try:\n${r.focus.action}\n\nA question for us:\n${r.prompts[promptIndex]}\n\nSymbolic reflection for entertainment. Not a scientific compatibility test.`;}
function init(){
  wireModal();
  get('start-reading').addEventListener('click',clearAndStart);
  get('sample-reading').addEventListener('click',()=>{state={first:{name:'Alex',date:'1990-07-12',style:'now'},second:{name:'Jordan',date:'1988-11-03',style:'space'},relationship:'partner',focus:'communication'};reading=computePair(state);promptIndex=0;renderResult();showView('results-view');});
  get('quiz-fields').addEventListener('input',e=>{const el=e.target;if(el.dataset.person&&el.dataset.field){state[el.dataset.person][el.dataset.field]=el.value;el.removeAttribute('aria-invalid');get('quiz-error').textContent='';}});
  get('quiz-fields').addEventListener('click',e=>{const button=e.target.closest('button[data-group]');if(!button)return;const group=button.dataset.group,value=button.dataset.value;if(group==='firstStyle')state.first.style=value;else if(group==='secondStyle')state.second.style=value;else state[group]=value;get('quiz-fields').querySelectorAll(`button[data-group="${group}"]`).forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.value===value)));get('continue').disabled=!ready();get('quiz-error').textContent='';});
  get('quiz-form').addEventListener('submit',advance);
  get('go-back').addEventListener('click',()=>{if(step===0){showView('intro-view');return;}step--;renderStep();});
  get('edit-reading').addEventListener('click',start);
  get('restart-reading').addEventListener('click',clearAndStart);
  get('next-prompt').addEventListener('click',()=>{promptIndex=(promptIndex+1)%reading.prompts.length;updatePrompt();});
  get('preview-report').addEventListener('click',openReport);
  get('download-report').addEventListener('click',()=>downloadText('orbit-two-personal-report.txt',reportText()));
  get('copy-reading').addEventListener('click',()=>copyText(shortReading()));
  window.computePair=computePair;
}
if(typeof document!=='undefined')init();
