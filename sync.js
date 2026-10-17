// Boom Core shared tables.
// Gives the app the same `claude.use('db')` / `claude.use('user')` interface it had
// on the Claude-hosted page, backed by Firebase (Firestore + anonymous sign-in).
// A "table" is one game group: the Core Master starts it and gets a 6-letter code,
// players join with that code. Everything for a table lives under tables/{CODE}/.
// Play solo (or no Firebase): the same interface runs on a local database saved on this
// device, and the player is the Core Master of a private table nobody else can join.
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


 // ---------- solo: a tiny local stand-in for Firestore, saved in localStorage ----------
 function localDb(){
  const KEY='boomsolo',subs=new Set(),clone=v=>v===undefined?v:JSON.parse(JSON.stringify(v));
  let mem=null,queued=false;
  const load=()=>{if(!mem){try{mem=JSON.parse(localStorage.getItem(KEY)||'null')}catch{mem=null}
   if(!mem){mem={};seed(mem);}}return mem;};
  // first run: bring over quick rolls and color saved by the old solo mode
  function seed(d){try{const q=JSON.parse(localStorage.getItem('boomq')||'[]');(Array.isArray(q)?q:[]).forEach((x,i)=>{if(x&&x.expr)d['data/users/solo/'+(x.id&&/^q/.test(x.id)?x.id:'q'+Date.now()+i)]={label:x.label||'',expr:x.expr,ts:x.ts||Date.now()+i};});
   const c=localStorage.getItem('boomcol');if(c)d['colors/solo']={c};}catch{}}
  const fire=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;subs.forEach(f=>f());},0);};
  const commit=()=>{const d=load(),r=Object.keys(d).filter(k=>/^rolls\/[^/]+$/.test(k)).sort((a,b)=>(d[b].ts||0)-(d[a].ts||0));r.slice(150).forEach(k=>delete d[k]);
   try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}fire();};
  addEventListener('storage',e=>{if(e.key===KEY){mem=null;fire();}});
  const put=(o,path,v)=>{const ps=path.split('.');while(ps.length>1){const q=ps.shift();if(typeof o[q]!=='object'||!o[q])o[q]={};o=o[q];}if(v===undefined)delete o[ps[0]];else o[ps[0]]=clone(v);};
  function docref(k){const id=k.split('/').pop();return{id,_k:k,
   set:async v=>{load()[k]=clone(v)||{};commit();},
   update:async p=>{const d=load();if(!d[k])throw{code:'not-found'};for(const[f,v]of Object.entries(p))put(d[k],f,v);commit();},
   delete:async()=>{delete load()[k];commit();},
   get:async()=>{const d=load();return{id,exists:k in d,data:()=>clone(d[k])};}};}
  function col(path,ord,dir,lim){const pre=path+'/';
   const docs=()=>{const d=load();let l=Object.keys(d).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),v:d[k]}));
    if(ord)l.sort((a,b)=>{const x=a.v[ord],y=b.v[ord];return(x>y?1:x<y?-1:0)*(dir==='desc'?-1:1);});if(lim)l=l.slice(0,lim);
    return l.map(x=>({id:x.id,exists:true,data:()=>clone(x.v)}));};
   return{doc:id=>docref(pre+id),orderBy:(f,dr)=>col(path,f,dr||'asc',lim),limit:n=>col(path,ord,dir,n),
    async get(){const ds=docs();return{docs:ds,empty:!ds.length,size:ds.length};},
    onSnapshot(cb){let prev=new Map(),live=true;
     const run=()=>{if(!live)return;const ds=docs(),now=new Map(ds.map(x=>[x.id,JSON.stringify(x.data())])),ch=[];
      ds.forEach(x=>{if(!prev.has(x.id))ch.push({type:'added',doc:x});else if(prev.get(x.id)!==now.get(x.id))ch.push({type:'modified',doc:x});});
      prev.forEach((_,id)=>{if(!now.has(id))ch.push({type:'removed',doc:{id,exists:false,data:()=>undefined}});});
      prev=now;try{cb({docs:ds,empty:!ds.length,size:ds.length,docChanges:()=>ch});}catch(e){console.error(e);}};
     subs.add(run);setTimeout(run,0);return()=>{live=false;subs.delete(run);};}};}
  return{collection:p=>col(p),tx:async fn=>fn({get:r=>r.get(),set:(r,v)=>r.set(v),update:(r,p)=>r.update(p),delete:r=>r.delete()})};
 }
 let soloDb=null;
 const solo=()=>({solo:true,db:soloDb||(soloDb=localDb())});

 function gate(msg){
  return new Promise(res=>{
   if(!document.getElementById('tgcss')){const s=document.createElement('style');s.id='tgcss';s.textContent=css;document.head.append(s);}
   const saved=lsGet()||{};
   const w=document.createElement('div');w.id='tgate';
   w.innerHTML=`<div class="gbox"><h1 class="glogo">Boom Dice</h1><p class="gsub">Start a table for your group, or join one with the code your Core Master shares.</p>
<div class="card"><label for="gname">Your name</label><input id="gname" maxlength="40" placeholder="Name the party will see" autocomplete="nickname"></div>
<div class="card"><button id="gstart">Start a new table (I'm the Core Master)</button></div>
<div class="or">or</div>
<div class="card"><label for="gcode">Table code</label><div class="row"><input id="gcode" class="gcode" maxlength="6" placeholder="ABC123" autocapitalize="characters" autocomplete="off" spellcheck="false"><button id="gjoin">Join</button></div></div>
<div class="gerr" id="gerr"></div>
<div class="card"><button id="gsolo" class="ghost">Play solo on this device</button><div class="gsub" style="margin:0">You're the Core Master of a private table saved on this device: party, loot, monsters, and themes, with no code to share.</div></div></div>`;
   document.body.append(w);
   {const lg=document.querySelector('.brand .bw'),h=w.querySelector('.glogo');if(lg&&h){h.textContent='';const c=lg.cloneNode(true);c.style.cssText='height:72px;width:auto;display:block';h.append(c);}}
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
  const add=()=>{const m=document.querySelector('main');if(!m)return;const old=document.getElementById('tbar');if(old)old.remove();
   const b=document.createElement('div');b.id='tbar';
   const left=document.createElement('span'),btn=document.createElement('button');btn.className='ghost sm';
   if(t.wait){left.textContent=t.wait;btn.hidden=true;}
   else if(t.solo){left.textContent=t.why?'Solo · '+t.why:'Solo · your private table on this device';btn.textContent=t.why?'Try again':'Join a table';btn.hidden=!configured&&!t.why;}
   else{left.append('Table ');const c=document.createElement('b');c.textContent=t.code;left.append(c,' · '+(t.owner?'Core Master':t.name));btn.textContent='Leave table';}
   btn.onclick=()=>{if(t.why){location.reload();return;}if(!t.solo&&!confirm('Leave this table on this device? You can rejoin with the code '+t.code+'.'))return;lsSet(t.solo?{name:''}:{name:t.name,code:''});location.reload();};
   b.append(left,btn);m.prepend(b);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
 }

 async function connect(){
  if(!configured){bar({solo:true,why:window.firebase?'shared tables are not set up':'could not load Firebase (check the connection or a content blocker)'});return solo();}
  let saved=lsGet();
  if(saved&&saved.solo){bar({solo:true});return solo();}
  firebase.initializeApp(cfg);
  const fs=firebase.firestore();
  try{fs.settings({ignoreUndefinedProperties:true});}catch{}
  let cred;try{cred=await firebase.auth().signInAnonymously();}
  catch(e){const c=(e&&e.code)||'';bar({solo:true,why:/operation-not-allowed|admin-restricted/.test(c)?'Anonymous sign-in is off in Firebase':'could not sign in ('+(c||'network')+')'});return solo();}
  const uid=cred.user.uid;
  let msg='';
  for(;;){
   let t=saved&&saved.code&&saved.name?{name:saved.name,code:saved.code}:await gate(msg);
   saved=null;
   if(t.solo){lsSet({solo:true});bar({solo:true});return solo();}
   bar({wait:'Connecting to the table…'});
   const T=p=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r({code:'timeout'}),12000))]);
   try{
    let ref,snap,owner;
    if(t.create){
     for(let i=0;i<5;i++){t.code=newCode();ref=fs.doc('tables/'+t.code);snap=await T(ref.get());if(!snap.exists)break;}
     await T(ref.set({owner:uid,ts:Date.now()}));owner=uid;
    }else{
     ref=fs.doc('tables/'+t.code);snap=await T(ref.get());
     if(!snap.exists){msg='No table with the code '+t.code+'. Check it with your Core Master.';lsSet({name:t.name,code:''});continue;}
     owner=snap.data().owner;
    }
    await T(ref.collection('members').doc(uid).set({name:t.name,ts:Date.now()}));
    lsSet({name:t.name,code:t.code});
    const info={fs,uid,code:t.code,name:t.name,owner:owner===uid,base:'tables/'+t.code+'/'};
    bar({code:t.code,name:t.name,owner:info.owner});
    return info;
   }catch(e){const c=(e&&e.code)||'';msg=c==='permission-denied'?'The database rules are blocking this. Publish firestore.rules in Firebase (SETUP.md step 3).':/timeout|not-found|unavailable|failed-precondition/.test(c)?'Could not reach the database. Make sure the Firestore database is created (SETUP.md step 3), then try again.':'Could not reach the table ('+(c||'network')+'). Try again.';}
  }
 }

 const ready=connect().catch(()=>null);
 window.claude={
  async use(what){
   const t=await ready;
   if(!t)throw new Error('offline');
   if(t.solo){
    if(what==='db')return t.db;
    if(what==='user')return{id:async()=>'solo',isOwner:async()=>true,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:'Core Master'}]))};
    throw new Error('unknown capability '+what);
   }
   if(what==='db')return{collection:p=>t.fs.collection(t.base+p),tx:fn=>t.fs.runTransaction(fn)};
   if(what==='user')return{
    id:async()=>t.uid,
    isOwner:async()=>t.owner,
    async profiles(ids){const out={};await Promise.all(ids.map(async id=>{try{const s=await t.fs.doc(t.base+'members/'+id).get();out[id]=s.exists?{name:s.data().name}:null;}catch{out[id]=null;}}));return out;}
   };
   throw new Error('unknown capability '+what);
  }
 };
})();
