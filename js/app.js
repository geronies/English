(()=>{'use strict';
const D=window.DATA,$=s=>document.querySelector(s),app=$('#app');
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
D.words=D.raw.trim().split('\n').map(r=>{const p=r.split('|');return{id:p[0],en:p[1],so:p[2],ipa:p[3],pic:p[4],ex:p[5],exSo:p[6],ch:p[0].split('-')[0]}});
const CH=Object.fromEntries(D.chapters.map(c=>[c.id,c]));
const lessons=c=>{const w=D.words.filter(x=>x.ch===c);return[w.slice(0,4),w.slice(4)]};
/* ---- Kaydka horumarka (localStorage; IndexedDB lama isticmaalin) ---- */
/* ---- Habka macallinka: arday kasta wuxuu leeyahay horumar gooni ah ---- */
let G={students:[],cur:'',slow:false,...JSON.parse(localStorage.getItem('eng-teacher')||'{}')};
const blank=n=>({id:'s'+Date.now()+Math.random().toString(36).slice(2,5),name:n,learned:[],fav:[],wrong:{},lessons:[],scores:[],day:{d:'',n:0}});
if(!G.students.length)G.students.push({...blank('Arday 1'),...JSON.parse(localStorage.getItem('eng-progress')||'{}')});
const act=()=>G.students.find(x=>x.id===G.cur)||G.students[0];
G.cur=act().id;let S=act();
const pts=s=>s.learned.length*10+s.lessons.length*20+s.scores.reduce((a,b)=>a+b,0)*5;
const avg=s=>s.scores.length?Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length*10)+'%':'–';
const lvl=s=>{const p=pts(s);return p<100?'Heer 1 – Bilow':p<300?'Heer 2 – Dhexe':'Heer 3 – Sare'};
const weak=s=>{const l=Object.entries(s.wrong).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>(D.words.find(w=>w.id===e[0])||{}).en).filter(Boolean);return l.length?`<br><small>Erayada u baahan caawin: ${l.join(', ')}</small>`:''};
const save=()=>{try{localStorage.setItem('eng-teacher',JSON.stringify(G))}catch(e){toast('Kaydinta ma suurtagalin.')}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2600)}
/* ---- Codka: duubis maxalli ah haddii jirto, haddii kale speechSynthesis ---- */
let cur=null;
function stop(){if('speechSynthesis' in window)speechSynthesis.cancel();if(cur){cur.pause();cur=null}}
function tts(text,onend){if(!('speechSynthesis' in window)){toast('Qalabkan codka kuma jiro. Isku day browser kale.');return}
 const u=new SpeechSynthesisUtterance(text),v=speechSynthesis.getVoices();u.lang='en-GB';
 const vv=v.find(x=>/^en[-_]GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang));if(vv)u.voice=vv;
 u.rate=G.slow?.6:.9;u.onend=onend;u.onerror=()=>toast('Codka ma shaqeynin. Hubi codka qalabkaaga.');speechSynthesis.speak(u)}
function say(text,id,onend){stop();const f=id&&D.audio[id];
 if(f){cur=new Audio(f);cur.playbackRate=G.slow?.7:1;cur.onended=onend;cur.play().catch(()=>tts(text,onend))}else tts(text,onend)}
/* ---- Qaybaha ---- */
const card=w=>`<article class="card readable"><div class="pic" role="img" aria-label="Sawir: ${w.en}">${w.pic}</div><div class="main">
<h3><button class="word" data-say="${w.en}" data-id="${w.id}">${w.en}</button> <button class="say" data-say="${w.en}" data-id="${w.id}" aria-label="Dhageyso ${w.en}">🔊</button></h3>
<p class="so">${w.so}</p><p class="ipa">/${w.ipa}/ <small>(IPA)</small></p>
<p class="ex"><button class="say sm" data-say="${w.ex}" aria-label="Dhageyso jumladda">🔊</button> ${w.ex}<br><span class="so">${w.exSo}</span></p>
<div class="row"><button data-fav="${w.id}" aria-pressed="${S.fav.includes(w.id)}">♥ Ku kaydi</button><button data-learn="${w.id}">${S.learned.includes(w.id)?'✔ Waa la bartay':'Waan baranay'}</button></div></div></article>`;
const sentRow=(en,so,id)=>`<div class="box readable"><button class="say sm" data-say="${en}" data-id="${id||''}" aria-label="Dhageyso jumladda">🔊</button> <b>${en}</b><br><span class="so">${so}</span></div>`;
const bar=(n,t)=>`<div class="bar" role="progressbar" aria-valuenow="${n}" aria-valuemax="${t}"><i style="width:${t?100*n/t:0}%"></i></div>`;
const chips=(cur,h)=>`<div class="chips"><a class="chip ${cur?'':'on'}" href="${h}">Dhammaan</a>${D.chapters.map(c=>`<a class="chip ${cur===c.id?'on':''}" href="${h}/${c.id}">${c.icon} ${c.so}</a>`).join('')}</div>`;
/* ---- Bogagga ---- */
const P={
'':()=>{const today=new Date().toDateString(),n=S.day.d===today?S.day.n:0,allL=D.chapters.flatMap(c=>[c.id+'.0',c.id+'.1']);
 const next=allL.find(l=>!S.lessons.includes(l));
 return`<h1>Soo dhawow! 👋</h1><p class="sub">Baro Ingiriisiga A1 – sawir, cod iyo Soomaali.</p>
 <div class="box"><b>Hadafka maanta:</b> ${n}/5 erey ${bar(Math.min(n,5),5)}<p>Erayo la bartay: <b>${S.learned.length}</b>/${D.words.length} · Casharro: <b>${S.lessons.length}</b>/${allL.length}</p>
 ${next?`<a class="btn pri" href="#/lesson/${next}">▶ Sii wad barashada</a>`:'<p class="fb">🎉 Hambalyo! Casharada oo dhan waad dhammaysay.</p>'}</div>
 <p><a class="btn" href="#/stories">📚 Sheekooyin</a> <a class="btn" href="#/students">👩‍🏫 Fasalka</a></p><h2>Cutubyada</h2><div class="grid">${D.chapters.map(c=>`<a href="#/chapter/${c.id}"><b>${c.icon}</b>${c.so}${bar(lessons(c.id).filter((_,i)=>S.lessons.includes(c.id+'.'+i)).length,2)}</a>`).join('')}</div>`},
chapter:id=>{const c=CH[id];return`<h1>${c.icon} ${c.so}</h1>${lessons(id).map((l,i)=>`<a class="box btn" style="display:block" href="#/lesson/${id}.${i}">${S.lessons.includes(id+'.'+i)?'✅':'📘'} Cashar ${i+1}: ${l.map(w=>w.pic).join(' ')} <small>(${l.length} erey)</small></a>`).join('')}`},
lesson:id=>{const[c,i]=id.split('.'),l=lessons(c)[i];if(!l)return P.err();return`<h1>${CH[c].icon} ${CH[c].so} – Cashar ${+i+1}</h1><p class="sub">Taabo erayga ama 🔊 si aad u dhageysato.</p>${l.map(card).join('')}
 <button class="btn pri" data-done="${id}">${S.lessons.includes(id)?'✔ Casharka waa la dhammeeyay':'Dhammee casharka'}</button> <a class="btn" href="#/chapter/${c}">← Cutubka</a>`},
words:(f,q)=>{q=q||'';const l=D.words.filter(w=>(!f||w.ch===f)&&(w.en+w.so).toLowerCase().includes(q.toLowerCase()));
 return`<h1>Erayada</h1><input type="search" id="q" placeholder="Raadi erey…" aria-label="Raadi erey" value="${q}">${chips(f,'#/words')}${l.map(card).join('')||'<p class="fb">Wax lagu helay ma jiraan. Isku day erey kale.</p>'}`},
sentences:f=>{const l=D.words.filter(w=>!f||w.ch===f);return`<h1>Jumlado</h1><p class="sub">${l.length} jumlo – taabo 🔊 si aad u dhageysato.</p>${chips(f,'#/sentences')}${l.map(w=>sentRow(w.ex,w.exSo)).join('')}`},
students:()=>{const l=[...G.students].sort((a,b)=>pts(b)-pts(a));
 return`<h1>👩‍🏫 Fasalka</h1><p class="sub">Ku dar arday kasta; horumarkiisa gooni ayaa loo kaydiyaa. Ardayda waxaa lagu kala sareeyaa dhibcaha (erey ×10, cashar ×20, layli ×5).</p>
 <div class="box"><input type="search" id="nm" placeholder="Magaca ardayga…" aria-label="Magaca ardayga"><p><button class="btn pri" data-add>+ Ku dar arday</button></p></div>
 ${l.map((s,i)=>`<div class="box"><b>${['🥇','🥈','🥉'][i]||(i+1)+'.'} ${s.name}</b> ${s.id===S.id?'✅ <small>(hadda wuu shaqaynayaa)</small>':''}<br><span class="so">${lvl(s)}</span> · Dhibco: <b>${pts(s)}</b><br>Erayo: ${s.learned.length} · Casharro: ${s.lessons.length} · Layli celcelis: ${avg(s)}${weak(s)}<div class="row"><button data-pick="${s.id}">Dooro</button><button data-del="${s.id}">Tirtir</button></div></div>`).join('')}
 <button class="btn" data-rep>📋 Koobi warbixinta fasalka</button>`},
stories:()=>`<h1>Sheekooyin</h1>${D.stories.map(s=>`<a class="box btn" style="display:block" href="#/story/${s.id}">📚 ${s.title}</a>`).join('')}`,
story:id=>{const s=D.stories.find(x=>x.id===id);if(!s)return P.err();return`<h1>${s.title}</h1><button class="btn pri" data-story="${s.id}">🔊 Dhageyso sheekada oo dhan</button>
 ${s.lines.map(l=>sentRow(l[0],l[1])).join('')}<p><b>Erayo muhiim ah:</b> ${s.key.join(', ')}</p><h2>Su'aalo</h2>${s.qs.map((q,i)=>`<div class="box"><b>${q.q}</b>${q.o.map(o=>`<button class="opt" data-q="${i}" data-o="${o}" data-s="${s.id}">${o}</button>`).join('')}<div class="fb" hidden></div></div>`).join('')}`},
practice:()=>{Q={i:0,s:0,items:shuffle(D.words).sort((a,b)=>(S.wrong[b.id]||0)-(S.wrong[a.id]||0)).slice(0,10)};Q.items=shuffle(Q.items);return qView()},
more:()=>`<h1>Dheeraad</h1><div class="box"><b>Dhibcaha layliga:</b> ${S.scores.slice(-5).map(x=>x+'/10').join(' · ')||'weli ma jiraan'}<p>Erayo kaydsan ♥: ${S.fav.length}</p></div>
 <div class="box"><label><input type="checkbox" id="slow" ${G.slow?'checked':''}> Codka gaabis (jaaban)</label></div>
 <div class="box"><b>Sidee loo rakibaa?</b><p>Android (Chrome): taabo ⋮ → <i>Add to Home screen / Install app</i>. iPhone (Safari): taabo Share → <i>Add to Home Screen</i>. Marka la rakibo, wuxuu shaqeeyaa iyadoo internet la'aan ah.</p></div>
 <div class="box"><b>Xusuusin:</b> codka waa ka ciyaarayaa qalabkaaga (speechSynthesis); duubisyo la keydiyay weli lama darin.</div>
 <button class="btn" data-reset>Tirtir xogta dhammaan ardayda</button>`,
err:()=>`<h1>Bogga lama helin</h1><a class="btn pri" href="#/">Ku noqo hoyga</a>`};
/* ---- Layliga ---- */
let Q;
function qView(){if(Q.i>=10){S.scores.push(Q.s);save();return`<h1>🎉 Layligii waa dhammaaday!</h1><p class="fb">Dhibcahaaga: ${Q.s}/10. Aad bay u fiicantahay – mar kasta waad sii wanaagsanaysaa!</p><a class="btn pri" href="#/practice" data-again>Mar kale ciyaar</a>`}
 const w=Q.items[Q.i],t=Q.i%3,o=shuffle([w,...shuffle(D.words.filter(x=>x.id!==w.id)).slice(0,2)]);
 const hd=[`<div class="pic big" role="img" aria-label="Sawir">${w.pic}</div>`,`<h2 style="text-align:center">${w.en}</h2>`,`<button class="say big" data-say="${w.en}" data-id="${w.id}" aria-label="Dhageyso">🔊</button>`][t];
 const qt=['Sawirkani waa maxay?','Dooro macnaha Soomaaliga:','Dhageyso oo dooro erayga:'][t];
 return`<h1>Layli ${Q.i+1}/10 · 👤 ${S.name}</h1>${bar(Q.i,10)}<p><b>${qt}</b></p>${hd}${o.map(x=>`<button class="opt" data-ans="${x.id}">${t==1?x.so:x.en}</button>`).join('')}<div class="fb" hidden></div>`}
/* ---- Router ---- */
function render(){stop();const[p,a,b]=location.hash.slice(2).split('/');const h=(P[p||'']||P.err);
 $('#who').textContent='👤 '+S.name;app.innerHTML=h(a,p==='words'?undefined:b);document.querySelectorAll('nav a').forEach(n=>n.classList.toggle('on',n.dataset.n===(p||'')));scrollTo(0,0)}
addEventListener('hashchange',render);
/* ---- Isku xidhka dhacdooyinka ---- */
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;const d=t.dataset;
 if(d.say)say(d.say,d.id);
 if(d.fav){S.fav=S.fav.includes(d.fav)?S.fav.filter(x=>x!==d.fav):[...S.fav,d.fav];save();t.setAttribute('aria-pressed',S.fav.includes(d.fav))}
 if(d.learn&&!S.learned.includes(d.learn)){S.learned.push(d.learn);const td=new Date().toDateString();if(S.day.d!==td)S.day={d:td,n:0};S.day.n++;save();t.textContent='✔ Waa la bartay';toast('Aad bay u fiicantahay! 🌟')}
 if(d.done){if(!S.lessons.includes(d.done))S.lessons.push(d.done);save();toast('Hambalyo! Casharka waad dhammaysay 🎉');location.hash='#/chapter/'+d.done.split('.')[0]}
 if(d.story){const s=D.stories.find(x=>x.id===d.story),ls=s.lines.map(l=>l[0]);stop();let i=0;(function n(){if(i<ls.length)tts(ls[i++],n)})()}
 if(d.q!==undefined){const s=D.stories.find(x=>x.id===d.s),q=s.qs[d.q],ok=d.o===q.a,f=t.parentElement.querySelector('.fb');f.hidden=false;f.textContent=ok?'Sax! Aad bay u fiicantahay! 🌟':`Waa ku dhowaatay! Jawaabta saxda ah waa "${q.a}". Mar kale isku day.`}
 if(d.ans){const w=Q.items[Q.i],ok=d.ans===w.id,f=app.querySelector('.fb');document.querySelectorAll('.opt').forEach(o=>{o.disabled=true;if(o.dataset.ans===w.id)o.classList.add('ok')});
  if(ok){Q.s++;S.wrong[w.id]=Math.max(0,(S.wrong[w.id]||0)-1)}else{t.classList.add('no');S.wrong[w.id]=(S.wrong[w.id]||0)+1}save();
  f.hidden=false;f.innerHTML=(ok?'Aad iyo aad u fiican! 🎉':`Waa ku dhowaatay! "${w.en}" = ${w.so}. Waad baran doontaa!`)+'<br><button class="btn pri" data-next>Xigta →</button>'}
 if(d.next){Q.i++;app.innerHTML=qView()}
 if('add' in d){const n=($('#nm').value||'').trim();if(!n){toast('Fadlan qor magaca ardayga.');return}const k=blank(n);G.students.push(k);G.cur=k.id;S=k;save();render();toast(n+' waa lagu daray ✔')}
 if(d.pick){G.cur=d.pick;S=act();save();render();toast('Arday: '+S.name)}
 if(d.del&&confirm('Ma hubtaa inaad tirtirto ardaygan iyo horumarkiisa?')){G.students=G.students.filter(x=>x.id!==d.del);if(!G.students.length)G.students.push(blank('Arday 1'));S=act();G.cur=S.id;save();render()}
 if('rep' in d){const t='Warbixinta fasalka\n'+[...G.students].sort((a,b)=>pts(b)-pts(a)).map((s,i)=>`${i+1}. ${s.name} – ${pts(s)} dhibco, ${s.learned.length} erey, ${s.lessons.length} cashar, layli ${avg(s)}`).join('\n');(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Warbixinta waa la koobiyay ✔')).catch(()=>toast('Koobiyeynta lama oggola.'))}
 if('again' in d){e.preventDefault();render()}
 if('reset' in d&&confirm('Ma hubtaa inaad tirtirto xogta DHAMMAAN ardayda?')){localStorage.removeItem('eng-progress');localStorage.removeItem('eng-teacher');location.reload()}});
document.addEventListener('input',e=>{if(e.target.id==='q'){const[,f]=location.hash.slice(2).split('/');const v=e.target.value;app.innerHTML=P.words(f,v);const i=$('#q');i.focus();i.setSelectionRange(v.length,v.length)}
 if(e.target.id==='slow'){G.slow=e.target.checked;save()}});
/* ---- Qalabka xulashada qoraalka ---- */
const tb=$('#tb');let area=null;
function sel(){const s=getSelection(),t=s.toString().trim(),el=s.anchorNode&&(s.anchorNode.parentElement||s.anchorNode),a=el&&el.closest&&el.closest('.readable');
 if(!t||!a){tb.hidden=true;return}area=a;const r=s.getRangeAt(0).getBoundingClientRect();tb.hidden=false;
 tb.style.top=Math.min(innerHeight-60,r.bottom+8)+'px';tb.style.left=Math.max(4,Math.min(innerWidth-tb.offsetWidth-4,r.left))+'px'}
document.addEventListener('selectionchange',()=>setTimeout(sel,80));
tb.addEventListener('mousedown',e=>e.preventDefault());
tb.addEventListener('click',e=>{const a=e.target.dataset.a,s=getSelection(),t=s.toString().trim();
 if(a==='say'&&t)say(t);
 if(a==='copy'&&t)(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('La koobiyay ✔')).catch(()=>toast('Koobiyeynta lama oggola. Isticmaal koobi gacanta.'));
 if(a==='all'&&area){const r=document.createRange();r.selectNodeContents(area);s.removeAllRanges();s.addRange(r)}});
/* ---- Xiriirka, rakibaadda, offline ---- */
const net=()=>{$('#net').textContent=navigator.onLine?'● Online':'○ Offline';$('#net').style.color=navigator.onLine?'#7dffa8':'#ffd27d'};
addEventListener('online',net);addEventListener('offline',net);net();
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').hidden=false});
$('#inst').onclick=()=>{if(dp){dp.prompt();dp=null;$('#inst').hidden=true}};
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>toast('Offline ma diyaarsana.')));
render();
})();
