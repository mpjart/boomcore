// Boom Map: a shared chalkboard in the Dice tab.
// The Core Master sketches with chalk (or drops a map image behind it) and places tokens for
// the party and monsters. Players see the board, move their own token, and roll from a pop-up
// roll card. Drawing tools show only to the CM, unless the CM turns on "Players can draw".
// Shared data lives in three collections under the table: map (bg, state), mapstrokes, maptokens.
// Uses the main script's globals: db, me, isDM, chars, monsters, myHero, colorMap, cvar, calc,
// hpBox, statChips, doRoll, rollInit, rollMonInit, statRoll, wpn, rollWpn, bothOk, slotItem, atks,
// eff, BT, TI, EQ, STATS, SHORT, monHp, putM, mAbs, parse, toast, hoJpeg, el, btn, logEvent.
(function(){
const CSS=`
#mapbox{padding:0;overflow:hidden}
#mapbox>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:12px}
#mapbox>summary::-webkit-details-marker{display:none}
#mapbox>summary .pn{flex:1}#mapbox>summary .sumx{color:var(--mute);font-size:13px;font-weight:600}
#mapbox>summary:after{content:"\\25B8";color:var(--mute);font-size:13px;width:14px;text-align:center}#mapbox[open]>summary:after{content:"\\25BE"}
#mapbody{padding:0 12px 12px;display:flex;flex-direction:column;gap:10px}
.mtools{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}
.mtools .g{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.mtools .g>small{color:var(--mute);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-right:2px}
.mtools button.on{background:var(--acc);color:var(--accfg)}
.mtools label.fbtn{display:inline-flex;align-items:center;cursor:pointer;background:var(--chip);color:var(--ink);font-weight:600;font-size:14px;padding:6px 11px;border-radius:var(--rb);position:relative}
.mtools label.fbtn input{position:absolute;opacity:0;width:1px;height:1px}
.mtools label.fbtn:focus-within{outline:2px solid var(--acc)}
.mtools input[type=range]{width:96px;padding:0;accent-color:var(--acc)}
.msw{width:28px;height:28px;padding:0!important;border-radius:50%!important;border:2px solid var(--line)!important;min-width:0}
.msw.on{box-shadow:0 0 0 3px var(--acc)}
.mtools .chk{margin:0}
.minfo{color:var(--mute);font-size:12px}
.mframe{padding:clamp(6px,1.2vw,12px);border-radius:8px;background:repeating-linear-gradient(92deg,#ffffff08 0 3px,transparent 3px 11px),linear-gradient(135deg,#8d5f37,#6b4527 45%,#3f2715);box-shadow:0 6px 18px #0007,inset 0 0 0 2px #0005}
.mboard{position:relative;aspect-ratio:var(--ratio,1.6);width:100%;container-type:inline-size;border-radius:3px;overflow:hidden;box-shadow:inset 0 0 40px #0009;background:#2e4a3b;color:#f1efe6;cursor:default;margin:0 auto}
.mframe.s-marker{background:linear-gradient(180deg,#e9edf0,#b9c0c6 40%,#d7dce0 60%,#9aa2a9);box-shadow:0 6px 18px #0005,inset 0 0 0 1px #fff8}
.mframe.s-glow{background:linear-gradient(135deg,#1c2436,#0b1020 50%,#182035);box-shadow:0 6px 18px #000a,inset 0 0 0 1px #4fd8f733,0 0 22px #4fd8f71f}
.s-marker .mboard{background:#f4f6f5;color:#1d1d1d;box-shadow:inset 0 0 30px #0002}.s-glow .mboard{background:#08142e;box-shadow:inset 0 0 40px #000c;border-radius:10px}
.s-glow .mboard::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px),radial-gradient(ellipse at 50% 45%,rgba(79,216,247,.07),transparent 60%),radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55));box-shadow:inset 0 0 0 1px #4fd8f726,inset 0 0 24px #4fd8f714}
.s-marker .mtextin{background:#ffffffcc;border-color:#9aa2a9}
.s-marker .mtextin,.s-glow .mtextin{font-family:'Permanent Marker','Cabin Sketch',cursive}
.mboard.draw{touch-action:none;cursor:crosshair}.mboard.erase{cursor:cell}.mboard.text{cursor:text}
.mboard canvas{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0;pointer-events:auto}
.mtoks{position:absolute;inset:0;pointer-events:none;z-index:1}
.mtok{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.3cqw;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none}
.mtok.mine,.mtok.cm{cursor:grab}
.mtok .disc{width:clamp(24px,4.4cqw,58px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-family:'Cabin Sketch','Comic Sans MS',cursive;font-weight:700;font-size:clamp(11px,1.9cqw,24px);color:#1f1a14;background:var(--tc,#f3b54a);border:2px dashed #ffffffcc;box-shadow:0 2px 6px #0008}
.mtok.mon .disc{border-style:solid;border-color:#1f1a14aa}
.mtok.boss .disc{width:clamp(34px,6.4cqw,84px);font-size:clamp(13px,2.6cqw,32px);box-shadow:0 0 0 3px #e8705f,0 3px 10px #000a}
.mtok.dead .disc{filter:grayscale(1) brightness(.7)}
.mtok .tag{font-family:'Cabin Sketch','Comic Sans MS',cursive;font-size:clamp(10px,1.35cqw,17px);color:#f1efe6;white-space:nowrap;text-shadow:0 1px 2px #000c;background:#0000004d;padding:0 .5em;border-radius:4px}
.mtok .mhp{width:clamp(26px,5cqw,64px);height:5px;border-radius:3px;background:#0008;overflow:hidden;box-shadow:0 0 0 1px #0006}
.mtok .mhp i{display:block;height:100%;background:#8fdc98}.mtok .mhp i.mid{background:#f3d77a}.mtok .mhp i.low{background:#e8705f}
.mtok.sel .disc{outline:3px solid #f3d77a;outline-offset:3px}
.mtok .mx{display:none;position:absolute;top:-8px;right:-14px;width:24px;height:24px;padding:0;border-radius:50%;justify-content:center;align-items:center;background:#e8705f;color:#fff;border:2px solid #fff;font-size:14px;line-height:1}
.mtok.sel .mx{display:inline-flex}
.mtextin{position:absolute;transform:translateY(-60%);font-family:'Cabin Sketch',cursive;font-size:clamp(14px,2.4cqw,30px);color:#f1efe6;background:#00000055;border:1.5px dashed #bdbbb0;border-radius:4px;padding:2px 6px;outline:none;width:min(16em,60cqw);flex:none}
.mrcbtn{position:absolute;right:8px;bottom:8px;width:clamp(40px,7cqw,54px);height:clamp(40px,7cqw,54px);padding:3px!important;border-radius:50%!important;background:var(--card)!important;border:3px solid var(--acc)!important;box-shadow:0 4px 12px #0009;display:grid;place-items:center;z-index:3}
.mrcbtn svg{width:84%;height:84%;overflow:visible}
.mlock{position:absolute;left:8px;top:8px;font-family:'Cabin Sketch',cursive;font-size:clamp(12px,1.6cqw,18px);color:#f3d77a;background:#0006;padding:1px 8px;border-radius:4px;pointer-events:none}
.mtray{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.mtray .tb{border:1px solid var(--line);border-radius:var(--rb);padding:8px;display:flex;flex-direction:column;gap:6px;min-width:0}
.mtray .tb>small{color:var(--mute);font-size:11px;font-weight:700;text-transform:uppercase}
.mchips{display:flex;flex-wrap:wrap;gap:5px}
.mchips button{background:var(--chip);color:var(--ink);font-weight:600;font-size:14px;padding:4px 10px 4px 4px;border-radius:99px;display:inline-flex;align-items:center;gap:6px}
.mchips i{width:22px;height:22px;border-radius:50%;background:var(--tc);display:grid;place-items:center;font-style:normal;color:#1f1a14;font-size:12px;font-weight:800}
.mrc{position:fixed;z-index:35;right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:min(360px,calc(100vw - 32px));max-height:min(78vh,720px);overflow:auto;overscroll-behavior:contain;margin:0;box-shadow:0 14px 40px #0008;display:flex;flex-direction:column;gap:8px}
.mrc .pch{margin:0}.mrc .pch select{flex:1;min-width:0;font-weight:700;font-size:16px;padding:6px 8px}
.mrc .at{margin:0}.mrc .stc{margin:0}.mrc .hpb{margin:0}
.mrc .mlast{font-size:13px;color:var(--mute)}.mrc .mlast b{color:var(--cc,var(--ink))}
@media(max-width:520px){.mrc{left:calc(8px + env(safe-area-inset-left,0px));right:calc(8px + env(safe-area-inset-right,0px));width:auto;bottom:calc(8px + env(safe-area-inset-bottom,0px))}}

/* full screen: the board fills a tablet or TV for in-person play */
.mview{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.mview .sp{flex:1}
.mview button.on{background:var(--acc);color:var(--accfg)}
.mfull{position:fixed;inset:0;z-index:30;background:#0d0d0d;display:flex;flex-direction:column;gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) calc(8px + env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) calc(8px + env(safe-area-inset-left,0px))}
.mfull .mview{color:#eee}.mfull .mview .ttl{font-family:'Cabin Sketch',cursive;font-size:20px;color:#f1efe6}
.mfull:not(.tools) .mtools{display:none}.mfull .mtools{background:var(--card);border-radius:var(--rb);padding:6px 8px;max-height:40vh;overflow:auto}
.mfull .mframe{flex:1;min-height:0;container-type:size;display:flex;align-items:center;justify-content:center;padding:0;background:none;box-shadow:none}
.mfull .mboard{width:min(100cqw,calc(100cqh * var(--ratio,1.6)));flex:none}
.mfull.big .mtok .tag{font-size:clamp(16px,2.4cqw,40px);padding:0 .4em}
.mfull.big .mtok .disc{width:clamp(42px,6.2cqw,96px);font-size:clamp(17px,2.7cqw,38px);border-width:3px}
.mfull.big .mtok.boss .disc{width:clamp(56px,8.6cqw,128px);font-size:clamp(20px,3.4cqw,46px)}
.mfull.big .mtok .mhp{width:clamp(40px,6.4cqw,100px);height:9px}
.mfull.big .mlock{font-size:clamp(16px,2.2cqw,28px)}
.mfull.big .mrcbtn{width:clamp(54px,8cqw,84px);height:clamp(54px,8cqw,84px)}
body.mapfull{overflow:hidden}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
{const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&family=Permanent+Marker&display=swap';document.head.append(l);}

const MARK=`<polygon class="bm-f1" points="17.6,55 54,34 54,55"/><polygon class="bm-f2" points="54,34 90.4,55 54,55"/><polygon class="bm-f2" points="17.6,55 54,55 35.8,86.5"/><polygon class="bm-f2" points="54,55 90.4,55 72.2,86.5"/><polygon class="bm-f3" points="90.4,55 90.4,97 72.2,86.5"/><polygon class="bm-f2" points="17.6,55 35.8,86.5 17.6,97"/><polygon class="bm-f3" points="17.6,97 35.8,86.5 54,118"/><polygon class="bm-f3" points="35.8,86.5 72.2,86.5 54,118"/><polygon class="bm-f4" points="54,118 72.2,86.5 90.4,97"/><polygon class="bm-front" points="54,55 72.2,86.5 35.8,86.5"/><g class="bm-lines" fill="none" stroke-width="2.2" stroke-linejoin="round"><polygon points="17.6,55 54,34 54,55"/><polygon points="54,34 90.4,55 54,55"/><polygon points="17.6,55 54,55 35.8,86.5"/><polygon points="54,55 90.4,55 72.2,86.5"/><polygon points="90.4,55 90.4,97 72.2,86.5"/><polygon points="17.6,55 35.8,86.5 17.6,97"/><polygon points="17.6,97 35.8,86.5 54,118"/><polygon points="35.8,86.5 72.2,86.5 54,118"/><polygon points="54,118 72.2,86.5 90.4,97"/><polygon points="54,55 72.2,86.5 35.8,86.5"/></g><polygon class="bm-out" points="54,34 90.4,55 90.4,97 54,118 17.6,97 17.6,55" fill="none" stroke-width="4.5" stroke-linejoin="round"/><path class="bm-fuse" d="M57 24 C 58 8, 76 16, 80 6 S 86 -4, 92 -2" fill="none" stroke-width="6" stroke-linecap="round"/><polygon class="bm-s1" points="94,-22 96.9,-9.9 107.4,-16.4 100.9,-5.9 113,-3 100.9,-0.1 107.4,10.4 96.9,3.9 94,16 91.1,3.9 80.6,10.4 87.1,-0.1 75,-3 87.1,-5.9 80.6,-16.4 91.1,-9.9"/><polygon class="bm-s2" points="99,-11.7 97.6,-5.1 104,-3 97.6,-0.9 99,5.7 94,1.2 89,5.7 90.4,-0.9 84,-3 90.4,-5.1 89,-11.7 94,-7.2"/><rect class="bm-cap" x="44" y="19" width="21" height="15" rx="3.5" transform="rotate(14 54.5 26.5)" stroke-width="4"/><text x="54" y="84" text-anchor="middle" font-size="17" font-weight="800" class="bm-n" font-family="system-ui,sans-serif">20</text>`;
const CHALK=[['#f1efe6','White'],['#f3d77a','Yellow'],['#f2a3b8','Pink'],['#9fd3f0','Blue'],['#e8705f','Red'],['#9be3a0','Green'],['#161616','Black']];
// the same stored chalk color, drawn as glow or dry-erase ink
const INK={glow:{'#f1efe6':'#f4f8ff','#f3d77a':'#ffe94d','#f2a3b8':'#ff5fd2','#9fd3f0':'#3fe0ff','#e8705f':'#ff4a3d','#9be3a0':'#4dff7a','#161616':'#2b2b2b'},
 marker:{'#f1efe6':'#6b7480','#f3d77a':'#e08a00','#f2a3b8':'#d6337f','#9fd3f0':'#1f5fd1','#e8705f':'#d42a1f','#9be3a0':'#17913a','#161616':'#1d1d1d'}};
const SURF=[['chalk','Chalk'],['glow','Glow'],['marker','Marker']];
const surf=()=>mstate.surf==='glow'||mstate.surf==='marker'?mstate.surf:'chalk';
const ink=c=>(INK[surf()]||{})[c]||c;
const TOKCOL={red:'#e8705f',amber:'#f3b54a',green:'#8fdc98',teal:'#6fd6c8',blue:'#8fcdf2',purple:'#c99be6',pink:'#f2a3b8',slate:'#c3cbd6'};
const U=10000;

/* ---------- state ---------- */
let mapCol=null,strokeCol=null,tokCol=null,built=false;
let W=1600,H=1000,bg={img:'',w:16,h:10,dim:35},bgImg=null,mstate={draw:false,surf:'chalk'};
let strokes=[],drawn=new Set(),maxTs=0,tokens={},dragging=null;
let tool='select',color=CHALK[0][0],size=12,selTok=null,cardFor=null,cardOpen=false,last=null,textEl=null;
let B={};// dom refs
const canDraw=()=>isDM||mstate.draw;
const mine=ref=>isDM||(!!myHero&&ref===myHero);

/* ---------- seeded random, so every device draws the same chalk grain ---------- */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- drawing ---------- */
let ctx,bctx;
const scale=()=>Math.max(W,H)/1600;
const lite=c=>{const n=parseInt(c.slice(1),16),m=v=>Math.round(v+(255-v)*.6);return`rgb(${m(n>>16)},${m(n>>8&255)},${m(n&255)})`;};
function inkSeg(x0,y0,x1,y1,w,c,glow){
 ctx.globalCompositeOperation='source-over';ctx.lineCap='round';ctx.lineJoin='round';
 if(glow){ctx.shadowColor=c;ctx.shadowBlur=w*1.4;ctx.strokeStyle=c;ctx.globalAlpha=1;ctx.lineWidth=w*.7;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle=lite(c);ctx.globalAlpha=1;ctx.lineWidth=Math.max(1,w*.22);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
 else{ctx.strokeStyle=c;ctx.globalAlpha=1;ctx.lineWidth=w*.6;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
 ctx.globalAlpha=1;ctx.shadowBlur=0;}
function chalkSeg(R,x0,y0,x1,y1,w,c){
 c=ink(c);if(surf()!=='chalk')return inkSeg(x0,y0,x1,y1,w,c,surf()==='glow');
 ctx.globalCompositeOperation='source-over';ctx.strokeStyle=c;ctx.lineCap='round';ctx.globalAlpha=.28;ctx.lineWidth=w*.55;
 ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.fillStyle=c;
 const d=Math.hypot(x1-x0,y1-y0),steps=Math.max(1,Math.ceil(d/Math.max(1.5,w*.22))),n=Math.ceil(w*.8)+2;
 for(let i=0;i<=steps;i++){const t=i/steps,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
  for(let k=0;k<n;k++){const a=R()*6.283,r=Math.sqrt(R())*w/2,s=.6+R()*1.8;ctx.globalAlpha=.18+R()*.5;ctx.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,s,s);}}
 ctx.globalAlpha=1;}
function eraseSeg(x0,y0,x1,y1,w){
 ctx.globalCompositeOperation='destination-out';const r=w*1.8,d=Math.hypot(x1-x0,y1-y0),steps=Math.max(1,Math.ceil(d/(r*.3)));
 for(let i=0;i<=steps;i++){const t=i/steps,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
 ctx.globalCompositeOperation='source-over';}
function chalkText(R,str,x,y,px,c){
 c=ink(c);if(surf()!=='chalk'){const gl=surf()==='glow';ctx.globalCompositeOperation='source-over';ctx.font=`${px*.9}px "Permanent Marker", cursive`;ctx.textBaseline='middle';
  if(gl){ctx.shadowColor=c;ctx.shadowBlur=px*.35;}ctx.fillStyle=c;ctx.globalAlpha=.92;ctx.fillText(str,x,y);ctx.shadowBlur=0;ctx.globalAlpha=1;return;}
 ctx.globalCompositeOperation='source-over';ctx.font=`700 ${px}px "Cabin Sketch", cursive`;ctx.fillStyle=c;ctx.globalAlpha=.9;ctx.textBaseline='middle';ctx.fillText(str,x,y);ctx.globalAlpha=1;
 const w=ctx.measureText(str).width;ctx.globalCompositeOperation='destination-out';
 for(let i=0;i<w*px*.06;i++){ctx.globalAlpha=.4+R()*.6;ctx.fillRect(x+R()*w,y-px/2+R()*px,1+R()*2,1+R()*2);}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
const decode=p=>(p||'').split(';').filter(Boolean).map(s=>{const[a,b]=s.split(',');return[+a/U*W,+b/U*H];});
function drawStroke(s){
 const R=rng(hash(s.id)),pts=decode(s.p),w=(s.s||12)*scale();if(!pts.length)return;
 if(s.t==='x'){chalkText(R,s.txt||'',pts[0][0],pts[0][1],w,s.c||'#f1efe6');return;}
 if(s.t==='e'){eraseSeg(pts[0][0],pts[0][1],pts[0][0]+.1,pts[0][1],w);for(let i=1;i<pts.length;i++)eraseSeg(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],w);return;}
 chalkSeg(R,pts[0][0],pts[0][1],pts[0][0]+.1,pts[0][1],w,s.c);for(let i=1;i<pts.length;i++)chalkSeg(R,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],w,s.c);}
function redrawAll(){if(!ctx)return;ctx.clearRect(0,0,W,H);drawn=new Set();maxTs=0;for(const s of strokes){drawStroke(s);drawn.add(s.id);maxTs=Math.max(maxTs,s.ts||0);}}
function syncStrokes(list){
 const sorted=list.slice().sort((a,b)=>(a.ts||0)-(b.ts||0)||(a.id<b.id?-1:1)),ids=new Set(sorted.map(s=>s.id));
 const removed=[...drawn].some(id=>!ids.has(id)),fresh=sorted.filter(s=>!drawn.has(s.id)),late=fresh.some(s=>(s.ts||0)<maxTs&&!(live&&s.id===live.id));
 strokes=sorted;if(!ctx)return;
 if(removed||late){redrawAll();return;}
 for(const s of fresh){drawStroke(s);drawn.add(s.id);maxTs=Math.max(maxTs,s.ts||0);}}
function drawBg(){
 if(!bctx)return;
 if(bgImg){bctx.fillStyle='#111';bctx.fillRect(0,0,W,H);const s=Math.max(W/bgImg.width,H/bgImg.height),w=bgImg.width*s,h=bgImg.height*s;bctx.drawImage(bgImg,(W-w)/2,(H-h)/2,w,h);
  bctx.fillStyle=`rgba(0,0,0,${(+B.dim?.value||bg.dim||0)/100})`;bctx.fillRect(0,0,W,H);return;}
 const R=rng(424242),sc0=scale();
 if(surf()!=='chalk'){const wb=surf()==='marker',g=bctx.createLinearGradient(0,0,W,H);
  if(wb){g.addColorStop(0,'#fbfcfc');g.addColorStop(.55,'#eef1f1');g.addColorStop(1,'#e3e7e8');}
  else{const rg=bctx.createRadialGradient(W*.5,H*.45,50,W*.5,H*.5,Math.max(W,H)*.7);rg.addColorStop(0,'#0c1a3a');rg.addColorStop(1,'#030610');bctx.fillStyle=rg;bctx.fillRect(0,0,W,H);
   // a faint cyan monitor grid, like the Space handouts
   bctx.strokeStyle='rgba(79,216,247,.07)';bctx.lineWidth=1.5*sc0;const gs=80*sc0;bctx.beginPath();for(let x=gs;x<W;x+=gs){bctx.moveTo(x,0);bctx.lineTo(x,H);}for(let y=gs;y<H;y+=gs){bctx.moveTo(0,y);bctx.lineTo(W,y);}bctx.stroke();return;}
  bctx.fillStyle=g;bctx.fillRect(0,0,W,H);bctx.lineCap='round';
  // ghosting from old marker, wiped off
  for(let i=0;i<18;i++){bctx.strokeStyle=`rgba(90,100,110,${.008+R()*.014})`;bctx.lineWidth=(30+R()*70)*sc0;bctx.beginPath();const a=R()*6;bctx.arc(R()*W,R()*H,(60+R()*220)*sc0,a,a+.8+R()*2);bctx.stroke();}
  if(wb){const sh=bctx.createLinearGradient(0,0,W,H*.6);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.55)');sh.addColorStop(.62,'rgba(255,255,255,0)');bctx.fillStyle=sh;bctx.fillRect(0,0,W,H);}
  return;}
 const g=bctx.createRadialGradient(W*.45,H*.4,100,W*.5,H*.5,Math.max(W,H)*.75);g.addColorStop(0,'#355643');g.addColorStop(1,'#223a2d');bctx.fillStyle=g;bctx.fillRect(0,0,W,H);
 bctx.lineCap='round';const sc=scale();
 for(let i=0;i<26;i++){bctx.strokeStyle=`rgba(230,235,225,${.018+R()*.03})`;bctx.lineWidth=(40+R()*90)*sc;bctx.beginPath();const a=R()*6;bctx.arc(R()*W,R()*H,(60+R()*220)*sc,a,a+1+R()*2.5);bctx.stroke();}
 const d=bctx.getImageData(0,0,W,H),p=d.data;for(let i=0;i<p.length;i+=4){const n=(R()-.5)*16;p[i]+=n;p[i+1]+=n;p[i+2]+=n;}bctx.putImageData(d,0,0);}
function sizeBoard(){
 const ratio=Math.min(3,Math.max(1/3,(bg.w||16)/(bg.h||10)));
 const nW=ratio>=1?1600:Math.round(1600*ratio),nH=ratio>=1?Math.round(1600/ratio):1600;
 B.board.style.setProperty('--ratio',nW/nH);
 if(nW!==W||nH!==H||B.bg.width!==nW){W=nW;H=nH;B.bg.width=B.ink.width=W;B.bg.height=B.ink.height=H;drawBg();redrawAll();return true;}
 return false;}
function loadImg(){const src=bg.img,im=new Image();im.onload=()=>{if(bg.img!==src)return;bgImg=im;drawBg();};im.src=src;}
function applyBg(v){
 const nb={img:v.img||'',w:+v.w||16,h:+v.h||10,dim:v.dim==null?35:+v.dim},changed=nb.img!==bg.img;bg=nb;
 if(B.dim&&document.activeElement!==B.dim)B.dim.value=bg.dim;
 if(!built)return;
 if(changed){bgImg=null;if(bg.img)loadImg();}
 if(!sizeBoard())drawBg();
 renderTools();}

/* ---------- live drawing ---------- */
let live=null;
const pos=e=>{const r=B.board.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];};
const enc=p=>Math.round(Math.max(0,Math.min(W,p[0]))/W*U)+','+Math.round(Math.max(0,Math.min(H,p[1]))/H*U);
const newId=()=>(me||'local').slice(0,6)+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function down(e){
 if(e.target.closest('.mtok,.mtextin,.mrcbtn'))return;
 if(selTok){selTok=null;renderTokens();}
 if(tool==='select'||!canDraw())return;
 if(tool==='text'){openText(e);return;}
 e.preventDefault();B.board.setPointerCapture(e.pointerId);
 const p=decode(enc(pos(e)))[0],id=newId();live={pid:e.pointerId,id,R:rng(hash(id)),t:tool==='erase'?'e':'c',c:color,s:size,pts:[p],last:p};
 const w=size*scale();
 if(live.t==='e')eraseSeg(p[0],p[1],p[0]+.1,p[1],w);else chalkSeg(live.R,p[0],p[1],p[0]+.1,p[1],w,color);}
function move(e){
 if(!live||live.pid!==e.pointerId)return;const w=live.s*scale();
 for(const ev of (e.getCoalescedEvents?e.getCoalescedEvents():[e])){const p=pos(ev),q=live.last;if(Math.hypot(p[0]-q[0],p[1]-q[1])<2)continue;
  // round-trip through the stored units so live chalk matches what everyone else draws
  const pp=decode(enc(p))[0];
  if(live.t==='e')eraseSeg(q[0],q[1],pp[0],pp[1],w);else chalkSeg(live.R,q[0],q[1],pp[0],pp[1],w,live.c);
  live.pts.push(pp);live.last=pp;}}
function up(e){
 if(!live||live.pid!==e.pointerId)return;const s=live;live=null;
 const doc={t:s.t,c:s.c,s:s.s,p:s.pts.slice(0,3000).map(enc).join(';'),ts:Date.now(),by:me||'local'};
 drawn.add(s.id);maxTs=Math.max(maxTs,doc.ts);strokes.push({id:s.id,...doc});
 strokeCol&&strokeCol.doc(s.id).set(doc).catch(()=>toast('Could not save that chalk line.'));}
function openText(e){
 closeText(true);const r=B.board.getBoundingClientRect(),p=pos(e);
 textEl=document.createElement('input');textEl.className='mtextin';textEl.id='mtextin';textEl.placeholder='Type, then Enter';textEl.maxLength=60;
 textEl.style.left=(e.clientX-r.left)+'px';textEl.style.top=(e.clientY-r.top)+'px';textEl.style.color=ink(color);textEl.dataset.p=enc(p);
 B.board.append(textEl);setTimeout(()=>textEl&&textEl.focus(),0);
 textEl.addEventListener('keydown',ev=>{if(ev.key==='Enter')closeText(true);if(ev.key==='Escape')closeText(false);});
 textEl.addEventListener('blur',()=>closeText(true));}
function closeText(commit){
 if(!textEl)return;const t=textEl;textEl=null;const v=t.value.trim();t.remove();
 if(!commit||!v)return;const id=newId(),px=size<10?34:size<20?48:70,doc={t:'x',c:color,s:px,p:t.dataset.p,txt:v,ts:Date.now(),by:me||'local'};
 const s={id,...doc};drawStroke(s);drawn.add(id);maxTs=Math.max(maxTs,doc.ts);strokes.push(s);
 strokeCol&&strokeCol.doc(id).set(doc).catch(()=>toast('Could not save that text.'));}

/* ---------- CM actions ---------- */
function undo(){
 const mineList=strokes.filter(s=>isDM||s.by===(me||'local'));const s=mineList[mineList.length-1];
 if(!s)return toast(isDM?'Nothing to undo.':'You have no chalk lines to undo.');
 strokes=strokes.filter(x=>x.id!==s.id);redrawAll();strokeCol&&strokeCol.doc(s.id).delete().catch(()=>{});}
let wipeArm=0;
function wipe(b){
 if(!wipeArm){wipeArm=1;b.textContent='Tap again to wipe';setTimeout(()=>{wipeArm=0;b.textContent='Wipe board';},3000);return;}
 wipeArm=0;b.textContent='Wipe board';const ids=strokes.map(s=>s.id);strokes=[];redrawAll();
 ids.forEach(id=>strokeCol&&strokeCol.doc(id).delete().catch(()=>{}));}
function setImage(f){
 if(!f)return;if(!/^image\//.test(f.type))return toast('That file is not an image.');
 const url=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{const k=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');
  c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
  const data=hoJpeg(c),v={img:data,w:im.naturalWidth,h:im.naturalHeight,dim:bg.dim,ts:Date.now()};
  mapCol.doc('bg').set(v).then(()=>toast('Map image set for the table.')).catch(()=>toast('Could not save the map image. Try a smaller picture.'));applyBg(v);};
 im.onerror=()=>{URL.revokeObjectURL(url);toast('Could not read that image.');};im.src=url;}
function saveState(){mapCol&&mapCol.doc('state').set({draw:!!mstate.draw,surf:surf(),ts:Date.now()}).catch(()=>{});}
function applySurf(){if(!built)return;B.frame.className='mframe s-'+surf();drawBg();redrawAll();renderTools();summary();}
function setSurf(v){if(v===surf())return;mstate.surf=v;saveState();applySurf();}
function slate(){const v={img:'',w:16,h:10,dim:bg.dim,ts:Date.now()};mapCol.doc('bg').set(v).catch(()=>{});applyBg(v);}

/* ---------- tokens ---------- */
function tokInfo(t){
 if(t.kind==='hero'){const c=chars.find(x=>x.id===t.ref);const k=c?calc(c):null;
  return{name:(c&&c.name)||t.name||'Hero',col:TOKCOL[colorMap[t.ref]]||TOKCOL.amber,ini:((c&&c.name)||t.name||'?')[0].toUpperCase(),
   hp:c&&!c.dead?[Math.max(0,Math.min(k.hp,c.hpCur==null?k.hp:c.hpCur)),k.hp]:null,dead:!!(c&&c.dead),boss:false};}
 const m=(monsters||[]).find(x=>x.id===t.ref),nm=(m&&m.name)||t.name||'Monster',boss=m?m.kind==='boss':!!t.boss;
 let hp=null;if(m){const h=monHp(m);hp=[Math.max(0,Math.min(h,m.hpCur==null?h:m.hpCur)),h];}
 const ini=(nm.match(/\d+$/)?nm[0]+nm.match(/\d+$/)[0]:nm.slice(0,2)).toUpperCase();
 return{name:nm,col:boss?'#d94c3d':TOKCOL.red,ini,hp,dead:!!(hp&&hp[0]<=0),boss};}
function renderTokens(){
 if(!built)return;B.toks.replaceChildren();
 Object.values(tokens).forEach(t=>{
  const I=tokInfo(t),e=el('div','mtok '+(t.kind==='hero'?'hero':'mon')+(I.boss?' boss':'')+(I.dead?' dead':'')+(selTok===t.id?' sel':'')+(isDM?' cm':mine(t.ref)?' mine':''));
  e.style.left=t.x+'%';e.style.top=t.y+'%';e.style.setProperty('--tc',I.col);e.title=I.name;
  const d=el('div','disc',I.ini),tag=el('div','tag',I.name);e.append(d,tag);
  if(I.hp){const p=I.hp[1]?I.hp[0]/I.hp[1]*100:0,b=el('div','mhp'),i=el('i',p<=30?'low':p<=60?'mid':'');i.style.width=p+'%';b.append(i);e.append(b);}
  if(isDM){const x=el('button','mx','×');x.setAttribute('aria-label','Take '+I.name+' off the map');x.addEventListener('pointerdown',ev=>ev.stopPropagation());
   x.onclick=ev=>{ev.stopPropagation();selTok=null;delete tokens[t.id];renderTokens();renderTray();tokCol.doc(t.id).delete().catch(()=>{});};e.append(x);}
  let st0=null,moved=false;
  e.addEventListener('pointerdown',ev=>{if(ev.target.closest('.mx'))return;ev.stopPropagation();st0=[ev.clientX,ev.clientY];moved=false;if(mine(t.ref)){e.setPointerCapture(ev.pointerId);dragging=t.id;}});
  e.addEventListener('pointermove',ev=>{if(!st0||dragging!==t.id)return;if(Math.hypot(ev.clientX-st0[0],ev.clientY-st0[1])>4)moved=true;if(!moved)return;
   const r=B.board.getBoundingClientRect();t.x=+Math.min(98,Math.max(2,(ev.clientX-r.left)/r.width*100)).toFixed(2);t.y=+Math.min(96,Math.max(4,(ev.clientY-r.top)/r.height*100)).toFixed(2);
   e.style.left=t.x+'%';e.style.top=t.y+'%';});
  const end=()=>{if(!st0)return;const wasDrag=dragging===t.id&&moved;st0=null;dragging=null;
   if(wasDrag){tokCol.doc(t.id).set({...stripId(t),ts:Date.now()}).catch(()=>toast('Could not move that token.'));return;}
   if(isDM){selTok=selTok===t.id?null:t.id;renderTokens();}
   if(isDM||mine(t.ref)){cardFor={kind:t.kind,ref:t.ref};if(cardOpen)renderCard();}};
  e.addEventListener('pointerup',end);e.addEventListener('pointercancel',()=>{st0=null;dragging=null;});
  B.toks.append(e);});}
const stripId=t=>{const{id,...d}=t;return d;};
function place(kind,ref,name,boss,i){
 const n=Object.keys(tokens).length+(i||0),x=kind==='hero'?12+(n%4)*7:62+(n%4)*8,y=kind==='hero'?68+(n%2)*10:28+(n%3)*14;
 const t={ref,kind,name:name||'',boss:!!boss,x,y,ts:Date.now()};tokens[ref]={id:ref,...t};renderTokens();renderTray();
 tokCol.doc(ref).set(t).catch(()=>toast('Could not place that token.'));}
function renderTray(){
 if(!built||!B.tray)return;B.tray.hidden=!isDM;if(!isDM)return;B.tray.replaceChildren();
 const box=(title,list,kind)=>{const w=el('div','tb');w.append(el('small',null,title));const ch=el('div','mchips');
  const off=list.filter(x=>!tokens[x.id]);
  off.forEach(x=>{const I=tokInfo({kind,ref:x.id,name:x.name}),b=el('button');b.style.setProperty('--tc',I.col);b.append(el('i',null,I.ini),I.name+(I.boss?' · boss':''));
   b.onclick=()=>place(kind,x.id,x.name,kind!=='hero'&&x.kind==='boss');ch.append(b);});
  if(!list.length)ch.append(el('span','note',kind==='hero'?'No heroes yet. Add them in the Party tab.':'No monsters yet. Make them in the CM tab.'));
  else if(!off.length)ch.append(el('span','note','All on the map'));
  const r=el('div','row');r.style.flexWrap='wrap';
  r.append(btn('Place all',()=>off.forEach((x,i)=>place(kind,x.id,x.name,kind!=='hero'&&x.kind==='boss',i))),btn('Take all off',()=>{Object.values(tokens).filter(t=>t.kind===kind).forEach(t=>{delete tokens[t.id];tokCol.doc(t.id).delete().catch(()=>{});});renderTokens();renderTray();}));
  w.append(ch,r);return w;};
 B.tray.append(box('Party',chars.filter(c=>!c.dead),'hero'),box('Monsters',monsters||[],'mon'));}

/* ---------- encounter generator (CM): monsters, traps, and cover, sized by the Chapter 8 threat points ---------- */
const FOES={
 fantasy:{m:['Goblin','Kobold','Skeleton','Giant Rat','Cultist','Bandit'],s:['Orc','Hobgoblin','Ghoul','Bandit Brute','Giant Spider','Lizardfolk'],b:['Goblin Chief','Ogre','Bandit Captain','Necromancer','Troll','Wyvern']},
 space:{m:['Drone','Scav','Sentry Bot','Swarmling','Raider','Spore Mite'],s:['Xeno Hunter','Mech Trooper','Void Raider','Turret','Bounty Hunter','Cyborg'],b:['Warlord','Hive Queen','Battle Mech','Pirate Admiral','Rogue AI Core','Star Wyrm']},
 steampunk:{m:['Clockwork Rat','Street Urchin','Soot Imp','Brass Beetle','Factory Thug','Spark Drone'],s:['Automaton','Airship Marine','Steam Golem','Mad Tinkerer','Constable','Tesla Hound'],b:['Iron Colossus','Mad Professor','Airship Admiral','Clockwork King','The Engine Baron','Aether Leviathan']},
 pirate:{m:['Deckhand','Bilge Rat','Powder Monkey','Cutthroat','Gull Swarm','Drowned Sailor'],s:['Boarding Brute','Bosun','Sea Hag','Shark','Marine Sergeant','Smuggler'],b:['Pirate Captain','Kraken','Sea Witch','Ghost Ship Captain','Navy Commodore','Leviathan']},
 horror:{m:['Zombie','Rat Swarm','Cultist','Crawler','Bat Swarm','Shade'],s:['Ghoul','Wraith','Werewolf','Butcher','Mire Hag','Revenant'],b:['Vampire Lord','Abomination','Lich','Witch of the Wood','The Hollow Man','Elder Thing']},
 grit:{m:['Thug','Lookout','Street Punk','Guard Dog','Runner','Goon'],s:['Enforcer','Biker','Hitman','Bruiser','Dirty Cop','Fixer'],b:['Kingpin','Gang Boss','Cartel Lieutenant','Crooked Captain','The Butcher','Underboss']}};
const TRAPS=[['Tripwire darts','Speed'],['Swinging blade','Speed'],['Collapsing floor (Prone)','Speed'],['Poison gas (Poisoned)','Con'],['Lava vent (Burning)','Speed'],['Tear in reality (Stunned)','Luck']];
const COVER=[['tree','#8fdc98'],['rocks','#f1efe6'],['pillar','#f1efe6'],['wall','#f1efe6'],['water','#9fd3f0'],['crates','#f3d77a']];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function addStroke(doc){const id=newId(),s={id,...doc};strokes.push(s);drawStroke(s);drawn.add(id);maxTs=Math.max(maxTs,doc.ts);strokeCol&&strokeCol.doc(id).set(doc).catch(()=>{});}
function shapePts(kind,cx,cy,r){const ar=W/H,pts=[],P=(x,y)=>pts.push([Math.round(Math.max(0,Math.min(U,x))),Math.round(Math.max(0,Math.min(U,y)))]);
 if(kind==='tree'){for(let i=0;i<=26;i++){const a=i/26*6.3;P(cx+Math.cos(a)*r*(.9+Math.random()*.2),cy+Math.sin(a)*r*ar*(.9+Math.random()*.2));}}
 else if(kind==='rocks'){const n=7;for(let i=0;i<=n;i++){const a=i%n/n*6.28,k=.7+Math.random()*.5;P(cx+Math.cos(a)*r*k,cy+Math.sin(a)*r*ar*k);}}
 else if(kind==='pillar'){const h=r*.6;[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].forEach(([a,b])=>P(cx+a*h,cy+b*h*ar));}
 else if(kind==='wall'){const len=r*3,ang=Math.random()*Math.PI;P(cx-Math.cos(ang)*len,cy-Math.sin(ang)*len*ar);P(cx+Math.cos(ang)*len,cy+Math.sin(ang)*len*ar);}
 else if(kind==='water'){for(let i=0;i<=16;i++){const t=i/16;P(cx-r*2+t*r*4,cy+Math.sin(t*12)*r*.25*ar);}}
 else if(kind==='crates'){const h=r*.45;[[-2.2,-1],[0,-1],[0,1],[-2.2,1],[-2.2,-1]].forEach(([a,b])=>P(cx+a*h+h,cy+b*h*ar));[[0,-1],[2.2,-1],[2.2,1],[0,1]].forEach(([a,b])=>P(cx+a*h+h,cy+b*h*ar));}
 return pts.map(p=>p.join(',')).join(';');}
let genArm='',genT=0;
async function genEncounter(diff,b){
 if(!isDM||!monCol)return toast('Only the Core Master can make encounters.');
 if(genArm!==diff){genArm=diff;clearTimeout(genT);renderTools();genT=setTimeout(()=>{genArm='';renderTools();},3500);return;}
 genArm='';clearTimeout(genT);
 const party=chars.filter(c=>!c.dead),n=party.length||4,avg=party.length?Math.max(1,Math.round(party.reduce((a,c)=>a+c.level,0)/party.length)):1;
 const per={easy:1,fair:1.5,hard:2}[diff];let budget=Math.max(1,Math.round(per*n*(avg<=2?.5:1)));const threat=budget;
 const kinds=[];
 if(diff==='hard'&&budget>=4){kinds.push('boss');budget-=4;}else if(diff==='fair'&&budget>=6&&Math.random()<.5){kinds.push('boss');budget-=4;}
 while(budget>0&&kinds.length<8){if(budget>=2&&Math.random()<(diff==='easy'?.35:.65)){kinds.push('standard');budget-=2;}else{kinds.push('minion');budget-=1;}}
 const F=FOES[skin==='core'||skin==='coredark'||skin==='fantasydark'?'fantasy':skin==='gritdark'?'grit':skin]||FOES.fantasy,mName=pick(F.m),sNames=F.s.slice().sort(()=>Math.random()-.5);
 let mi=0,si=0;const made=[];
 // clear the last generated encounter: its monsters, the chalk, and monster tokens
 (monsters||[]).filter(m=>m.gen).forEach(m=>{monCol.doc(m.id).delete().catch(()=>{});initCol&&initCol.doc('m'+m.id).delete().catch(()=>{});});
 Object.values(tokens).filter(t=>t.kind!=='hero').forEach(t=>{delete tokens[t.id];tokCol.doc(t.id).delete().catch(()=>{});});
 strokes.map(s=>s.id).forEach(id=>strokeCol.doc(id).delete().catch(()=>{}));strokes=[];redrawAll();
 const spots=[],free=(x,y)=>spots.every(([a,c])=>Math.hypot(a-x,(c-y)*.6)>9);
 const spot=(x0,x1,y0,y1)=>{for(let i=0;i<40;i++){const x=x0+Math.random()*(x1-x0),y=y0+Math.random()*(y1-y0);if(free(x,y)){spots.push([x,y]);return[x,y];}}const x=x0+Math.random()*(x1-x0),y=y0+Math.random()*(y1-y0);spots.push([x,y]);return[x,y];};
 // heroes on the left
 party.forEach(c=>{if(tokens[c.id]){spots.push([tokens[c.id].x,tokens[c.id].y]);return;}const[x,y]=spot(5,20,15,88),t={ref:c.id,kind:'hero',name:c.name||'',boss:false,x:+x.toFixed(2),y:+y.toFixed(2),ts:Date.now()};tokens[c.id]={id:c.id,...t};tokCol.doc(c.id).set(t).catch(()=>{});});
 kinds.forEach((k,i)=>{
  const name=k==='boss'?pick(F.b):k==='standard'?sNames[si++%sNames.length]:mName+' '+(++mi);
  const lvl=Math.max(1,Math.min(99,avg+(k==='minion'?-1:0)+(diff==='hard'&&k!=='minion'?1:0)));
  const m={...genMon(name,lvl,k,k==='boss'?3:0),gen:true,ts:Date.now()+i},id='m'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5);
  monCol.doc(id).set(m).catch(()=>{});made.push({...m,id});
  const[x,y]=spot(62,93,12,88),t={ref:id,kind:'mon',name,boss:k==='boss',x:+x.toFixed(2),y:+y.toFixed(2),ts:Date.now()};
  tokens[id]={id,...t};tokCol.doc(id).set(t).catch(()=>{});});
 // cover and terrain in the middle
 let ts=Date.now();const nc=3+Math.floor(Math.random()*3);
 for(let i=0;i<nc;i++){const[kind,col]=pick(COVER),[x,y]=spot(26,56,14,86),cx=x*100,cy=y*100,r=kind==='wall'?380:kind==='water'?520:kind==='tree'?420:360;
  addStroke({t:'c',c:col,s:kind==='wall'?24:10,p:shapePts(kind,cx,cy,r),ts:ts++,by:me||'local'});
  if(kind==='tree')addStroke({t:'c',c:col,s:6,p:shapePts('tree',cx,cy,r*.4),ts:ts++,by:me||'local'});
  addStroke({t:'x',c:col,s:30,p:Math.round(cx-300)+','+Math.round(Math.min(9600,cy+r*W/H+260)),txt:kind,ts:ts++,by:me||'local'});}
 // traps
 const nt=diff==='easy'?(Math.random()<.5?1:0):diff==='fair'?1:2,tier=Math.min(6,Math.max(1,Math.ceil(avg/5))+(diff==='hard'?1:0)),traps=[];
 for(let i=0;i<nt;i++){const tt=Math.min(6,Math.max(1,tier-(i?1:0))),[tn,st]=TRAPS[tt-1],[x,y]=spot(32,52,18,82),cx=x*100,cy=y*100,d=170,ar=W/H;
  addStroke({t:'c',c:'#e8705f',s:12,p:[[cx-d,cy-d*ar],[cx+d,cy+d*ar]].map(p=>p.map(Math.round).join(',')).join(';'),ts:ts++,by:me||'local'});
  addStroke({t:'c',c:'#e8705f',s:12,p:[[cx+d,cy-d*ar],[cx-d,cy+d*ar]].map(p=>p.map(Math.round).join(',')).join(';'),ts:ts++,by:me||'local'});
  addStroke({t:'x',c:'#e8705f',s:28,p:Math.round(Math.max(200,cx-1400))+','+Math.round(Math.min(9600,cy+d*ar+300)),txt:tn+' T'+tt+' · '+tt+'d6 · '+st,ts:ts++,by:me||'local'});traps.push(tn);}
 const D=diff[0].toUpperCase()+diff.slice(1);
 addStroke({t:'x',c:'#f2a3b8',s:40,p:'300,500',txt:D+' encounter · '+threat+' threat · level '+avg+(party.length?'':' (no party yet: sized for 4)'),ts:ts++,by:me||'local'});
 renderTokens();renderTray();summary();
 toast(D+' encounter: '+made.map(m=>m.name).join(', ')+(traps.length?' · '+traps.length+' trap'+(traps.length>1?'s':''):''));}

/* ---------- toolbar ---------- */
function setTool(t){tool=t;if(t!=='text')closeText(true);if(B.board){B.board.classList.toggle('draw',t!=='select');B.board.classList.toggle('erase',t==='erase');B.board.classList.toggle('text',t==='text');}renderTools();}
function renderTools(){
 if(!built)return;const T=B.tools;T.replaceChildren();
 if(!canDraw()&&tool!=='select'){tool='select';B.board.classList.remove('draw','erase','text');}
 T.hidden=!canDraw();if(!canDraw())return;
 const g=(lab,...k)=>{const d=el('div','g');if(lab)d.append(el('small',null,lab));d.append(...k);return d;};
 const tb=(t,l)=>{const b=btn(l,()=>setTool(t),'ghost sm'+(tool===t?' on':''));b.setAttribute('aria-pressed',tool===t);return b;};
 T.append(g('Tool',tb('select','Select'),tb('chalk','Draw'),tb('erase','Eraser'),...(isDM?[tb('text','Text')]:[])));
 T.append(g('Color',...CHALK.map(([c,n])=>{const b=btn('',()=>{color=c;if(tool==='select'||tool==='erase')setTool('chalk');else renderTools();},'msw'+(color===c?' on':''));b.style.background=ink(c);b.setAttribute('aria-label',n);b.setAttribute('aria-pressed',color===c);return b;})));
 T.append(g('Size',...[[6,'Thin'],[12,'Mid'],[24,'Fat']].map(([s,l])=>{const b=btn(l,()=>{size=s;renderTools();},'ghost sm'+(size===s?' on':''));b.setAttribute('aria-pressed',size===s);return b;})));
 if(isDM){
  const lab=el('label','fbtn','Map image…'),fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.id='mapfile';fi.onchange=()=>{setImage(fi.files[0]);fi.value='';};lab.append(fi);
  const kids=[lab];
  if(bg.img){kids.push(btn('No image',slate));B.dim=B.dim||document.createElement('input');const dm=B.dim;dm.type='range';dm.min=0;dm.max=80;dm.value=bg.dim;dm.id='mapdim';dm.setAttribute('aria-label','Dim the map image');
   dm.oninput=()=>drawBg();dm.onchange=()=>{bg.dim=+dm.value;mapCol.doc('bg').set({...bg,ts:Date.now()}).catch(()=>{});};kids.push(el('small',null,'Dim'),dm);}
  T.append(g('Board',...SURF.map(([v,l])=>{const b=btn(l,()=>setSurf(v),'ghost sm'+(surf()===v?' on':''));b.setAttribute('aria-pressed',surf()===v);return b;}),...kids));
  const w=btn('Wipe board',()=>wipe(w),'sm dmg');
  const lb=el('label','chk'),cb=document.createElement('input');cb.type='checkbox';cb.id='mapdraw';cb.checked=!!mstate.draw;cb.onchange=()=>{mstate.draw=cb.checked;saveState();};lb.append(cb,document.createTextNode('Players can draw'));
  T.append(g('',btn('Undo',undo),w,lb));
  T.append(g('New encounter',...['easy','fair','hard'].map(d=>{const b=btn(genArm===d?'Tap again':d[0].toUpperCase()+d.slice(1),()=>genEncounter(d,b),'sm'+(genArm===d?' dmg':' rb'));b.title='Replaces the chalk and the last generated monsters';return b;})));
  T.append(el('div','minfo',bg.img?'Map '+bg.w+' × '+bg.h+' px · the board takes the picture\'s shape':'No image · any picture size works, the board reshapes to match it'));
 }else T.append(g('',btn('Undo my last line',undo)));}

/* ---------- full screen (in-person play on a tablet or TV) ---------- */
let full=false,big=true,showTools=false,wake=null;
function renderView(){if(!B.view)return;const V=B.view;V.replaceChildren();
 if(!full){V.append(btn('⛶ Full screen',()=>setFull(true),'ghost sm'));V.append(el('small','minfo','For a tablet or TV on the table: big tokens and text, nothing else on screen.'));return;}
 V.append(el('span','ttl','🗺️ Map'),el('span','sp'));
 const bb=btn('🔠 Big text',()=>{big=!big;try{localStorage.setItem('boommapbig',big?'1':'0')}catch{}B.wrap.classList.toggle('big',big);renderView();},'ghost sm'+(big?' on':''));bb.setAttribute('aria-pressed',big);V.append(bb);
 if(canDraw()){const tb=btn('✏️ Tools',()=>{showTools=!showTools;B.wrap.classList.toggle('tools',showTools);renderView();},'ghost sm'+(showTools?' on':''));tb.setAttribute('aria-pressed',showTools);V.append(tb);}
 V.append(btn('✕ Exit',()=>setFull(false),'sm rb'));}
async function setFull(v,fromBrowser){if(v===full)return;full=v;
 try{big=localStorage.getItem('boommapbig')!=='0'}catch{}
 B.wrap.classList.toggle('mfull',v);B.wrap.classList.toggle('big',v&&big);B.wrap.classList.toggle('tools',v&&showTools);document.body.classList.toggle('mapfull',v);
 renderView();
 const fe=document.fullscreenElement||document.webkitFullscreenElement;
 if(v){const rq=B.wrap.requestFullscreen||B.wrap.webkitRequestFullscreen;if(rq&&!fe){try{await rq.call(B.wrap);}catch{}}
  try{if(navigator.wakeLock)wake=await navigator.wakeLock.request('screen');}catch{}}
 else{if(!fromBrowser&&fe){const ex=document.exitFullscreen||document.webkitExitFullscreen;try{await ex.call(document);}catch{}}
  try{if(wake)await wake.release();}catch{}wake=null;}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&full&&!cardOpen&&!(document.fullscreenElement||document.webkitFullscreenElement))setFull(false);});
document.addEventListener('visibilitychange',async()=>{if(full&&document.visibilityState==='visible'&&navigator.wakeLock){try{wake=await navigator.wakeLock.request('screen');}catch{}}});

/* ---------- roll card (uses the table theme) ---------- */
function cardTargets(){
 const heroes=chars.filter(c=>isDM||c.id===myHero).map(c=>({kind:'hero',ref:c.id,name:c.name||'Unnamed'}));
 const mons=isDM?(monsters||[]).map(m=>({kind:'mon',ref:m.id,name:m.name})):[];
 return{heroes,mons};}
function rollLast(r){if(r){last={who:r.who,total:r.total,booms:r.booms,col:r.col};}}
function renderCard(){
 const C=B.card;if(!C)return;
 if(C.contains(document.activeElement)&&document.activeElement.tagName==='INPUT')return;
 C.replaceChildren();C.className='card pc mrc';C.style.removeProperty('--cc');
 const{heroes,mons}=cardTargets(),all=[...heroes,...mons];
 if(!cardFor||!all.some(x=>x.ref===cardFor.ref))cardFor=all.find(x=>x.ref===myHero)||all[0]||null;
 const h=el('div','pch'),close=btn('✕',()=>openCard(false),'ghost sm');close.setAttribute('aria-label','Close roll card');
 if(!cardFor){h.append(el('b','pn','Roll card'),close);C.append(h,el('div','note',isDM?'Add heroes in the Party tab or monsters in the CM tab first.':'Tap 🙋 This is me on your hero in the Party tab, then your roll card shows up here.'));return;}
 const sel=document.createElement('select');sel.id='mrcwho';sel.setAttribute('aria-label','Whose roll card');
 if(heroes.length){const og=document.createElement('optgroup');og.label='Party';heroes.forEach(x=>og.append(new Option(x.name,'hero:'+x.ref)));sel.append(og);}
 if(mons.length){const og=document.createElement('optgroup');og.label='Monsters';mons.forEach(x=>og.append(new Option(x.name,'mon:'+x.ref)));sel.append(og);}
 sel.value=cardFor.kind+':'+cardFor.ref;sel.disabled=all.length<2;sel.onchange=()=>{const[k,r]=sel.value.split(':');cardFor={kind:k,ref:r};renderCard();};
 const any=(who,col)=>{const r=el('div','row'),i=document.createElement('input');i.id='mrcexpr';i.placeholder='2d6+3';i.autocomplete='off';i.setAttribute('autocapitalize','off');i.spellcheck=false;i.setAttribute('aria-label','Any roll');i.enterKeyHint='go';
  const go=()=>{const v=i.value.replace(/\s+/g,'');if(!parse(v))return toast('Try something like 3d6+2, d20, or 2d8+1d4-1');rollLast(doRoll(v,who,null,false,col));i.blur();renderCard();};
  i.addEventListener('keydown',e=>{if(e.key==='Enter')go();});r.append(i,btn('Roll',go,'rb'));return r;};
 const lastEl=()=>last?(()=>{const d=el('div','mlast');d.append('Last roll: '+last.who+' ');d.append(el('b',null,String(last.total)));if(last.booms)d.append(' 💥×'+last.booms);return d;})():el('div','mlast','Rolls land in the dice log below for the whole table.');
 const wrap=fn=>(...a)=>{rollLast(fn(...a));renderCard();};
 if(cardFor.kind==='hero'){
  const c=chars.find(x=>x.id===cardFor.ref),k=calc(c),cc=cvar(colorMap[c.id]);if(cc){C.classList.add('colored');C.style.setProperty('--cc',cc);}
  h.append(sel,el('span','lv','Lv '+c.level));if(!c.dead)h.append(btn('🎲 Init',()=>{rollInit(c);last=null;renderCard();},'sm rb'));h.append(close);C.append(h);
  C.append(hpBox(c,k));
  C.append(chipRow(STATS.map(([key,lab])=>[key,lab,eff(c,key)]),(()=>{const A=arm(c);return A.p+A.m;})(),c.name,colorMap[c.id]||'',!!c.dead));
  C.append(el('div','note','Move '+k.mv+' · '+k.na+' action'+(k.na>1?'s':'')+' per turn · Phys '+(k.pd>0?'+':'')+k.pd+' · Magic '+(k.md>0?'+':'')+k.md));
  const list=atks(c);C.append(el('div','sec','Attacks · Abilities'));
  for(const p of ['w','w2']){if(!((c[p+'N']||'').trim()||slotItem(c,p)))continue;const lab=(EQ.find(x=>x[0]===p)||[0,'Weapon'])[1],w=wpn(c,k,p),r=el('div','at'),g=btn('🗡 '+(((c[p+'N']||'').trim())||lab),wrap(()=>doRoll(w.ex,c.name+' · '+(((c[p+'N']||'').trim())||lab),null,true,colorMap[c.id])),'atkb rb');g.append(el('small',null,w.ex));r.append(g);C.append(r);}
  if(bothOk(c)){const a=wpn(c,k,'w'),b2=wpn(c,k,'w2'),ex=(a.n+b2.n)+'d'+a.die+(a.bn>0?'+'+a.bn:a.bn<0?String(a.bn):''),r=el('div','at'),g=btn('🗡 Both hands',wrap(()=>doRoll(ex,c.name+' · Both hands',null,true,colorMap[c.id])),'atkb rb');g.append(el('small',null,ex));r.append(g);C.append(r);}
  list.forEach(a=>{const bo=a.t==='p'?k.pd:a.t==='m'?k.md:eff(c,BT[a.t]||'str'),ex=a.e+(bo>0?'+'+bo:bo<0?String(bo):''),r=el('div','at'),g=btn('⚔ '+a.n,wrap(()=>doRoll(ex,c.name+' · '+a.n,null,a.t==='p'||a.t==='m',colorMap[c.id])),'atkb rb');g.append(el('small',null,'T'+(a.r||1)+' · '+ex+(TI[a.t]?' '+TI[a.t]:'')));r.append(g);C.append(r);});
  if(!list.length&&!C.querySelector('.atkb'))C.append(el('div','note','No weapons or abilities yet.'));
  C.append(any(c.name,colorMap[c.id]));
 }else{
  const m=(monsters||[]).find(x=>x.id===cardFor.ref),hp=monHp(m),cur=Math.max(0,Math.min(hp,m.hpCur==null?hp:m.hpCur));
  h.append(sel,el('span','lv','Lv '+m.level+(m.kind==='boss'?' · Boss':m.kind==='minion'?' · Minion':'')),btn('🎲 Init',()=>{rollMonInit(m);last=null;renderCard();},'sm rb'),close);C.append(h);
  const hb=el('div','hpb');hb.append(el('b',null,cur<=0?'☠ Defeated':'HP '+cur+' / '+hp));const bar=el('div','bar'),fill=el('div','fill'+(cur<=hp*.25?' low':''));fill.style.width=(hp?cur/hp*100:0)+'%';bar.append(fill);hb.append(bar);
  const r=el('div','row hpc'),n=document.createElement('input');n.type='number';n.min=1;n.placeholder='Amount';n.inputMode='numeric';n.id='mrcamt';const amt=()=>Math.max(0,Math.floor(+n.value)||0);
  r.append(n,btn('Dmg',()=>{const a=amt();if(!a)return;const nc=Math.max(0,cur-a);putM(m,{hpCur:nc});if(nc===0&&cur>0){toast(m.name+' is defeated');logEvent('☠ '+m.name+' is defeated');}n.blur();renderCard();renderTokens();},'sm dmg'),
   btn('Heal',()=>{const a=amt();if(a)putM(m,{hpCur:Math.min(hp,cur+a)});n.blur();renderCard();renderTokens();},'sm heal'),btn('Full',()=>{putM(m,{hpCur:hp});renderCard();renderTokens();}));hb.append(r);C.append(hb);
  C.append(chipRow(STATS.map(([key,lab])=>[key,lab,+m[key]||0]),m.armor||0,m.name,'',cur<=0));
  C.append(el('div','note','Move '+(5+m.level+m.spd)+' · '+(1+Math.floor(m.spd/4))+' action'+(m.spd>=4?'s':'')+' per turn'));
  C.append(el('div','sec','Attacks · Abilities'));
  [['⚔ Melee',(m.mel||'2d6')+(m.str>0?'+'+m.str:'')],['🏹 Ranged',(m.rng||'2d4')+(m.int>0?'+'+m.int:'')]].filter(x=>!(x[0]==='🏹 Ranged'&&m.rng==='')).forEach(([t,ex])=>{const a=el('div','at'),g=btn(t,wrap(()=>doRoll(ex,m.name+' · '+t.slice(2))),'atkb rb');g.append(el('small',null,ex));a.append(g);C.append(a);});
  mAbs(m).forEach(a=>{const bo=m[BT[a.t]||'str'],ex=a.e+(bo>0?'+'+bo:''),w=el('div','at'),g=btn('⚔ '+a.n,wrap(()=>doRoll(ex,m.name+' · '+a.n)),'atkb rb');g.append(el('small',null,ex+(TI[a.t]?' '+TI[a.t]:'')));w.append(g);C.append(w);});
  C.append(any(m.name,''));
 }
 C.append(lastEl());}
function chipRow(vals,armor,who,col,off){
 const w=el('div','stc');
 for(const[key,lab,v]of vals){const b=btn('',()=>{const n=Math.max(1,v);rollLast(doRoll(n+'d6',who+' · '+lab,[{sign:1,n,s:6,no:v<1}],false,col));renderCard();},'');
  b.append(el('small',null,SHORT[key]),String(v));b.title=lab+' · tap to roll';b.disabled=off;w.append(b);}
 const a=el('span','arm');a.append(el('small',null,'ARM'),String(armor));w.append(a);return w;}
function openCard(v){cardOpen=v;if(!B.card)return;B.card.hidden=!v;B.rcb.setAttribute('aria-expanded',v);if(v)renderCard();else B.rcb.focus();}

/* ---------- build ---------- */
function build(){
 if(built)return;built=true;const body=document.getElementById('mapbody');
 B.tools=el('div','mtools');B.tools.setAttribute('role','toolbar');B.tools.setAttribute('aria-label','Map tools');
 const fr=el('div','mframe s-'+surf());B.frame=fr;B.board=el('div','mboard');B.bg=document.createElement('canvas');B.ink=document.createElement('canvas');B.bg.width=B.ink.width=W;B.bg.height=B.ink.height=H;
 B.toks=el('div','mtoks');
 B.rcb=el('button','mrcbtn');B.rcb.type='button';B.rcb.setAttribute('aria-label','Open roll card');B.rcb.setAttribute('aria-expanded','false');B.rcb.setAttribute('aria-controls','mrcard');
 B.rcb.innerHTML=`<svg viewBox="-9 -25 146 146" aria-hidden="true">${MARK}</svg>`;B.rcb.onclick=()=>openCard(!cardOpen);
 B.board.append(B.bg,B.ink,B.toks,B.rcb);fr.append(B.board);
 B.tray=el('div','mtray');
 B.card=el('section','card pc mrc');B.card.id='mrcard';B.card.hidden=true;B.card.setAttribute('aria-label','Roll card');document.body.append(B.card);
 B.view=el('div','mview');B.wrap=el('div','mwrap');B.wrap.append(B.view,B.tools,fr);
 body.append(B.wrap,B.tray);renderView();
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&full)setFull(false,true);});document.addEventListener('webkitfullscreenchange',()=>{if(!document.webkitFullscreenElement&&full)setFull(false,true);});
 ctx=B.ink.getContext('2d');bctx=B.bg.getContext('2d',{willReadFrequently:true});
 B.board.addEventListener('pointerdown',down);B.board.addEventListener('pointermove',move);B.board.addEventListener('pointerup',up);B.board.addEventListener('pointercancel',up);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cardOpen)openCard(false);});
 sizeBoard();drawBg();if(bg.img)loadImg();redrawAll();renderTools();renderTokens();renderTray();
 // chalk text needs the chalk font, so draw again once it has loaded
 if(document.fonts&&document.fonts.load)Promise.all([document.fonts.load('700 40px "Cabin Sketch"'),document.fonts.load('40px "Permanent Marker"')]).then(()=>redrawAll()).catch(()=>{});
}
function summary(){const s=document.getElementById('mapsum');if(!s)return;const n=Object.keys(tokens).length;s.textContent=(bg.img?'Map image':surf()==='glow'?'Glow screen':surf()==='marker'?'Whiteboard':'Chalkboard')+(n?' · '+n+' token'+(n>1?'s':''):'');}

window.mapRefresh=function(){summary();if(!built)return;renderTools();renderView();renderTokens();renderTray();if(cardOpen)renderCard();};
window.mapInit=function(){
 if(mapCol)return;
 if(!db)return;
 mapCol=db.collection('map');strokeCol=db.collection('mapstrokes');tokCol=db.collection('maptokens');
 mapCol.onSnapshot(s=>{const b=s.docs.find(d=>d.id==='bg'),st=s.docs.find(d=>d.id==='state');const os=surf();mstate={draw:!!(st&&st.data().draw),surf:(st&&st.data().surf)||'chalk'};if(os!==surf())applySurf();applyBg(b?b.data():{});summary();if(built){renderTools();}});
 strokeCol.onSnapshot(s=>{syncStrokes(s.docs.map(d=>({id:d.id,...d.data()})));});
 tokCol.onSnapshot(s=>{const nt={};s.docs.forEach(d=>{nt[d.id]={id:d.id,...d.data()};});if(dragging&&tokens[dragging])nt[dragging]=tokens[dragging];tokens=nt;summary();renderTokens();renderTray();});
};
const box=document.getElementById('mapbox');
if(box){let o=false;try{o=localStorage.getItem('boommapopen')==='1'}catch{}box.open=o;if(o)build();
 box.addEventListener('toggle',()=>{try{localStorage.setItem('boommapopen',box.open?'1':'0')}catch{}if(box.open){build();window.mapRefresh();}else if(cardOpen)openCard(false);});}
summary();
if(window.mapPending)window.mapInit();
})();
