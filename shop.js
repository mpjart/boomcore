// Boom Shop: the buying pop-up. Opens from the 🛒 Shop button in the Loot tab while the market is open
// (the Core Master can always open it). Stock comes from shops.js, built from docs/shop-tables.md.
// Prices are fixed, in coins of each item's tier, with the CM's price dial applied (rounded down).
// Shop goods have no stats: weapons are plain (no plus), armor is always 1, and shops never buy their own stock back.
// Uses the main script's globals: $, el, btn, toast, logEvent, chars, living, myHero, isDM, skin, LT, coinsOf, coinSub,
// lootList, setLoot, potionOf, dialPct, marketOpen, canSell, renderParty.
(function(){
const CSS=`
.shopov{position:fixed;inset:0;z-index:40;background:#0009;display:flex;align-items:flex-start;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px 12px;overflow:auto}
.shopc{width:min(720px,100%);margin:0;display:flex;flex-direction:column;gap:10px}
.shopc .shh{display:flex;align-items:center;gap:8px}.shopc .shh .pn{flex:1;font-size:18px}
.shopc .shsel{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media(max-width:520px){.shopc .shsel{grid-template-columns:1fr}}
.shtabs{display:flex;flex-wrap:wrap;gap:6px}.shtabs button{background:var(--chip);color:var(--ink);font-weight:600;font-size:14px;padding:6px 11px}.shtabs button.on{background:var(--acc);color:var(--accfg)}
.shrow{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--line)}
.shrow .sn{flex:1;min-width:0}.shrow .sn b{display:block;font-size:14px}.shrow .sn small{color:var(--mute);font-size:12px}
.shrow .pr{font-weight:700;font-size:14px;white-space:nowrap;text-align:right}.shrow select{width:auto;flex:none;padding:6px}
.shpurse{font-size:13px;color:var(--mute)}
.shsel select{width:100%;font:inherit;font-size:15px;padding:9px 10px;border-radius:var(--rb);border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.shsel label{margin-bottom:4px}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
const THEMES=[['core','Core and Fantasy'],['pirate','Pirate'],['steampunk','Steampunk'],['horror','Horror'],['grit','Street Grit'],['space','Space']];
const SKIN2SHOP={core:'core',coredark:'core',fantasy:'core',fantasydark:'core',pirate:'pirate',steampunk:'steampunk',horror:'horror',grit:'grit',gritdark:'grit',space:'space'};
let ov=null,theme='',shopI=0,buyer='';
const price=p=>Math.max(1,Math.floor(p*(100+dialPct())/100));
function kindOf(it){const u=it[3]||'';if(/^Ammo/i.test(u))return'ammo';if(/^Armor/i.test(u))return'armor';if(/\dd[46]/.test(u))return'weapon';return /healing potion|medgel|med kit/i.test(it[0])?'potion':'gear';}
function heroes(){return living();}
function who(){return chars.find(c=>c.id===buyer&&!c.dead)||null;}
function close(){if(ov){ov.remove();ov=null;}document.removeEventListener('keydown',esc);}
function esc(e){if(e.key==='Escape')close();}
function buy(it,tier){
 if(!canSell())return;
 const c=who();if(!c)return toast(isDM?'Choose who is buying':'Pick your hero first (🙋 This is me on the Party tab)');
 if(!isDM&&c.id!==myHero)return toast('You can only buy for your own hero');
 const k=kindOf(it),t=it[1]<0?tier:it[1],base=it[1]<0?10:it[2],cost=price(base);
 const cur=chars.find(x=>x.id===c.id)||c,arr=coinSub(coinsOf(cur),t,cost);
 if(!arr)return toast('Not enough coins: '+it[0].replace(/\s*\(.*\)$/,'')+' costs '+cost+' '+LT[t]+' coins');
 const l=lootList(cur),uid=()=>Math.random().toString(36).slice(2,8),nm=it[0];let shown=nm.replace(/\s*\((?!takes)[^)]*\)\s*$/,'');
 if(k==='potion'){const p=l.find(x=>x.k==='potion'&&x.t===t);if(p)p.q+=1;else l.push(potionOf(t,1,uid()));shown='T'+(t+1)+' healing potion';}
 else if(k==='weapon'){const m=/(\d)d([46])\s+(touch|ranged),\s*(\d)/i.exec(it[3]);l.push({id:uid(),k:'item',ty:'weapon',n:shown,t:0,plus:0,sk:'',wh:m?m[4]:'1',wr:m&&/ranged/i.test(m[3])?'r':'t',wt:'p',shop:1});}
 else if(k==='armor')l.push({id:uid(),k:'item',ty:'armor',n:shown,t:0,plus:0,sk:'',at:/magical/i.test(it[3])?'m':'p',shop:1});
 else l.push({id:uid(),k:'item',ty:'gear',n:k==='ammo'?shown+' (refills from storage)':nm,t,plus:0,sk:'',shop:1});
 setLoot(cur,l,{coins:arr,gold:arr[0]});
 const m='🛒 '+(cur.name||'A hero')+' buys '+shown+' for '+cost+' '+LT[t]+' coin'+(cost===1?'':'s');toast(m);logEvent(m);render();}
function render(){
 if(!ov)return;const data=(window.BOOM_SHOPS||{})[theme]||[],c=ov.querySelector('.shopc');c.replaceChildren();
 const h=el('div','shh');h.append(el('b','pn','🛒 Shop'),btn('Close',close,'ghost sm'));c.append(h);
 c.append(el('div','note',(marketOpen?'The market is open.':'The market is closed: only the Core Master can buy right now.')+' Prices are in coins of each item\'s tier'+(dialPct()?', with the price dial at '+(dialPct()>0?'+':'')+dialPct()+'%':'')+'. Shop goods have no stats, and shops never buy their own stock back.'));
 const sel=el('div','shsel'),wb=el('div'),wt=el('div');
 const bs=document.createElement('select');bs.id='shopwho';const hs=heroes().filter(x=>isDM||x.id===myHero);
 if(!hs.length)bs.add(new Option(isDM?'No heroes yet':'Pick your hero on the Party tab first',''));hs.forEach(x=>bs.add(new Option(x.name||'Unnamed',x.id)));
 if(!hs.some(x=>x.id===buyer))buyer=(hs.find(x=>x.id===myHero)||hs[0]||{}).id||'';bs.value=buyer;bs.onchange=()=>{buyer=bs.value;render();};
 const lb=el('label',null,'Buying for');lb.htmlFor='shopwho';wb.append(lb,bs);
 const ts=document.createElement('select');ts.id='shopth';THEMES.forEach(([k,n])=>ts.add(new Option(n,k)));ts.value=theme;ts.onchange=()=>{theme=ts.value;shopI=0;render();};
 const lt=el('label',null,'Shops');lt.htmlFor='shopth';wt.append(lt,ts);sel.append(wb,wt);c.append(sel);
 const b=who();if(b){const cs=coinsOf(b),s=cs.map((x,i)=>x?x+' '+LT[i]:'').filter(Boolean).reverse().join(' · ')||'no coins';c.append(el('div','shpurse','👛 '+(b.name||'This hero')+': '+s));}
 const tabs=el('div','shtabs');data.forEach((s,i)=>{const t=btn(s.s,()=>{shopI=i;render();});if(i===shopI)t.classList.add('on');t.setAttribute('aria-pressed',i===shopI);tabs.append(t);});c.append(tabs);
 const s=data[shopI];if(!s){c.append(el('div','note','No shops found. Reload the page.'));return;}
 const list=el('div');
 s.i.forEach(it=>{const r=el('div','shrow'),n=el('div','sn'),k=kindOf(it);n.append(el('b',null,it[0]));
  const tag=k==='weapon'?it[3]+' · physical, no plus':k==='armor'?it[3]+' · takes an armor slot':k==='ammo'?'Ammo: a stack of 2+ in storage never runs out':k==='potion'?'Drink: heals 1d6 per tier (it can boom)':'Gear: no stats';n.append(el('small',null,tag));r.append(n);
  let tier=it[1];
  if(it[1]<0){const ps=document.createElement('select');ps.setAttribute('aria-label','Potion tier');LT.forEach((x,i)=>ps.add(new Option('T'+(i+1),i)));ps.value='0';tier=0;const pr=el('span','pr',price(10)+' '+LT[0]);ps.onchange=()=>{tier=+ps.value;pr.textContent=price(10)+' '+LT[tier];};r.append(ps,pr);}
  else r.append(el('span','pr',price(it[2])+' '+LT[it[1]]));
  const bb=btn('Buy',()=>buy(it,tier),'sm rb');bb.disabled=!b||(!marketOpen&&!isDM);r.append(bb);list.append(r);});
 c.append(list);}
window.openShop=function(){
 if(!marketOpen&&!isDM)return toast('🏪 The market is closed');
 if(!window.BOOM_SHOPS)return toast('The shop lists did not load. Reload the page.');
 theme=theme||SKIN2SHOP[typeof skin==='string'?skin:'core']||'core';
 close();ov=el('div','shopov');ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Shop');
 const c=el('section','card shopc');ov.append(c);ov.onclick=e=>{if(e.target===ov)close();};document.body.append(ov);document.addEventListener('keydown',esc);render();};
window.shopRefresh=render;
if(typeof renderMarket==='function')renderMarket();
})();
