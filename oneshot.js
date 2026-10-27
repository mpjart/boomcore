// Boom One-shots: the CM picks a one-shot kit and drops its monsters, fights, and loot boxes into the table.
// Kits come from oneshots.js, built by tools/build_oneshots.py from docs/oneshots/*.md, so a new adventure
// shows up here as soon as its Markdown is added and the build is run.
// Uses the main script's globals: $, el, btn, toast, logEvent, isDM, monCol, boxCol, chars, living, avgLvl, shared,
// openLoot, lootTabs, LT, monHp, cmShow, renderMon.
(function(){
const CSS=`
#kitbox select{font:inherit;font-size:15px;padding:9px 10px;border-radius:var(--rb);border:1px solid var(--line);background:var(--bg);color:var(--ink);flex:1}
#kitbox .kact{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}
#kitbox details{border-top:1px solid var(--line);padding:6px 0}#kitbox details>summary{cursor:pointer;font-weight:700;padding:4px 0}
#kitbox .ksc{margin:6px 0 10px 4px}#kitbox .ksc>b{display:block;font-size:14px;margin-bottom:4px}
#kitbox .krow{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px dashed var(--line)}
#kitbox .krow span{font-size:14px}#kitbox .krow small{color:var(--mute);display:block;font-size:12px}
#kitbox .kmons{display:flex;flex-wrap:wrap;gap:6px}#kitbox .kmons button{background:var(--chip);color:var(--ink);font-weight:600;font-size:13px;padding:5px 10px}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
let kitId='',size=0;try{kitId=localStorage.getItem('boomkit')||'';}catch{}
const kits=()=>window.BOOM_ONESHOTS||[];
const kit=()=>kits().find(k=>k.id===kitId)||kits()[0]||null;
const partySize=()=>size||Math.max(3,Math.min(4,living().length||4));
function sizesOf(f){return Object.keys(f.by).map(Number).sort((a,b)=>a-b);}
function pickSize(f){const s=sizesOf(f),n=partySize();return s.includes(n)?n:(n<s[0]?s[0]:s[s.length-1]);}
// a monster card from the kit's stat block; armor follows Chapter 9 (minion 0, standard level/5, boss level/3)
function monDoc(d,name){const L=d.level;
 return{name,level:L,kind:d.kind,rarity:d.rarity,con:d.con,str:d.str,int:d.int,spd:d.spd,cha:d.cha,lck:d.lck,
  armor:d.kind==='minion'?0:d.kind==='boss'?Math.floor(L/3):Math.floor(L/5),hpCur:null,abil:JSON.stringify(d.abil||[]),
  ...(d.mel!=null?{mel:d.mel}:{}),...(d.rng!=null?{rng:d.rng}:{}),...(d.note?{note:d.note}:{}),...(d.solo?{solo:true}:{}),ts:Date.now()};}
async function addMon(k,name,n,quiet){
 if(!monCol){toast('Start a table as the Core Master to add monsters');return 0;}
 const d=k.monsters[name];if(!d)return 0;
 for(let i=1;i<=n;i++){const id='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  await monCol.doc(id).set(monDoc(d,n>1?name+' '+i:name)).catch(()=>{});}
 if(!quiet)toast('Added '+(n>1?n+' × ':'')+name);return n;}
async function addFight(k,f){const n=pickSize(f),list=f.by[n]||[];let tot=0;
 for(const[nm,c]of list)tot+=await addMon(k,nm,c,true);
 if(tot){const m='👹 '+f.t+': '+list.map(([nm,c])=>c>1?c+' '+nm+'s':nm).join(', ')+' (for '+n+' heroes)';toast(m);logEvent(m);cmShow('mon');}}
async function makeBox(k,b){
 const to=b.for==='party'?'party':b.for==='stash'?'stash':'hero',heroes=living();
 if(to==='hero'&&!heroes.length)return toast('Add heroes in the Party tab first');
 const tabs=[...(typeof lootTabs!=='undefined'?lootTabs:['fantasy'])];
 if(!shared()){
  if(to==='hero'){for(const h of heroes)await openLoot({to,hero:h.id,L:b.L,t0:b.t0,l:h.level,tabs},'Opened by '+(h.name||'a hero'));}
  else await openLoot({to,L:b.L,t0:b.t0,l:avgLvl(),tabs},'');
  return;}
 const mk=async(x)=>{try{await boxCol.doc('b'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)).set(x);}catch{toast('Could not make the box. Try again.');}};
 const base={L:b.L,t0:b.t0,note:b.note||'',tabs,st:'ready',hands:{},ts:Date.now()};
 if(to==='hero'){for(const h of heroes)await mk({...base,to,hero:h.id,heroName:h.name||''});}
 else await mk({...base,to,hero:'',heroName:'',secs:30,until:Date.now()+30000});
 const who=to==='party'?'the whole party':to==='stash'?'the party stash':'each hero';
 logEvent('🎁 '+(to==='hero'?heroes.length+' ':'A ')+'T'+(b.t0+1)+' '+LT[b.t0]+' loot box'+(to==='hero'&&heroes.length>1?'es are':' is')+' waiting for '+who+(b.note?' ('+b.note+')':'')+(to==='hero'?'. Open them in the Loot tab.':'. Grab it in the Loot tab within 30 sec!'));
 toast('Loot box made for '+who);}
function render(){const w=$('#kitbox');if(!w)return;w.replaceChildren();
 w.append(el('b','pn','One-shots'));
 const all=kits();if(!all.length){w.append(el('div','note','No one-shot kits found. Reload the page.'));return;}
 const k=kit();
 w.append(el('div','note','Pick an adventure, and its monsters, fights, and loot boxes are one tap away. Fights add monsters to the Monsters list; loot boxes wait in the Loot tab like any other box.'));
 const r=el('div','row cmsel');r.style.marginTop='8px';
 const ks=document.createElement('select');ks.className='colsel';ks.setAttribute('aria-label','One-shot');all.forEach(x=>ks.add(new Option(x.title,x.id)));ks.value=k.id;
 ks.onchange=()=>{kitId=ks.value;try{localStorage.setItem('boomkit',kitId)}catch{}render();};
 const ps=document.createElement('select');ps.className='colsel';ps.setAttribute('aria-label','Party size');ps.style.flex='0 0 auto';
 [3,4].forEach(n=>ps.add(new Option(n+' heroes',n)));ps.value=String(partySize());ps.onchange=()=>{size=+ps.value;render();};
 r.append(ks,ps);w.append(r);
 const info=el('div','kact');info.append(el('small','note',[k.levels&&'Levels '+k.levels,k.heroes&&k.heroes+' heroes'].filter(Boolean).join(' · ')));
 if(k.pdf){const a=document.createElement('a');a.href=k.pdf;a.target='_blank';a.rel='noopener';a.className='ghost sm cmact';a.textContent='📄 Read the adventure';info.append(a);}
 w.append(info);
 if(!isDM||!monCol)w.append(el('div','note','Start a table as the Core Master (or Play solo) to add monsters.'));
 k.parts.forEach((p,pi)=>{const d=document.createElement('details');const key='boomkitopen:'+k.id+':'+pi;try{d.open=localStorage.getItem(key)==='1';}catch{}
  d.addEventListener('toggle',()=>{try{localStorage.setItem(key,d.open?'1':'0')}catch{}});
  const s=document.createElement('summary');s.textContent=p.t;d.append(s);
  p.scenes.forEach(sc=>{const b=el('div','ksc');b.append(el('b',null,sc.t));
   sc.fights.forEach(f=>{const n=pickSize(f),row=el('div','krow'),t=el('span',null,'👹 '+f.t);t.append(el('small',null,(f.by[n]||[]).map(([nm,c])=>c+' × '+nm).join(', ')+' · for '+n+' heroes'));
    row.append(t,btn('Add fight',()=>addFight(k,f),'sm rb'));b.append(row);});
   sc.loot.forEach(x=>{const row=el('div','krow'),t=el('span',null,'🎁 T'+(x.t0+1)+' '+LT[x.t0]+' box');
    t.append(el('small',null,(x.for==='each'?'One for each hero':x.for==='party'?'Party loot: everyone gets a copy':'Into the party stash')+' · level '+x.L+' monster'+(x.note?' · '+x.note:'')));
    row.append(t,btn('Make box',()=>makeBox(k,x),'sm heal'));b.append(row);});
   d.append(b);});
  w.append(d);});
 const md=document.createElement('details');const ms=document.createElement('summary');ms.textContent='Every monster in this adventure';md.append(ms);
 const mm=el('div','kmons');Object.values(k.monsters).forEach(m=>{const hp=monHp({...m});mm.append(btn('＋ '+m.name+' · Lv '+m.level+' '+m.kind+' · HP '+hp,()=>addMon(k,m.name,1)));});
 md.append(mm);w.append(md);}
window.kitRefresh=render;
render();
})();
