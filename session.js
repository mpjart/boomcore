// Boom session tools: print a character sheet, and let the Core Master export the table to a file
// and import it later (on this device or another). Encounters (monsters + map) can travel on their own.
// Uses the main script's globals: db, isDM, chars, calc, eff, bonus, arm, wpn, bothOk, slotItem, atks, conds,
// coinsOf, lootList, lootVal, fmtN, LT, STATS, EQ, BT, MAGT, magFlat, skin, SKINS, toast, el, btn, $.
(function(){
const ALL=['party','monsters','init','settings','boxes','stash','colors','handouts','records','map','mapstrokes','maptokens','rolls'];
const ENC=['monsters','map','mapstrokes','maptokens'];
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sg=n=>n>0?'+'+n:n<0?String(n):'';

/* ---------- print a character sheet ---------- */
window.printSheet=function(c){
 const k=calc(c),A=arm(c),cs=coinsOf(c),loot=lootList(c),list=atks(c),cd=conds(c);
 const stats=STATS.map(([key,lab])=>{const b=bonus(c,key);return `<div class="st"><small>${esc(lab)}</small><b>${c[key]}${b>0?` <i>+${b}</i>`:''}</b></div>`;}).join('');
 const rows=[];
 for(const p of['w','w2']){if(!((c[p+'N']||'').trim()||slotItem(c,p)))continue;const w=wpn(c,k,p);rows.push([(c[p+'N']||'').trim()||'Weapon',(w.t==='m'?'Magical':'Physical')+' · '+w.h+(w.h>1?' hands':' hand')+' · '+(w.r==='r'?'ranged':'touch'),w.ex]);}
 if(bothOk(c)){const a=wpn(c,k,'w'),b=wpn(c,k,'w2');rows.push(['Both hands','One attack with both weapons',(a.n+b.n)+'d'+a.die+sg(a.bn)]);}
 list.forEach(a=>{const bo=a.t==='p'?k.pd:a.t==='m'?k.md:eff(c,BT[a.t]||'str');rows.push([a.n,'Ability · T'+(a.r||1),a.e+sg(bo)]);});
 const gear=EQ.map(([p,lab])=>{const nm=(c[p+'N']||'').trim()||((slotItem(c,p)||{}).n)||'';let v='';
  if(p==='a'||p==='g')v=nm?(c[p+'V']||'0')+' '+(c[p+'T']==='m'?'magical':'physical')+' armor':'';
  else if(p==='m'||p==='m2'){const t=(MAGT.find(x=>x[0]===(c[p+'T']||'m'))||['',''])[1];v=nm?((c[p+'V']||'')+' '+t).trim():'';}
  else if(nm)v=wpn(c,k,p).ex;
  return `<tr><th>${esc(lab)}</th><td>${esc(nm)||'<span class="mute">empty</span>'}</td><td>${esc(v)}</td></tr>`;}).join('');
 const coins=LT.map((n,i)=>cs[i]?`<span>${fmtN(cs[i])} ${esc(n)}</span>`:'').filter(Boolean).join(' · ')||'0 coins';
 const lootHtml=loot.length?loot.map(it=>`<li>${esc(it.k==='reagent'?'Sellable reagents':it.n)}${it.k==='core'&&it.q>1?' × '+it.q:''}${it.k==='reagent'?': '+esc(it.tot.map((x,i)=>x?fmtN(x)+' '+LT[i]:'').filter(Boolean).join(' · ')):''}</li>`).join(''):'<li class="mute">Nothing yet</li>';
 const cur=Math.max(0,Math.min(k.hp,c.hpCur==null?k.hp:c.hpCur));
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.name||'Hero')} · Boom character sheet</title><style>
 @page{size:letter;margin:12mm}*{box-sizing:border-box}body{font:12pt/1.35 Georgia,serif;color:#111;margin:0}
 h1{font:700 24pt/1 Georgia,serif;margin:0}.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #111;padding-bottom:6px;margin-bottom:10px}
 .brand{font:700 11pt system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase}.mute{color:#777}
 .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:8px 0}.st,.box{border:1.5px solid #111;border-radius:6px;padding:6px;text-align:center}
 .st small,.box small{display:block;font:600 8pt system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#444}.st b,.box b{font-size:18pt}.st i{font-style:normal;font-size:11pt}
 .boxes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.write{height:22px;border-bottom:1px solid #999;margin-top:4px}
 h2{font:700 10pt system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em;border-bottom:1.5px solid #111;margin:14px 0 6px;padding-bottom:2px}
 table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:4px 6px;border-bottom:1px solid #ccc;vertical-align:top}th{width:24%;font:600 9pt system-ui,sans-serif}td:last-child{text-align:right;font-weight:700;white-space:nowrap}
 ul{margin:0;padding-left:18px}.notes{white-space:pre-wrap;border:1px solid #ccc;border-radius:6px;padding:8px;min-height:60px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
 .foot{margin-top:14px;font:9pt system-ui,sans-serif;color:#555}
 </style></head><body>
 <div class="top"><div><div class="brand">Boom · Beyond Our Own Maximum</div><h1>${esc(c.name||'Unnamed')}</h1></div><div style="text-align:right"><b style="font-size:18pt">Level ${c.level}</b>${c.dead?'<div>Dead</div>':''}</div></div>
 <div class="boxes">
  <div class="box"><small>HP</small><b>${cur} / ${k.hp}</b>${c.temp?`<div>+${c.temp} temp</div>`:''}</div>
  <div class="box"><small>Armor</small><b>${A.p+A.m}</b><div>${A.p} phys · ${A.m} mag</div></div>
  <div class="box"><small>Move</small><b>${k.mv}</b><div>steps</div></div>
  <div class="box"><small>Actions</small><b>${k.na}</b><div>per turn</div></div>
  <div class="box"><small>Initiative</small><b>d20${sg(eff(c,'spd'))}</b></div>
  <div class="box"><small>Phys dmg</small><b>${sg(k.pd)||'0'}</b></div>
  <div class="box"><small>Magic dmg</small><b>${sg(k.md)||'0'}</b></div>
  <div class="box"><small>Ability slots</small><b>${list.length} / ${k.slots}</b></div>
 </div>
 <div class="grid">${stats}</div>
 <div class="mute" style="font:9pt system-ui,sans-serif">A stat roll is one d6 per point (0 points: 1d6 that doesn't explode). d6 and smaller explode on a 1.</div>
 <h2>Attacks and abilities</h2><table>${rows.length?rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join(''):'<tr><td class="mute">None yet</td></tr>'}</table>
 <h2>Gear</h2><table>${gear}</table>
 <div class="cols"><div><h2>Coins</h2><div>${coins}</div><h2>Conditions</h2><div>${cd.length?esc(cd.join(', ')):'<span class="mute">None</span>'}</div></div><div><h2>Loot</h2><ul>${lootHtml}</ul></div></div>
 <h2>Notes</h2><div class="notes">${esc(c.notes||'')}</div>
 <div class="foot">Printed from Boom Dice · ${new Date().toLocaleDateString()}</div>
 </body></html>`;
 const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
 f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch{toast('Could not open the print dialog.');}setTimeout(()=>f.remove(),60000);};
 f.srcdoc=html;document.body.append(f);};

/* ---------- export / import (Core Master) ---------- */
async function readCol(name){const s=await db.collection(name).get();const o={};s.docs.forEach(d=>{o[d.id]=d.data();});return o;}
async function exportFile(kind){
 if(!db||!isDM)return toast('Only the Core Master can export.');
 const st=$('#savestat');st.textContent='Gathering the table…';
 try{
  const cols=kind==='encounter'?ENC:ALL,data={};
  for(const c of cols)data[c]=await readCol(c);
  if(kind==='encounter'){const keep={};Object.entries(data.maptokens).forEach(([id,t])=>{if(t.kind!=='hero')keep[id]=t;});data.maptokens=keep;}
  const file={app:'boom',v:1,kind,ts:Date.now(),skin:typeof skin==='string'?skin:'core',data};
  const blob=new Blob([JSON.stringify(file)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  const d=new Date(),stamp=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  a.href=url;a.download='boom-'+kind+'-'+stamp+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  st.textContent='Saved '+summary(file)+'.';
 }catch(e){st.textContent='Could not export: '+((e&&e.message)||'unknown error')+'.';}}
function summary(f){const d=f.data||{},n=x=>Object.keys(d[x]||{}).length,parts=[];
 if(n('party'))parts.push(n('party')+' hero'+(n('party')>1?'es':''));
 if(n('monsters'))parts.push(n('monsters')+' monster'+(n('monsters')>1?'s':''));
 if(n('mapstrokes')||n('maptokens')||(d.map&&d.map.bg&&d.map.bg.img))parts.push('a map ('+n('mapstrokes')+' chalk lines, '+n('maptokens')+' tokens'+(d.map&&d.map.bg&&d.map.bg.img?', image':'')+')');
 if(n('boxes'))parts.push(n('boxes')+' loot box'+(n('boxes')>1?'es':''));
 if(n('handouts'))parts.push(n('handouts')+' handout'+(n('handouts')>1?'s':''));
 if(n('rolls'))parts.push(n('rolls')+' rolls');
 return parts.length?parts.join(', '):'an empty table';}
async function clearCol(name,keep){const s=await db.collection(name).get();for(const d of s.docs){if(keep&&keep(d))continue;await db.collection(name).doc(d.id).delete();}}
async function writeCol(name,docs){const e=Object.entries(docs||{});for(let i=0;i<e.length;i+=20)await Promise.all(e.slice(i,i+20).map(([id,v])=>db.collection(name).doc(id).set(v)));}
let pending=null,armed='';
async function doImport(mode){
 const f=pending;if(!f)return;const st=$('#savestat');
 if(armed!==mode){armed=mode;renderSave();setTimeout(()=>{if(armed===mode){armed='';renderSave();}},4000);return;}
 armed='';st.textContent='Importing…';renderSave(true);
 try{
  if(mode==='session'){
   for(const c of ALL){await clearCol(c);await writeCol(c,f.data[c]);}
   st.textContent='Loaded '+summary(f)+'. Players at this table see it now.';
  }else{
   const heroIds=new Set(chars.map(c=>c.id));
   await clearCol('mapstrokes');await clearCol('maptokens',d=>d.data().kind==='hero');
   await writeCol('map',f.data.map);await writeCol('mapstrokes',f.data.mapstrokes);
   const toks={};Object.entries(f.data.maptokens||{}).forEach(([id,t])=>{if(t.kind!=='hero'||heroIds.has(t.ref))toks[id]=t;});
   await writeCol('maptokens',toks);await writeCol('monsters',f.data.monsters);
   st.textContent='Added the encounter: '+summary({data:{monsters:f.data.monsters,map:f.data.map,mapstrokes:f.data.mapstrokes,maptokens:toks}})+'. Your party was kept.';
  }
  pending=null;
 }catch(e){st.textContent='Import stopped partway: '+((e&&e.message)||'unknown error')+'. Try again.';}
 renderSave();}
function readFile(file){
 const st=$('#savestat');if(!file)return;
 const r=new FileReader();r.onload=()=>{try{const f=JSON.parse(r.result);if(!f||f.app!=='boom'||!f.data)throw 0;pending=f;armed='';
   st.textContent='Ready to import '+summary(f)+' ('+(f.kind==='encounter'?'an encounter file':'a full session')+', saved '+new Date(f.ts).toLocaleString()+').';renderSave();}
  catch{pending=null;st.textContent='That file is not a Boom export. Pick a .json file made with Export.';renderSave();}};
 r.onerror=()=>{st.textContent='Could not read that file.';};r.readAsText(file);}
function renderSave(busy){
 const box=$('#savebox');if(!box)return;const acts=$('#saveacts');acts.replaceChildren();
 if(!pending)return;
 const hasParty=Object.keys(pending.data.party||{}).length>0,isEnc=pending.kind==='encounter'||!hasParty;
 const enc=btn(armed==='encounter'?'Tap again to add it':'Add encounter only',()=>doImport('encounter'),armed==='encounter'?'dmg':'rb');
 enc.title='Adds its monsters and map. Keeps your party, loot, and everything else.';enc.disabled=!!busy;acts.append(enc);
 if(!isEnc){const s=btn(armed==='session'?'Tap again: this replaces the whole table':'Replace the whole table',()=>doImport('session'),armed==='session'?'dmg':'ghost');s.disabled=!!busy;acts.append(s);}
 acts.append(btn('Cancel',()=>{pending=null;armed='';$('#savestat').textContent='';renderSave();},'ghost'));}
window.saveInit=function(){
 const box=$('#savebox');if(!box)return;
 $('#savexs').onclick=()=>exportFile('session');$('#savexe').onclick=()=>exportFile('encounter');
 $('#savefile').onchange=e=>{readFile(e.target.files[0]);e.target.value='';};};
window.saveInit();
})();
