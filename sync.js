// Boom Core shared tables.
// Gives the app the same `claude.use('db')` / `claude.use('user')` interface it had
// on the Claude-hosted page, backed by Firebase (Firestore + anonymous sign-in).
// A "table" is one game group: the Core Master starts it and gets a 6-letter code,
// players join with that code. Everything for a table lives under tables/{CODE}/.
// If firebase-config.js is not filled in, or the player picks Solo, the app runs solo.
(function(){
 const cfg=window.BOOM_FIREBASE||{};
 const configured=!!(cfg.apiKey&&!/YOUR_/i.test(cfg.apiKey)&&window.firebase);
 const LS='boomtable';
 const lsGet=()=>{try{return JSON.parse(localStorage.getItem(LS)||'null')}catch{return null}};
 const lsSet=v=>{try{v?localStorage.setItem(LS,JSON.stringify(v)):localStorage.removeItem(LS)}catch{}};
 const ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
 const newCode=()=>Array.from({length:6},()=>ABC[Math.floor(Math.random()*ABC.length)]).join('');
 const clean=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);

 const css=`#tgate{position:fixed;inset:0;z-index:30;background:var(--bg);overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:max(24px,env(safe-area-inset-top)) 16px 24px}
#tgate .gbox{width:100%;max-width:440px}#tgate h1{font-size:26px;margin:8px 0 4px}#tgate .gsub{color:var(--mute);margin:0 0 18px;font-size:14px}
#tgate .card{display:flex;flex-direction:column;gap:10px}#tgate .or{text-align:center;color:var(--mute);font-size:12px;font-weight:700;text-transform:uppercase;margin:4px 0 12px}
#tgate .gcode{text-transform:uppercase;letter-spacing:.2em;font-weight:700}#tgate .gerr{color:#dc2626;font-size:14px;min-height:18px}
#tbar{display:flex;align-items:center;gap:8px;justify-content:space-between;font-size:13px;color:var(--mute);margin:0 0 10px}#tbar b{color:var(--ink);letter-spacing:.12em}`;

 function gate(msg){
  return new Promise(res=>{
   if(!document.getElementById('tgcss')){const s=document.createElement('style');s.id='tgcss';s.textContent=css;document.head.append(s);}
   const saved=lsGet()||{};
   const w=document.createElement('div');w.id='tgate';
   w.innerHTML=`<div class="gbox"><h1>🎲 Boom Dice</h1><p class="gsub">Start a table for your group, or join one with the code your Core Master shares.</p>
<div class="card"><label for="gname">Your name</label><input id="gname" maxlength="40" placeholder="Name the party will see" autocomplete="nickname"></div>
<div class="card"><button id="gstart">Start a new table (I'm the Core Master)</button></div>
<div class="or">or</div>
<div class="card"><label for="gcode">Table code</label><div class="row"><input id="gcode" class="gcode" maxlength="6" placeholder="ABC123" autocapitalize="characters" autocomplete="off" spellcheck="false"><button id="gjoin">Join</button></div></div>
<div class="gerr" id="gerr"></div>
<div class="card"><button id="gsolo" class="ghost">Play solo on this device</button></div></div>`;
   document.body.append(w);
   const $g=s=>w.querySelector(s),err=$g('#gerr');
   $g('#gname').value=saved.name||'';$g('#gcode').value=saved.code||'';err.textContent=msg||'';
   const name=()=>{const n=$g('#gname').value.trim().slice(0,40);if(!n){err.textContent='Enter your name first.';$g('#gname').focus();}return n;};
   const done=v=>{w.remove();res(v);};
   $g('#gstart').onclick=()=>{const n=name();if(n)done({name:n,create:true});};
   $g('#gjoin').onclick=()=>{const n=name();if(!n)return;const c=clean($g('#gcode').value);if(c.length!==6){err.textContent='Table codes are 6 letters and numbers.';return;}done({name:n,code:c});};
   $g('#gcode').addEventListener('keydown',e=>{if(e.key==='Enter')$g('#gjoin').click();});
   $g('#gsolo').onclick=()=>done({solo:true});
  });
 }

 function bar(t){
  const add=()=>{const m=document.querySelector('main');if(!m||document.getElementById('tbar'))return;
   const b=document.createElement('div');b.id='tbar';
   const left=document.createElement('span'),btn=document.createElement('button');btn.className='ghost sm';
   if(t.solo){left.textContent='Playing solo on this device';btn.textContent=configured?'Join a table':'';btn.hidden=!configured;}
   else{left.append('Table ');const c=document.createElement('b');c.textContent=t.code;left.append(c,' · '+(t.owner?'Core Master':t.name));btn.textContent='Leave table';}
   btn.onclick=()=>{if(!t.solo&&!confirm('Leave this table on this device? You can rejoin with the code '+t.code+'.'))return;lsSet(t.solo?{name:''}:{name:t.name,code:''});location.reload();};
   b.append(left,btn);m.prepend(b);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
 }

 async function connect(){
  if(!configured){bar({solo:true});return null;}
  let saved=lsGet();
  if(saved&&saved.solo){bar({solo:true});return null;}
  firebase.initializeApp(cfg);
  const fs=firebase.firestore();
  try{fs.settings({ignoreUndefinedProperties:true});}catch{}
  const cred=await firebase.auth().signInAnonymously();
  const uid=cred.user.uid;
  let msg='';
  for(;;){
   let t=saved&&saved.code&&saved.name?{name:saved.name,code:saved.code}:await gate(msg);
   saved=null;
   if(t.solo){lsSet({solo:true});bar({solo:true});return null;}
   try{
    let ref,snap,owner;
    if(t.create){
     for(let i=0;i<5;i++){t.code=newCode();ref=fs.doc('tables/'+t.code);snap=await ref.get();if(!snap.exists)break;}
     await ref.set({owner:uid,ts:Date.now()});owner=uid;
    }else{
     ref=fs.doc('tables/'+t.code);snap=await ref.get();
     if(!snap.exists){msg='No table with the code '+t.code+'. Check it with your Core Master.';lsSet({name:t.name,code:''});continue;}
     owner=snap.data().owner;
    }
    await ref.collection('members').doc(uid).set({name:t.name,ts:Date.now()});
    lsSet({name:t.name,code:t.code});
    const info={fs,uid,code:t.code,name:t.name,owner:owner===uid,base:'tables/'+t.code+'/'};
    bar({code:t.code,name:t.name,owner:info.owner});
    return info;
   }catch(e){msg='Could not reach the table. Check your connection and try again.';}
  }
 }

 const ready=connect().catch(()=>null);
 window.claude={
  async use(what){
   const t=await ready;
   if(!t)throw new Error('solo');
   if(what==='db')return{collection:p=>t.fs.collection(t.base+p)};
   if(what==='user')return{
    id:async()=>t.uid,
    isOwner:async()=>t.owner,
    async profiles(ids){const out={};await Promise.all(ids.map(async id=>{try{const s=await t.fs.doc(t.base+'members/'+id).get();out[id]=s.exists?{name:s.data().name}:null;}catch{out[id]=null;}}));return out;}
   };
   throw new Error('unknown capability '+what);
  }
 };
})();
