import React,{useState,useEffect,useRef} from 'react';
import htm from 'htm';
const html=htm.bind(React.createElement);
const GAMED={e:{target:3,dropMax:16},n:{target:5,dropMax:14},h:{target:7,dropMax:12}},LV=[['e','Easy'],['n','Normal'],['h','Hard']];
const THEMES={
 classic:{name:'Classic',v:{'--bgg':'linear-gradient(#091a0d,#060e08)','--felt':'#091a0d','--gold':'#f0c040','--ink':'#f3efe2','--t1':'#14634f','--t2':'#0c4638','--edge':'#07261f','--surf':'#07261f','--btn':'#e8d8a0','--btnk':'#143','--alt':'#1d5c4e','--altbd':'#3a8070','--cbg':'#fffdf6','--cbd':'#bbb','--blk':'#111','--red':'#c4161c','--b1':'#7a1f2b','--b2':'#5d1520','--bbd':'#e9d9a6','--ovb':'rgba(8,40,33,.97)'}},
 bright:{name:'Bright',v:{'--bgg':'linear-gradient(#1a2a4a,#2a1a3a)','--felt':'#1a2a4a','--gold':'#64b4ff','--ink':'#eaf3ff','--t1':'#2f5a9a','--t2':'#26407a','--edge':'#14203a','--surf':'#16223f','--btn':'#bcd9ff','--btnk':'#0d2040','--alt':'#2a3f6b','--altbd':'#4a6aa8','--cbg':'#fbfdff','--cbd':'#b8c4d8','--blk':'#16213a','--red':'#d32f2f','--b1':'#3f51b5','--b2':'#303f9f','--bbd':'#c5cae9','--ovb':'rgba(20,28,58,.97)'}},
 neon:{name:'Neon',v:{'--bgg':'linear-gradient(#0a0015,#000510)','--felt':'#0a0015','--gold':'#00ffcc','--ink':'#e6fff9','--t1':'#140a30','--t2':'#070318','--edge':'#00a98a','--surf':'#0d0820','--btn':'#00ffcc','--btnk':'#02101a','--alt':'#1a0f3a','--altbd':'#00a98a','--cbg':'#0c0a1e','--cbd':'#00ffcc','--blk':'#d9fff6','--red':'#ff4d9d','--b1':'#2b0a5e','--b2':'#1a0640','--bbd':'#00ffcc','--ovb':'rgba(5,0,15,.97)'}}};
const CFG={hand:5,tonk:[49,50],pts:{tonk:2,out:2,drop:1,caught:2}};
const SU=['♠','♥','♦','♣'],RK=['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
const val=c=>Math.min(c.r,10),tot=h=>h.reduce((a,c)=>a+val(c),0),red=c=>c.s==='♥'||c.s==='♦',lab=c=>RK[c.r-1]+c.s;
function deck(){const d=[];SU.forEach(s=>{for(let r=1;r<=13;r++)d.push({id:r+s,r,s})});return d}
function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const isSet=c=>c.length>=3&&c.length<=4&&c.every(x=>x.r===c[0].r)&&new Set(c.map(x=>x.s)).size===c.length;
const isRun=c=>{if(c.length<3||!c.every(x=>x.s===c[0].s))return false;const r=c.map(x=>x.r).sort((a,b)=>a-b);return r.every((x,i)=>i===0||x===r[i-1]+1)};
const meld=c=>isSet(c)||isRun(c);
const sortRun=c=>c[0].r===c[1].r?c:[...c].sort((a,b)=>a.r-b.r);
const canHit=(sp,c)=>{if(sp[0].r===sp[1].r)return c.r===sp[0].r&&sp.length<4&&!sp.some(x=>x.s===c.s);
  return c.s===sp[0].s&&(c.r===sp[0].r-1||c.r===sp[sp.length-1].r+1)};
const setHand=(s,i,h)=>s.players.map((p,k)=>k===i?{hand:h}:p);
const nx=s=>(s.active+1)%s.players.length;
function endRound(s,w,why,pts){const sc=[...s.scores];if(w!==null)sc[w]+=pts;return{...s,scores:sc,phase:'roundEnd',plan:{},result:{w,why,pts:w===null?0:pts}}}
function byLow(s,why){const t=s.players.map(p=>tot(p.hand)),m=Math.min(...t),w=t.map((x,i)=>x===m?i:-1).filter(i=>i>=0);
  return w.length>1?endRound(s,null,why+' — tie, no score',0):endRound(s,w[0],why,1)}
function newRound(seats,scores,dealer,rules,rng){const n=seats.length,d=shuffle(deck(),rng),H=seats.map(()=>d.splice(0,CFG.hand)),top=d.pop();
  const s={v:3,rules,seats,scores,dealer,active:(dealer+1)%n,phase:'handoff',players:H.map(hand=>({hand})),stock:d,discard:[top],spreads:[],drew:null,plan:{},log:['New round dealt. Opening discard: '+lab(top)],msg:'',result:null,sid:0,frozen:seats.map(()=>false)};
  const w=H.map((h,i)=>CFG.tonk.includes(tot(h))?i:-1).filter(i=>i>=0);
  if(w.length===1)return endRound(s,w[0],seats[w[0]].name+' was dealt Tonk!',CFG.pts.tonk);
  if(w.length>1)return endRound(s,null,'Several players were dealt Tonk — no score',0);
  return s}
const ack=s=>s.phase==='handoff'?{...s,phase:'draw'}:s;
function draw(s,src){if(s.phase!=='draw')return s;const me=s.active;let st=s.stock,di=s.discard,c;
  if(src==='stock'){if(!st.length)return{...s,msg:'Stock is empty.'};st=[...st];c=st.pop()}else{if(!di.length)return{...s,msg:'Discard pile is empty.'};di=[...di];c=di.pop()}
  return{...s,players:setHand(s,me,[...s.players[me].hand,c]),stock:st,discard:di,phase:'plan',drew:src==='discard'?c.id:null,msg:'Drew '+lab(c)+'. Tag your cards, then press Go.'}}
function drop(s){const me=s.active,t=s.players.map(p=>tot(p.hand));if(s.phase!=='draw'||t[me]>s.rules.dropMax||s.frozen[me])return s;
  const o=t.map((x,i)=>i===me?Infinity:x),m=Math.min(...o);
  return t[me]<m?endRound(s,me,s.seats[me].name+' dropped with the lowest hand',CFG.pts.drop):endRound(s,o.indexOf(m),s.seats[me].name+'’s drop was caught',CFG.pts.caught)}
function check(s){const hand=s.players[s.active].hand,E=[],ids=new Map(hand.map(c=>[c.id,c])),G={},H=[],D=[];
  for(const[id,a]of Object.entries(s.plan)){const c=ids.get(id);if(!c)continue;if(a.t==='s')(G[a.g]=G[a.g]||[]).push(c);else if(a.t==='h')H.push({c,a});else D.push(c)}
  const spreads=[];
  for(const[g,cs]of Object.entries(G)){if(meld(cs))spreads.push(sortRun(cs));else E.push(`Group ${g} (${cs.map(lab).join(' ')}) must be 3–4 of a kind or a 3+ same-suit run.`)}
  const sp=new Map(s.spreads.map(x=>[x.id,x.cards])),hits=[];
  H.sort((x,y)=>x.a.n-y.a.n);
  for(const{c,a}of H){const t=sp.get(a.sp);if(!t){E.push(`Hit ${lab(c)}: target spread is gone.`);continue}
    if(!canHit(t,c)){E.push(`${lab(c)} doesn’t fit the spread you chose (${t.map(lab).join(' ')}).`);continue}
    sp.set(a.sp,sortRun([...t,c]));hits.push({c,sp:a.sp})}
  if(s.frozen[s.active]&&(Object.keys(G).length||H.length))E.push('❄ You’re frozen: you can only draw and discard this turn.');
  if(D.length>1)E.push('Only one discard is allowed.');
  const left=hand.length-(Object.values(G).flat().length+H.length+D.length);
  if(left>0&&!D.length)E.push('Choose one card to discard.');
  if(D[0]&&D[0].id===s.drew)E.push('You can’t discard the card you took from the discard pile.');
  return{ok:!E.length,E,spreads,sp,hits,disc:D[0]||null}}
function execute(s){if(s.phase!=='plan')return s;const r=check(s);if(!r.ok)return{...s,msg:'Fix the plan first.'};
  const me=s.active,used=new Set(Object.keys(s.plan)),hand=s.players[me].hand.filter(c=>!used.has(c.id));
  let sid=s.sid;const spreads=s.spreads.map(x=>({...x,cards:r.sp.get(x.id)}));
  r.spreads.forEach(cs=>spreads.push({id:'p'+(++sid),owner:me,cards:cs}));
  const nm=s.seats[me].name,log=[],fz=[...s.frozen];fz[me]=false;
  if(r.spreads.length)log.push(`${nm} laid ${r.spreads.map(c=>c.map(lab).join(' ')).join(' | ')}.`);
  r.hits.forEach(h=>{const o=s.spreads.find(x=>x.id===h.sp).owner;log.push(`${nm} hit ${lab(h.c)} on ${o===me?'their own':s.seats[o].name+'’s'} spread.`);
    if(o!==me&&!fz[o]){fz[o]=true;log.push(`❄ ${s.seats[o].name} is frozen for their next turn!`)}});
  if(r.disc)log.push(`${nm} discarded ${lab(r.disc)}.`);
  if(!log.length)log.push(nm+' played.');
  const n={...s,players:setHand(s,me,hand),spreads,sid,discard:r.disc?[...s.discard,r.disc]:s.discard,plan:{},drew:null,log:[...s.log,...log].slice(-14),msg:'',frozen:fz};
  if(!hand.length)return endRound(n,me,nm+' emptied their hand',CFG.pts.out);
  if(!n.stock.length)return byLow(n,'Stock ran out — lowest hand wins');
  return{...n,active:nx(s),phase:'handoff'}}
const setPlan=(s,id,a)=>{const p={...s.plan};if(a&&a.t==='d')for(const k in p)if(p[k].t==='d')delete p[k];if(a)p[id]=a;else delete p[id];return{...s,plan:p,msg:''}};
/* ---------- COMPUTER PLAYER ---------- */
function cpuPlan(s){const me=s.active,hand=s.players[me].hand,plan={},used=new Set(),GL='ABCD',lvl=s.seats[me].lvl;let g=0;
  const put=(cs,a)=>cs.forEach(c=>{plan[c.id]=a;used.add(c.id)});
  if(!s.frozen[me]){
    const byR={};hand.forEach(c=>(byR[c.r]=byR[c.r]||[]).push(c));
    Object.values(byR).filter(a=>a.length>=3).forEach(a=>{if(g<4)put(a.slice(0,4),{t:'s',g:GL[g++]})});
    SU.forEach(su=>{let run=[];const flush=()=>{if(run.length>=3&&g<4)put(run,{t:'s',g:GL[g++]});run=[]};
      hand.filter(c=>c.s===su&&!used.has(c.id)).sort((a,b)=>a.r-b.r).forEach(c=>{if(run.length&&c.r!==run[run.length-1].r+1)flush();run.push(c)});flush()});
    const sp=new Map(s.spreads.map(x=>[x.id,x.cards]));let n=0,ch=true;
    while(ch){ch=false;for(const c of hand){if(used.has(c.id)||(lvl==='e'&&Math.random()<.5))continue;for(const[id,cs]of sp)if(canHit(cs,c)){plan[c.id]={t:'h',sp:id,n:n++};used.add(c.id);sp.set(id,sortRun([...cs,c]));ch=true;break}}}}
  if(hand.some(c=>!used.has(c.id))){const cand=hand.filter(c=>!used.has(c.id)&&c.id!==s.drew).sort((a,b)=>val(b)-val(a));let d=cand[0];
    if(lvl==='e'&&cand.length&&Math.random()<.4)d=cand[Math.floor(Math.random()*cand.length)];
    if(lvl==='h'){const conn=c=>hand.some(o=>o.id!==c.id&&!used.has(o.id)&&(o.r===c.r||(o.s===c.s&&Math.abs(o.r-c.r)<=2)));d=cand.find(c=>!conn(c))||cand[0]}
    if(d)plan[d.id]={t:'d'}}
  return plan}
function cpuTurn(s){s=ack(s);const me=s.active,hand=s.players[me].hand,top=s.discard[s.discard.length-1];
  const lvl=s.seats[me].lvl,dt=lvl==='e'?5:lvl==='h'?s.rules.dropMax-3:8;if(!s.frozen[me]&&tot(hand)<=dt)return drop(s);
  const pairs=[];for(let i=0;i<hand.length;i++)for(let j=i+1;j<hand.length;j++)pairs.push([hand[i],hand[j]]);
  const useful=top&&!s.frozen[me]&&(s.spreads.some(x=>canHit(x.cards,top))||pairs.some(p=>meld([top,...p])));
  let t=draw(s,(useful&&(lvl!=='e'||Math.random()<.5))||!s.stock.length?'discard':'stock');
  if(t.phase!=='plan')return byLow(t,'Stalemate');
  t={...t,plan:cpuPlan(t)};
  if(!check(t).ok){const h=t.players[me].hand.filter(c=>c.id!==t.drew).sort((a,b)=>val(b)-val(a))[0];t={...t,plan:{[h.id]:{t:'d'}}}}
  return execute(t)}
/* ---------- SAVE / LOAD ---------- */
const KEY='tonk-save-v3';
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)),n=s&&s.players&&s.players.length;
  if(s&&s.v===3&&s.rules&&s.rules.target>0&&n>=2&&n<=4&&Array.isArray(s.seats)&&s.seats.length===n&&Array.isArray(s.frozen)&&s.frozen.length===n&&Array.isArray(s.scores)&&s.scores.length===n
   &&Array.isArray(s.stock)&&Array.isArray(s.discard)&&Array.isArray(s.spreads)&&['handoff','draw','plan','roundEnd'].includes(s.phase)
   &&s.players.every(p=>Array.isArray(p.hand))&&[...s.stock,...s.discard,...s.players.flatMap(p=>p.hand),...s.spreads.flatMap(x=>x.cards)].length===52)return s}catch(e){}return null}
/* ---------- UI ---------- */
const PC=['#4fc3f7','#ff7043','#ba68c8','#81c784'],pc=q=>PC[(+q.name.slice(-1)-1)%4];
const Card=({c,sm,badge,onClick,back,pl,ice,msel,g})=>html`<button class=${'card'+(sm?' sm':'')+(back?' back':'')+(c&&red(c)?' red':'')+(pl?' pl':'')+(ice?' ice':'')+(msel?' msel':'')} onClick=${onClick} onContextMenu=${e=>e.preventDefault()} ...${g||{}} aria-label=${c?lab(c):'face-down card'}>${back?'':html`<b>${RK[c.r-1]}</b><i>${c.s}</i>`}${badge&&html`<u class=${badge[1]}>${badge[0]}</u>`}</button>`;
const Spread=({sp,ice})=>html`<div class="sp">${sp.cards.map(c=>html`<${Card} key=${c.id} c=${c} sm=${1} ice=${ice}/>`)}</div>`;
const Seg=({opts,val,on})=>html`<div class="seg">${opts.map(([k,l])=>html`<button key=${k} class=${'btn'+(val===k?'':' alt')} onClick=${()=>on(k)}>${l}</button>`)}</div>`;
function Setup({onStart,theme,setTheme}){const[t,setT]=useState([{k:'p',d:'n'},{k:'p',d:'n'},{k:'o',d:'n'},{k:'o',d:'n'}]),[gd,setGd]=useState('n');
  const act=t.filter(x=>x.k!=='o').length,ok=act>=2&&t.some(x=>x.k==='p'),up=(i,o)=>setT(t.map((x,j)=>j===i?{...x,...o}:x));
  return html`<div class="setup"><h1>♠ Tonk ♥</h1>
    <div class="seat col"><b>Theme</b><${Seg} opts=${Object.entries(THEMES).map(([k,v])=>[k,v.name])} val=${theme} on=${setTheme}/></div>
    <div class="seat col"><b>Game difficulty</b><${Seg} opts=${LV} val=${gd} on=${setGd}/><div class="dim">First to ${GAMED[gd].target} points · drop allowed at ${GAMED[gd].dropMax} or less</div></div>
    ${t.map((x,i)=>html`<div class="seat col" key=${i}><div class="srow"><b>Seat ${i+1}</b><${Seg} opts=${[['o','Off'],['p','Person'],['c','Computer']]} val=${x.k} on=${k=>up(i,{k})}/></div>
      ${x.k==='c'&&html`<div class="srow"><span class="dim">Computer skill</span><${Seg} opts=${LV} val=${x.d} on=${d=>up(i,{d})}/></div>`}</div>`)}
    <div class="frz">${ok?act+' players':'Need at least 2 active seats and 1 person'}</div>
    <button class="btn go" style=${{flex:'none',minHeight:54}} disabled=${!ok} onClick=${()=>onStart(t.map((x,i)=>x.k==='o'?null:{name:(x.k==='c'?'CPU ':'Player ')+(i+1),cpu:x.k==='c',lvl:x.d}).filter(Boolean),gd)}>Deal</button></div>`}
function App(){
  const[s,setS]=useState(load),[hide,setHide]=useState(true),[sel,setSel]=useState(null),[multi,setMulti]=useState(null),[ask,setAsk]=useState(null),gs=useRef({}),[theme,setTheme]=useState(()=>{try{return localStorage.getItem('tonk-theme')||'classic'}catch(e){return'classic'}});
  useEffect(()=>{const T=THEMES[theme]||THEMES.classic;for(const k in T.v)document.documentElement.style.setProperty(k,T.v[k]);try{localStorage.setItem('tonk-theme',theme)}catch(e){}},[theme]);
  useEffect(()=>{try{s?localStorage.setItem(KEY,JSON.stringify(s)):localStorage.removeItem(KEY)}catch(e){}},[s]);
  const up=f=>setS(p=>p&&f(p)),cpuNow=!!s&&s.phase==='handoff'&&s.seats[s.active].cpu;
  useEffect(()=>{if(!cpuNow)return;const id=setTimeout(()=>up(cpuTurn),1100);return()=>clearTimeout(id)},[cpuNow,s]);
  if(!s)return html`<${Setup} theme=${theme} setTheme=${setTheme} onStart=${(seats,gd)=>{setS(newRound(seats,seats.map(()=>0),0,GAMED[gd]));setHide(true)}}/>`;
  const me=s.active,hand=s.players[me].hand,nm=s.seats[me].name,n=s.seats.length,over=s.scores.some(x=>x>=s.rules.target);
  const showHand=(s.phase==='draw'||s.phase==='plan'),fr=s.frozen;
  const r=s.phase==='plan'?check(s):null,P=Object.values(s.plan),cnt=t=>P.filter(a=>a.t===t).length;
  const badge=c=>{const a=s.plan[c.id];if(!a)return null;if(a.t==='d')return['✕ discard','bd'];if(a.t==='s')return['Spread '+a.g,'bs'];const x=s.spreads.find(y=>y.id===a.sp);return['Hit P'+(x?s.seats[x.owner].name.slice(-1):'?'),'bh']};
  const assign=(c,a)=>{up(p=>setPlan(p,c.id,a));setSel(null);setMulti(null)};
  const tap=c=>{if(multi)setMulti(m=>{const x=m.includes(c.id)?m.filter(i=>i!==c.id):[...m,c.id];return x.length?x:null});else setSel(c.id)};
  const spreadMulti=g=>{up(p=>multi.reduce((q,id)=>setPlan(q,id,{t:'s',g}),p));setMulti(null)};
  const gest=c=>({
    onPointerDown:e=>{if(hide||s.phase!=='plan')return;const g=gs.current;clearTimeout(g.tm);Object.assign(g,{x:e.clientX,y:e.clientY,id:c.id,moved:false,long:false});
      g.tm=setTimeout(()=>{g.long=true;if(navigator.vibrate)navigator.vibrate(15);setMulti(m=>m||[c.id])},450);try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}},
    onPointerMove:e=>{const g=gs.current;if(g.id!==c.id||g.long)return;if(Math.abs(e.clientX-g.x)>12||Math.abs(e.clientY-g.y)>12){g.moved=true;clearTimeout(g.tm)}},
    onPointerUp:e=>{const g=gs.current;if(g.id!==c.id)return;clearTimeout(g.tm);g.id=null;if(g.long)return;
      const dx=e.clientX-g.x,dy=e.clientY-g.y;if(dy>40&&Math.abs(dx)<dy*0.7){assign(c,{t:'d'});return}if(!g.moved)tap(c)},
    onPointerCancel:()=>{clearTimeout(gs.current.tm);gs.current.id=null},
    onClick:e=>{if(e.detail===0&&!hide&&s.phase==='plan')tap(c)}});
  const selC=sel&&hand.find(c=>c.id===sel);
  const lbl=o=>(fr[o]?'❄ ':'')+(s.seats[o].cpu?'🤖 ':'')+s.seats[o].name+(fr[o]?' (frozen)':'')+(o===me&&showHand?' (you)':'');
  const order=[...s.seats.keys()].filter(i=>i!==me).concat(me);
  return html`
  ${s.phase!=='roundEnd'&&html`<div class="halo" style=${{'--hc':pc(s.seats[me])}}></div>`}
  <div class="top"><b>${s.seats.map((q,i)=>q.name.slice(0,1)+q.name.slice(-1)+' '+s.scores[i]).join(' · ')} <span style=${{opacity:.7}}>(to ${s.rules.target})</span></b>
    <button class="btn alt" style=${{minHeight:36}} aria-label="Change theme" onClick=${()=>setTheme(t=>{const k=Object.keys(THEMES);return k[(k.indexOf(t)+1)%k.length]})}>🎨</button><button class="btn alt" style=${{minHeight:36}} onClick=${()=>setAsk({msg:'Erase this game and go back to setup?',ok:()=>{setS(null);setHide(true)}})}>New game</button></div>
  <div class="table">
    <div class="sgrid">${s.seats.map((q,o)=>html`<div key=${o} class=${'scell'+(o===s.active?' on':'')} style=${{'--hc':pc(q)}}><div class=${'lbl'+(o===s.active?' act':'')}><span class="dot"></span>${lbl(o)}</div><div class="cards" aria-label=${s.players[o].hand.length+' cards in hand'}><b>${s.players[o].hand.length}</b>${s.players[o].hand.map((c,i)=>html`<span class="mini" key=${i}></span>`)}</div>
      <div class="spreads">${s.spreads.filter(x=>x.owner===o).map(x=>html`<${Spread} key=${x.id} sp=${x} ice=${fr[o]}/>`)}${!s.spreads.some(x=>x.owner===o)&&html`<span style=${{opacity:.5,fontSize:12}}>none yet</span>`}</div></div>`)}</div>
    <div class="piles">
      <div class="pile"><${Card} back=${1} onClick=${()=>up(p=>draw(p,'stock'))}/><div>Stock · ${s.stock.length}</div></div>
      <div class="pile">${s.discard.length?html`<${Card} c=${s.discard[s.discard.length-1]} onClick=${()=>up(p=>draw(p,'discard'))}/>`:html`<div class="card sm"></div>`}<div>Discard · ${s.discard.length}</div></div>
    </div>
    <div class="status">${cpuNow?html`<b>🤖 ${nm} is thinking…</b>`:s.phase==='draw'?html`<b>${nm}: draw from the stock or take the top discard.</b>`:s.phase==='plan'?html`<b>Tag cards, then Go.</b> Tap a card for options · swipe ↓ to discard · hold to select several.`:''}${s.msg&&html`<div style=${{color:'#ffd54f'}}>${s.msg}</div>`}</div>
  </div>
  ${showHand&&html`<div class="dock">
    <div class="lbl act" style=${{textAlign:'center'}}>${nm}’s hand · ${tot(hand)} pts</div>${fr[me]&&html`<div class="frz" style=${{textAlign:'center'}}>❄ Frozen — draw and discard only</div>`}
    <div class="hand">${hand.map(c=>html`<${Card} key=${c.id} c=${c} back=${hide} ice=${fr[me]} pl=${!!s.plan[c.id]} badge=${!hide&&badge(c)} msel=${!!multi&&multi.includes(c.id)} g=${gest(c)}/>`)}</div>
    ${s.phase==='plan'&&html`<div class="cnt">Spread ${cnt('s')} · Hit ${cnt('h')} · Discard ${cnt('d')}</div>${r.E.map((e,i)=>html`<div class="err" key=${i}>• ${e}</div>`)}`}
    ${multi&&html`<div class="mbar"><div><b>${multi.length} selected</b> — tap cards to add/remove${multi.length<3?' (need 3+)':''}</div><div class="g4">${['A','B','C','D'].map(g=>html`<button key=${g} class="btn" disabled=${multi.length<3} onClick=${()=>spreadMulti(g)}>Spread ${g}</button>`)}</div><button class="btn alt" onClick=${()=>setMulti(null)}>Cancel</button></div>`}
    <div class="row" style=${{display:multi?'none':'flex'}}>
      <button class="btn alt" onClick=${()=>setHide(h=>!h)}>${hide?'Show hand':'Hide hand'}</button>
      ${s.phase==='draw'&&!fr[me]&&tot(hand)<=s.rules.dropMax&&html`<button class="btn" onClick=${()=>setAsk({msg:'Drop now? You win only with the strictly lowest hand — a tie loses.',ok:()=>up(drop)})}>Drop (${tot(hand)})</button>`}
      ${s.phase==='plan'&&html`<button class="btn alt" onClick=${()=>up(p=>({...p,plan:{}}))}>Clear</button><button class=${'btn go'+(r.ok?'':' dim')} onClick=${()=>{up(execute);setHide(true);setSel(null);setMulti(null)}}>Go</button>`}
    </div></div>`}
  ${!multi&&selC&&html`<div class="sheet"><div style=${{display:'flex',justifyContent:'space-between',alignItems:'center'}}><b style=${{fontSize:18}}>${lab(selC)}</b><button class="btn alt" onClick=${()=>setSel(null)}>Close</button></div>
    <div class="g2"><button class="btn" onClick=${()=>assign(selC,{t:'d'})}>Discard</button><button class="btn alt" disabled=${!s.plan[selC.id]} onClick=${()=>assign(selC,null)}>Clear action</button></div>
    <div class="lbl">Spread group</div>
    <div class="g4">${['A','B','C','D'].map(g=>html`<button key=${g} class="btn" onClick=${()=>assign(selC,{t:'s',g})}>${g}${Object.values(s.plan).filter(a=>a.t==='s'&&a.g===g).length?' ('+Object.values(s.plan).filter(a=>a.t==='s'&&a.g===g).length+')':''}</button>`)}</div>
    ${s.spreads.length>0&&html`<div class="lbl">Hit a spread</div><div class="g2">${s.spreads.map(x=>html`<button key=${x.id} class=${'btn'+(canHit(x.cards,selC)?'':' dim')} onClick=${()=>assign(selC,{t:'h',sp:x.id,n:performance.now()})}>${x.owner===me?'You':s.seats[x.owner].name.replace('Player ','P').replace('CPU ','C')}: ${x.cards.map(lab).join(' ')}${canHit(x.cards,selC)?' ✓':''}</button>`)}</div>`}
  </div>`}
  ${s.phase==='handoff'&&!cpuNow&&html`<div class=${'ov'+(fr[me]?' ice':'')}><h2>Pass to ${nm}</h2>${fr[me]&&html`<div class="frz">❄ You’re frozen this turn: draw and discard only. No spreading, hitting or dropping.</div>`}
    <div class="log">${s.log.map((l,i)=>html`<div key=${i}>${l}</div>`)}</div>
    <div style=${{opacity:.8}}>Hands are hidden. Only the next player should look.</div>
    <button class="btn go" style=${{flex:'none',width:240,minHeight:54}} onClick=${()=>{up(p=>({...ack(p),log:[]}));setHide(false)}}>I’m ${nm} — continue</button></div>`}
  ${s.phase==='roundEnd'&&html`<div class="ov"><h2>${over?'Game over':'Round over'}</h2>
    <div>${s.result.why}${s.result.w!==null?html`<br/><b>${s.seats[s.result.w].name} scores ${s.result.pts}</b>`:''}</div>
    ${s.players.map((p,i)=>html`<div key=${i}><div class="lbl">${s.seats[i].name} · ${tot(p.hand)} pts</div><div class="hl">${p.hand.map(c=>html`<${Card} key=${c.id} c=${c} sm=${1}/>`)}</div></div>`)}
    <b>${s.seats.map((q,i)=>q.name+' '+s.scores[i]).join(' · ')}</b>
    <button class="btn go" style=${{flex:'none',width:240,minHeight:54}} onClick=${()=>{if(over)setS(null);else setS(newRound(s.seats,s.scores,(s.dealer+1)%n,s.rules));setHide(true)}}>${over?'Back to setup':'Next round'}</button></div>`}
  ${ask&&html`<div class="ov" style=${{zIndex:9}}><div style=${{fontSize:18,maxWidth:300}}>${ask.msg}</div><div class="row" style=${{width:260}}><button class="btn alt" style=${{flex:1}} onClick=${()=>setAsk(null)}>Cancel</button><button class="btn go" onClick=${()=>{const f=ask.ok;setAsk(null);f()}}>Yes</button></div></div>`}
  `}
export default App;
