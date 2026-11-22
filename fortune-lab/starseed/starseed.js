/* Starseed Rituals: original symbolic quiz, browser-only state, no personal-data collection.
   Products checked 2026-11-22 against the linked primary merchant pages.
   Public demo links are untracked. Program acceptance and approved tracking must precede monetization. */
'use strict';
(() => {
  const QUESTIONS = [
    { key:'calling', category:'YOUR INNER COMPASS', title:'What are you making room for?', description:'Choose what feels most like this chapter of your life.', options:[
      {value:'connection',symbol:'❋',title:'Feeling close to my people',caption:'More connection, kindness, and shared moments.'},
      {value:'structure',symbol:'◈',title:'Finding my rhythm again',caption:'A little structure. A practice I can keep.'},
      {value:'curiosity',symbol:'✧',title:'Following a new idea',caption:'Learning, noticing, and making something.'},
      {value:'freedom',symbol:'☾',title:'Having space to be myself',caption:'Less noise. More room for my own choices.'}
    ]},
    { key:'sanctuary', category:'YOUR KIND OF WONDER', title:'Where would you lose track of time?', description:'Pick the place you would happily have to yourself.', options:[
      {value:'garden',symbol:'❊',title:'A garden after the rain',caption:'Growing things, warm light, familiar scents.'},
      {value:'workshop',symbol:'◇',title:'A quiet, sunlit workshop',caption:'A clear desk and something to make by hand.'},
      {value:'observatory',symbol:'✶',title:'An observatory at midnight',caption:'A big question and a sky full of possibilities.'},
      {value:'coast',symbol:'≈',title:'An open stretch of coastline',caption:'No itinerary. Just space to wander.'}
    ]},
    { key:'ritualTime', category:'MAKE IT FIT YOUR LIFE', title:'How much time feels realistic?', description:'A ritual only needs to be as big as the space you have.', options:[
      {value:'5',symbol:'·',title:'5 minutes',caption:'Something small I can fit into an ordinary day.'},
      {value:'10',symbol:'⋆',title:'10 minutes',caption:'A little room to settle in and reflect.'},
      {value:'20',symbol:'✧',title:'20 minutes',caption:'A more spacious practice to make my own.'}
    ]},
    { key:'ritualStyle', category:'CHOOSE YOUR COMPANION', title:'What would you like beside you?', description:'We will tailor your ritual and optional product picks.', options:[
      {value:'herbal',symbol:'❊',title:'A caffeine-free herbal tea',caption:'A simple cup and a moment to pause.'},
      {value:'green',symbol:'❋',title:'A cup of green tea',caption:'A tea ritual is welcome. Caffeine is okay.'},
      {value:'journal',symbol:'▤',title:'A notebook and pen',caption:'No tea needed. I like to think on paper.'},
      {value:'cards',symbol:'✦',title:'A beautiful oracle deck',caption:'Images and symbols give me a starting point.'}
    ]}
  ];
  const PROFILES = {
    pleiadian:{name:'Pleiadian',title:'The Connector',symbol:'❋',theme:'connection',summary:'You are drawn to moments that feel warm, shared, and personal. Your ritual is an invitation to bring that same attention to your own day.',pull:'Connection is your chosen direction. A small gesture, a thoughtful note, or a familiar ritual can give your day a sense of meaning.',pattern:'When your attention keeps moving outward, your own preferences can get quieter. Leave a little room for what you would choose just for yourself.',move:'Choose one person, place, or ordinary detail you appreciate. Put that appreciation into a sentence, then write one sentence for yourself.',mantra:'Connection begins with attention.',days:[
      ['Notice what is here','Write down three small things you appreciate in your surroundings. Choose one and describe the detail you usually miss.','What makes an ordinary place feel like mine?',['Which detail held my attention?','What did it remind me of?','How could I make more room for this tomorrow?']],
      ['Keep a kind detail','Recall a kind gesture someone made. Write the moment as a short scene, including what made it feel personal.','What kind of care do I notice most?',['What happened, in concrete terms?','Why has this moment stayed with me?','What small version could I offer someone else?']],
      ['Write the unsent note','Draft a few lines of appreciation to someone. You can keep the note private or choose to share it later.','What have I appreciated without saying?',['Who came to mind first?','What exactly do I appreciate about them?','What would a sincere, uncomplicated note say?']],
      ['Make something welcoming','Choose one small corner of your space and arrange it with intention. Work with what you have: a book, a cup, a cleared surface.','What does welcome look like to me?',['Which spot did I choose?','What made it feel more like mine?','Who, including me, might enjoy this space?']],
      ['Save a shared story','Remember an ordinary moment with someone you care about. Record the scene and a detail you would like to keep.','Which shared moment deserves a place on paper?',['Where were we?','What small detail makes the memory vivid?','What does the story tell me about what I value?']],
      ['Include yourself','Write a kind, practical note to yourself about the coming day. Keep it simple enough to act on.','What would I say to someone I care about in my position?',['What does tomorrow actually ask of me?','What would make it a little easier?','What is one gentle thing I can do for myself?']],
      ['Choose what continues','Look back at the week. Pick one practice you would enjoy repeating and give it a small, specific place in your schedule.','Which moment felt most like me?',['What did I enjoy enough to repeat?','When could it fit naturally?','What can I leave behind without guilt?']]
    ]},
    sirian:{name:'Sirian',title:'The Keeper',symbol:'◈',theme:'rhythm',summary:'You are drawn to a sense of rhythm: a clear place to begin, a practice with purpose, and something that grows through repetition.',pull:'You chose steadiness and a place to make things happen. Your ritual gives ordinary actions a beginning, middle, and end.',pattern:'A practice does not have to be elaborate to count. If a routine becomes another obligation, make it smaller before you make it stricter.',move:'Choose one existing daily moment and give it a small ritual: a cup, a page, or a single observation. Keep the setup easy to repeat.',mantra:'Small things, returned to.',days:[
      ['Set a place','Choose a spot for your ritual and put one useful object there. Decide what will signal the start, such as sitting down or opening a notebook.','What makes it easy for me to begin?',['Where will this practice live?','Which object belongs here?','What small signal can mean it is time?']],
      ['Name the essentials','Write three things that matter in a good ordinary day. Circle the one you can make space for today.','What is enough for today?',['What matters when I strip away the extras?','Which part is within reach today?','What is the smallest complete version of it?']],
      ['Make a simple sequence','Choose three actions for your ritual and put them in an order. Try the sequence once, then adjust anything that feels awkward.','Which sequence feels natural?',['What happens first?','What helps me stay with it?','How will I know I am finished?']],
      ['Leave a little margin','Look at one routine you already follow. Find something you can simplify or prepare ahead of time.','Where can I make tomorrow easier?',['Which part takes more effort than it needs?','What could I prepare once instead of repeatedly?','What space would that give back?']],
      ['Notice quiet progress','Record one small thing that has become easier through practice. Describe what changed without turning it into a score.','What is growing through repetition?',['What did I notice today?','What did I do consistently?','What would help it keep feeling manageable?']],
      ['Try the smaller version','Make a shorter version of your ritual using just its most meaningful part. Notice whether it still feels complete.','What is the heart of this practice?',['What did I keep?','What could I leave out?','When would this smaller version be useful?']],
      ['Choose a rhythm','Decide when this practice fits best. Choose a realistic frequency and a simple cue to return to it.','What kind of rhythm can I enjoy?',['Which day or moment felt easiest?','How often would I like to return?','What will remind me without making it a chore?']]
    ]},
    arcturian:{name:'Arcturian',title:'The Seeker',symbol:'✶',theme:'wonder',summary:'You are drawn to possibility: a fresh question, a pattern worth noticing, and the pleasure of seeing a familiar thing from a new angle.',pull:'You chose curiosity and room to explore. Your ritual turns noticing into a small creative practice, with no right answer to discover.',pattern:'You can leave a question open. A ritual is not a research assignment, and a page of possibilities does not need a final conclusion.',move:'Pick one ordinary object and notice five details. Choose one detail as the starting point for a question, sketch, or short paragraph.',mantra:'Leave room for a better question.',days:[
      ['Look a second time','Choose an ordinary object and study it as if it were unfamiliar. Write five details, then pick the one that surprised you.','What have I stopped noticing?',['Which object did I choose?','What detail was new to me?','What question does that detail suggest?']],
      ['Collect a question','Write a question you would enjoy exploring. List three possible ways of looking at it without trying to settle it.','What am I curious about for its own sake?',['What question keeps returning?','What are three possible angles?','Which angle would be enjoyable to explore first?']],
      ['Change the viewpoint','Describe a familiar place from the perspective of a visitor. Notice what your description includes and leaves out.','What looks different from another viewpoint?',['What would a visitor notice first?','What do I take for granted?','Which detail would I like to look at again?']],
      ['Make a small connection','Choose two things you enjoy that seem unrelated. Write a short list of ways they might connect, or sketch a playful combination.','What could these two things teach each other?',['Which two things did I choose?','What do they unexpectedly share?','What would a playful combination look like?']],
      ['Try an unfinished idea','Make a tiny draft of an idea: a sketch, a paragraph, a list, or a simple arrangement. Let it stay unfinished.','What can I try before I know how it ends?',['What did I make?','Which part was enjoyable?','What might I try next, if I feel like returning?']],
      ['Let a symbol wander','Choose an image or shape around you. Write three different meanings you could give it today. These are your interpretations.','How many ways can I read one thing?',['What caught my eye?','What are three possible meanings?','Which meaning speaks to this particular day?']],
      ['Keep one open door','Read through the week and choose a question or experiment you would like to revisit. Give it a place to live in your notebook.','Which curiosity deserves more room?',['What would I like to return to?','What is a small, enjoyable next step?','What can remain unresolved for now?']]
    ]},
    andromedan:{name:'Andromedan',title:'The Wanderer',symbol:'☾',theme:'freedom',summary:'You are drawn to room to move: an open possibility, a choice that feels like yours, and a little space around the edges of your day.',pull:'You chose freedom and an invitation to wander. Your ritual creates a pocket of time without a performance, audience, or fixed outcome.',pattern:'Freedom can begin with a small choice. You do not need to redesign your whole life to make one moment feel more like your own.',move:'Choose a small part of today that usually happens on autopilot. Try a different route, setting, or order, simply because you can.',mantra:'A little space is a beginning.',days:[
      ['Claim a little space','Choose a comfortable spot and spend a moment without deciding what you should accomplish. Then write what you notice.','What do I notice when there is no assignment?',['What caught my attention first?','What did I feel like doing?','What would make this little space feel more like mine?']],
      ['Change one ordinary thing','Make a small change to an ordinary routine: where you sit, which notebook you use, or the order of a familiar task.','What changes when I choose differently?',['What did I change?','What did I notice as a result?','Would I choose it again?']],
      ['Follow a small interest','Choose something you would like to learn, make, or look at for its own sake. Spend your ritual time following that thread.','What would I explore with no need to explain why?',['What drew me in?','What part did I enjoy?','Where could this interest lead, if I choose?']],
      ['Make an open list','Write a list titled “Things I might like to try.” Keep it playful and leave out deadlines, rankings, and promises.','What possibilities would I like to keep open?',['What did I add without overthinking?','Which possibility feels light and inviting?','What could I try with what I already have?']],
      ['Choose what to leave out','Look at one optional expectation you have placed on this ritual. Decide whether it serves you, and let yourself adjust it.','What can be simpler and still feel like mine?',['Which expectation did I notice?','Is it necessary for this practice?','What would I choose instead?']],
      ['Let the page meander','Write, sketch, or make a list without choosing a topic first. Follow whatever appears, then stop when your time is up.','Where does my attention go when I let it wander?',['What appeared on the page?','Was there a detail I want to keep?','What can I leave exactly as it is?']],
      ['Keep a flexible ritual','Choose two or three moments from the week you enjoyed. Make a small menu you can choose from on different days.','What kind of freedom would I like to keep?',['Which practices would I put on my menu?','How can I choose without pressure?','What space can I leave for something unexpected?']]
    ]}
  };
  const PRODUCTS = {
    chamomile:{id:'chamomile',name:'Egyptian Chamomile',brand:'Art of Tea',category:'Caffeine-free tea',symbol:'❊',url:'https://www.artoftea.com/products/egyptian-chamomile-caffeine-free',facts:'Organic chamomile flowers · Naturally caffeine-free · Loose leaf',fit:'You chose a caffeine-free tea ritual. This single-ingredient chamomile is one optional way to make the cup part of your practice.',limitation:'Choose a size and check the current price. Use an infuser or strainer; check ingredients for your own preferences.',sourceChecked:'2026-11-22'},
    sencha:{id:'sencha',name:'Sencha',brand:'Art of Tea',category:'Green tea',symbol:'❋',url:'https://www.artoftea.com/products/sencha',facts:'Organic green tea · Contains caffeine · Loose leaf',fit:'You welcomed caffeine and a tea ritual. This green tea gives you a simple, repeatable preparation to enjoy before your reflection.',limitation:'Choose a size and check the current price. Follow the merchant’s brewing guidance; use an infuser or strainer.',sourceChecked:'2026-11-22'},
    journal:{id:'journal',name:'The Five Minute Journal',brand:'Intelligent Change',category:'A place for reflection',symbol:'▤',url:'https://www.intelligentchange.com/products/the-five-minute-journal',facts:'One undated, linen-bound journal · 264 pages · Five daily prompts',fit:'A structured place to write can help give your ritual a home. Use its prompts alongside, or instead of, the plan on this page.',limitation:'This is a physical journal with its own prompts. A notebook you already own works too.',sourceChecked:'2026-11-22'},
    oracle:{id:'oracle',name:'The Starseed Oracle',brand:'Hay House',category:'Symbols to reflect on',symbol:'✦',url:'https://shop.hayhouse.com/products/the-starseed-oracle',facts:'53-card deck and guidebook · Rebecca Campbell & Danielle Noel',fit:'You chose images and symbols. Draw a card as a creative prompt, then reflect on what the image means to you today.',limitation:'Check availability at the merchant. This is a reflection tool, not evidence about ancestry or a guaranteed prediction.',sourceChecked:'2026-11-22'}
  };
  const CALLING_SCORES = {connection:{pleiadian:4,andromedan:2},structure:{sirian:4,arcturian:2},curiosity:{arcturian:4,andromedan:2},freedom:{andromedan:4,pleiadian:2}};
  const SANCTUARY_SCORES = {garden:{pleiadian:3,sirian:1},workshop:{sirian:3,arcturian:1},observatory:{arcturian:3,andromedan:1},coast:{andromedan:3,sirian:1}};
  const CALLING_PROFILE = {connection:'pleiadian',structure:'sirian',curiosity:'arcturian',freedom:'andromedan'};
  const CALLING_TEXT = {connection:'connection',structure:'a steadier rhythm',curiosity:'curiosity',freedom:'personal freedom'};
  const SANCTUARY_TEXT = {garden:'a garden',workshop:'a quiet workshop',observatory:'an observatory',coast:'the coastline'};
  const STYLE_TEXT = {herbal:'a caffeine-free tea',green:'green tea',journal:'a notebook',cards:'an oracle deck'};
  const state={step:0,answers:{},result:null,completed:new Set(),lastDialogFocus:null};
  function validateAnswers(answers) {
    QUESTIONS.forEach(q=>{if(!q.options.some(o=>o.value===String(answers[q.key])))throw new Error('Please choose an answer for '+q.key+'.');});
  }
  function getProducts(style) {
    if(style==='herbal')return [PRODUCTS.chamomile,PRODUCTS.journal];
    if(style==='green')return [PRODUCTS.sencha,PRODUCTS.journal];
    if(style==='cards')return [PRODUCTS.oracle,PRODUCTS.journal];
    return [PRODUCTS.journal];
  }
  function makePlan(profileId,minutes,style){
    const profile=PROFILES[profileId];
    if(!profile||![5,10,20].includes(Number(minutes))||!Object.hasOwn(STYLE_TEXT,style))throw new Error('Invalid ritual settings.');
    return profile.days.map((day,i)=>({day:i+1,title:day[0],action:day[1],prompt:day[2],journalPrompts:day[3],minutes:Number(minutes),style}));
  }
  function matchProfile(answers){
    validateAnswers(answers);
    const scores={pleiadian:0,sirian:0,arcturian:0,andromedan:0};
    [CALLING_SCORES[answers.calling],SANCTUARY_SCORES[answers.sanctuary]].forEach(weights=>Object.entries(weights).forEach(([key,n])=>scores[key]+=n));
    const highest=Math.max(...Object.values(scores));
    const tied=Object.keys(scores).filter(id=>scores[id]===highest);
    const preferred=CALLING_PROFILE[answers.calling];
    const id=tied.includes(preferred)?preferred:tied[0];
    const minutes=Number(answers.ritualTime);
    return {id,...PROFILES[id],scores,minutes,style:answers.ritualStyle,reason:`You chose ${CALLING_TEXT[answers.calling]} and ${SANCTUARY_TEXT[answers.sanctuary]}. Your ${minutes}-minute plan includes ${STYLE_TEXT[answers.ritualStyle]}.`,plan:makePlan(id,minutes,answers.ritualStyle),products:getProducts(answers.ritualStyle)};
  }
  window.StarseedDemo=Object.freeze({matchProfile,makePlan,getProducts,QUESTIONS,PROFILES,PRODUCTS});
  const $=id=>document.getElementById(id);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function scrollTop(){window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  function showSection(section){['intro','quiz-section','result-section'].forEach(id=>$(id).hidden=id!==section);scrollTop();}
  function startQuiz(){state.step=0;state.answers={};state.result=null;state.completed.clear();showSection('quiz-section');renderQuestion();}
  function renderQuestion(){
    const q=QUESTIONS[state.step];
    $('step-label').textContent=`Question ${state.step+1} of ${QUESTIONS.length}`;
    $('question-category').textContent=q.category;
    $('question-title').textContent=q.title;
    $('question-description').textContent=q.description;
    $('quiz-progress').setAttribute('aria-valuenow',state.step+1);
    $('quiz-progress').setAttribute('aria-valuetext',`Question ${state.step+1} of 4`);
    $('progress-fill').style.width=((state.step+1)/QUESTIONS.length*100)+'%';
    $('quiz-options').innerHTML=q.options.map(o=>`<button class="option" data-answer="${o.value}" aria-pressed="${state.answers[q.key]===o.value}"><span class="option-symbol" aria-hidden="true">${o.symbol}</span><span class="option-text"><span class="option-title">${escape(o.title)}</span><span class="option-caption">${escape(o.caption)}</span></span><span class="option-radio" aria-hidden="true"></span></button>`).join('');
    $('quiz-options').querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>chooseAnswer(button.dataset.answer)));
    $('question-title').focus({preventScroll:true});
  }
  function chooseAnswer(value){const q=QUESTIONS[state.step];if(!q.options.some(o=>o.value===value))return;state.answers[q.key]=value;if(state.step<QUESTIONS.length-1){state.step++;renderQuestion();scrollTop();}else{state.result=matchProfile(state.answers);renderResult();}}
  function planIntroduction(result){
    const split=result.minutes===5?'1 minute to arrive, 3 minutes for the practice, and 1 minute to reflect.':result.minutes===10?'2 minutes to arrive, 6 minutes for the practice, and 2 minutes to reflect.':'3 minutes to arrive, 12 minutes for the practice, and 5 minutes to reflect.';
    const setup=result.style==='herbal'||result.style==='green'?'Prepare your tea according to its package before you begin. No special tea is required.':result.style==='cards'?'If you have a deck, draw one card before each practice and use its image as an optional prompt. A picture you already own works too.':'Bring any notebook and pen, or use a note on your phone.';
    return `${split} ${setup}`;
  }
  function renderResult(){
    const r=state.result;
    $('result-section').innerHTML=`
      <div class="result-topline"><span><span aria-hidden="true">✦</span> Your ritual is ready</span><button class="text-button" data-restart>Retake the quiz</button></div>
      <div class="result-hero"><div><p class="eyebrow">YOUR SYMBOLIC ARCHETYPE</p><h1 id="result-title" tabindex="-1">${r.name}</h1><p class="archetype-subtitle">${r.title}</p><p class="archetype-summary">${r.summary}</p></div><div class="result-emblem" aria-hidden="true"><span>${r.symbol}</span></div></div>
      <p class="match-reason"><span aria-hidden="true">✧</span><span>${r.reason}</span></p>
      <div class="reading-grid"><article><h2>Your natural pull</h2><p>${r.pull}</p></article><article><h2>A pattern to notice</h2><p>${r.pattern}</p></article><article><h2>Your next small move</h2><p>${r.move}</p></article></div>
      <div class="section-heading"><div><p class="eyebrow">A LITTLE SPACE, EVERY DAY</p><h2>Your seven-day ritual</h2></div><p>${r.minutes} minutes a day · Free to keep</p></div>
      <div class="plan-actions"><button class="button button-secondary" id="download-plan">Save my plan</button><button class="button button-secondary" id="print-plan">Print my plan</button><button class="button button-secondary" id="copy-plan">Copy my plan</button></div>
      <p class="plan-notes">${planIntroduction(r)} Keep what you enjoy and adapt the rest.</p>
      <div class="day-list">${r.plan.map((day,i)=>`<details class="day-card"${i===0?' open':''} id="day-${day.day}"><summary><span class="day-number">DAY ${String(day.day).padStart(2,'0')}</span><h3>${day.title}</h3><span class="day-time">${day.minutes} min</span><span class="day-expand" aria-hidden="true">+</span></summary><div class="day-body"><p>${day.action}</p><div class="reflection-prompt">${day.prompt}</div><button class="mark-complete" aria-pressed="false" data-day="${day.day}">Mark as complete</button></div></details>`).join('')}</div>
      <div class="journal-offer"><div class="book-art" aria-hidden="true"><span>${r.symbol}</span><span>The ${r.title.replace('The ','')}<br>Ritual Journal</span></div><div><h3>Give your ritual a place to grow.</h3><p>A seven-day digital journal for ${r.title.toLowerCase()}, with three deeper prompts each day and space to make them yours.</p></div><div><button class="button button-cream" id="preview-journal">Preview the $9 ritual journal</button><p class="offer-meta">Full demo preview · No payment</p></div></div>
      <div class="section-heading"><div><p class="eyebrow">OPTIONAL RITUAL COMPANIONS</p><h2>A few things that fit.</h2></div></div>
      <p class="products-intro">Selected for your ${r.style==='journal'?'writing':r.style==='cards'?'card-and-reflection':'tea-and-reflection'} ritual. You can do every practice with what you already own.</p>
      <div class="product-grid">${r.products.map(product=>`<article class="product-card"><div class="product-symbol" aria-hidden="true">${product.symbol}</div><div><p class="product-category">${product.category}</p><h3>${product.name}</h3><p class="product-fit">${product.fit}</p><p class="product-facts">${product.facts}</p><a class="button button-secondary" href="${product.url}" target="_blank" rel="noopener noreferrer">View at ${product.brand}</a><p class="product-limit">${product.limitation}</p></div></article>`).join('')}</div>
      <p class="disclosure">Product links open the merchant’s website. This demo uses ordinary, untracked links, so it earns no commission. Product details were checked November 22, 2026. Category symbols are illustrations, not product photographs.</p>
      <div class="result-end"><p>“${r.mantra}”</p><button class="text-button" id="result-method">How your result was matched</button></div>`;
    $('result-section').querySelectorAll('[data-restart]').forEach(button=>button.addEventListener('click',startQuiz));
    $('result-section').querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>toggleDay(Number(button.dataset.day),button)));
    $('download-plan').addEventListener('click',()=>downloadText(planText(false),`starseed-${r.id}-7-day-plan.txt`));
    $('print-plan').addEventListener('click',printPlan);
    $('copy-plan').addEventListener('click',copyPlan);
    $('preview-journal').addEventListener('click',openJournal);
    $('result-method').addEventListener('click',openMethod);
    showSection('result-section');$('result-title').focus({preventScroll:true});
  }
  function toggleDay(day,button){if(state.completed.has(day))state.completed.delete(day);else state.completed.add(day);const complete=state.completed.has(day);button.setAttribute('aria-pressed',String(complete));button.textContent=complete?'Completed · Undo':'Mark as complete';$('day-'+day).classList.toggle('completed',complete);}
  function planText(journal){const r=state.result;if(!r)return '';const lines=['STARSEED RITUALS',`${r.name} · ${r.title}`,journal?'Seven-day ritual journal · Full demo preview':'Your free seven-day ritual',`Personalized for ${r.minutes} minutes a day and ${STYLE_TEXT[r.style]}.`,'',r.summary,'',r.reason,'',planIntroduction(r),''];r.plan.forEach(day=>{lines.push(`DAY ${day.day}: ${day.title}`,`${day.minutes} minutes`,day.action,`Reflect: ${day.prompt}`);if(journal){day.journalPrompts.forEach((prompt,i)=>lines.push(`${i+1}. ${prompt}`,'________________________________________________________','________________________________________________________'));}lines.push('');});lines.push(r.mantra,'','A symbolic personality quiz for reflection and entertainment. Archetypes are creative themes, not claims about ancestry or the future.','This plan is original editorial content. No purchase is required.');return lines.join('\n');}
  function downloadText(text,filename){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Your download is ready.');}
  function printPlan(){document.querySelectorAll('.day-card').forEach(card=>card.open=true);document.body.classList.remove('print-journal');window.print();}
  async function copyPlan(){try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(planText(false));toast('Your seven-day plan was copied.');}catch{openDialog(`<p class="eyebrow">KEEP YOUR PLAN</p><h2 id="dialog-title">Copy your ritual plan</h2><p>Your browser does not allow clipboard access here. You can select the text below, or save the text file.</p><textarea id="copy-fallback" aria-label="Your ritual plan" readonly style="width:100%;height:260px;padding:14px;background:#0a201c;color:#f3f1e7;border:1px solid #4c6854;font:14px/1.6 system-ui">${escape(planText(false))}</textarea><div class="dialog-actions"><button class="button button-primary" id="fallback-download">Save text file</button></div>`);$('copy-fallback').select();$('fallback-download').addEventListener('click',()=>downloadText(planText(false),`starseed-${state.result.id}-7-day-plan.txt`));}}
  function openDialog(content){state.lastDialogFocus=document.activeElement;$('dialog-content').innerHTML=content;$('info-dialog').showModal();}
  function openMethod(){const r=state.result;openDialog(`<p class="eyebrow">A SYMBOLIC MATCH, EXPLAINED</p><h2 id="dialog-title">Made from your choices.</h2><p>The first two questions match your preferences to one of four creative archetypes: Pleiadian for connection, Sirian for rhythm, Arcturian for wonder, and Andromedan for freedom.</p><p>Your first answer carries more weight. If two themes tie, your first answer decides. The final two questions change your plan’s duration and optional product picks.</p>${r?`<p><strong>Your match:</strong> ${r.reason}</p>`:''}<p>These are original personality themes for reflection and entertainment. The quiz does not identify alien ancestry, read your mind, or predict events. There is no scientific or astronomical assessment behind the match.</p><p><strong>Privacy:</strong> Answers and completion marks stay in this tab and reset when you reload. No account, email collection, analytics, or payment is connected in this demo. Visiting a merchant opens that merchant’s own website and privacy policy.</p><p><strong>About the journal:</strong> $9 is a proposed launch price. Its complete preview and downloads are free in this demo. The physical Five Minute Journal is a separate optional merchant product.</p>`);}
  function openJournal(){const r=state.result;openDialog(`<p class="eyebrow">PROPOSED $9 DIGITAL JOURNAL · FREE DEMO PREVIEW</p><h2 id="dialog-title">A little more room to reflect.</h2><p>The complete seven-day journal is open below. Nothing is charged and no account is required.</p><div class="journal-preview-cover"><p class="eyebrow">STARSEED RITUALS</p><span style="font-size:38px" aria-hidden="true">${r.symbol}</span><h3>${r.title}</h3><p>A seven-day ritual journal</p></div><p>${r.summary}</p>${r.plan.map(day=>`<section class="journal-prompts"><p class="eyebrow">DAY ${day.day} · ${day.minutes} MINUTES</p><h3>${day.title}</h3><p>${day.action}</p><ol>${day.journalPrompts.map(prompt=>`<li>${prompt}<div class="writing-line"></div><div class="writing-line"></div></li>`).join('')}</ol></section>`).join('')}<div class="dialog-actions"><button class="button button-primary" id="save-journal">Save the full journal</button><button class="button button-secondary" id="print-journal">Print journal</button></div>`);$('save-journal').addEventListener('click',()=>downloadText(planText(true),`starseed-${r.id}-ritual-journal-demo.txt`));$('print-journal').addEventListener('click',()=>{document.body.classList.add('print-journal');window.print();});}
  let toastTimer;function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500);}
  $('start-quiz').addEventListener('click',startQuiz);
  $('quiz-restart').addEventListener('click',startQuiz);
  $('quiz-back').addEventListener('click',()=>{if(state.step>0){state.step--;renderQuestion();scrollTop();}else{showSection('intro');$('start-quiz').focus({preventScroll:true});}});
  $('about-button').addEventListener('click',openMethod);
  $('info-dialog').addEventListener('close',()=>{document.body.classList.remove('print-journal');if(state.lastDialogFocus?.isConnected)state.lastDialogFocus.focus({preventScroll:true});});
  $('info-dialog').addEventListener('click',event=>{const bounds=$('info-dialog').getBoundingClientRect();if(event.target===$('info-dialog')&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))$('info-dialog').close();});
  window.addEventListener('afterprint',()=>document.body.classList.remove('print-journal'));
})();
