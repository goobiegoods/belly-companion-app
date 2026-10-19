/* Generated from belly-feed-deploy.html by scripts/build-landing.py — do not edit by hand. */
(function(){
var feed=document.getElementById('feed'),scenes=[].slice.call(document.querySelectorAll('.scene')),bars=[].slice.call(document.querySelectorAll('.bars i'));
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,active=0,activeN='bella';
var HP=(location.hash||'').slice(1).split(/[.\-]/);
function qp(k){var I=window.__BELLY_INIT||{};if(I[k])return I[k];var v=new URLSearchParams(location.search).get(k);if(v)return v;
 var T=['pregnant','trying','postpartum','little'];for(var i=0;i<HP.length;i++){if(k==='t'&&T.indexOf(HP[i])>=0)return HP[i];if(k==='s'&&T.indexOf(HP[i])<0&&HP[i])return HP[i];}return null;}
/* edit these three once prices are set */
/* Placeholder prices removed until products + prices are confirmed. */
var PRICES={tea:'sold out',herbs:'sold out',book:'coming soon',calm:'sold out',pick:'sold out'};
[].forEach.call(document.querySelectorAll('[data-price]'),function(e){e.textContent=PRICES[e.dataset.price];});
document.getElementById('join').onclick=function(){var ys=document.querySelector('.slide[data-offer="year"]');
 if(scr1&&scr1.revealed&&!ys.classList.contains('done')){openS(OFFERS.year(),ys);return;}
 document.getElementById('offer').scrollIntoView({behavior:'smooth'});};

/* ---------- personalization ---------- */
var ME={s:null,w:20};
var seasonBtns=[].slice.call(document.querySelectorAll('.seasons button')),wkpick=document.getElementById('wkpick'),wkin=document.getElementById('wkin'),wkout=document.getElementById('wkout'),go=document.getElementById('go');
seasonBtns.forEach(function(b){b.onclick=function(){seasonBtns.forEach(function(x){x.setAttribute('aria-pressed',x===b);});ME.s=b.dataset.s;wkpick.classList.toggle('on',ME.s==='pregnant');go.classList.add('on');chatRun=false;};});
wkin.oninput=function(){ME.w=+wkin.value;wkout.textContent='week '+ME.w;};
go.onclick=function(){applySeason();
 scenes[1].scrollIntoView({behavior:'smooth'});};

var SCRIPTS={};SCRIPTS.pregnant=[{w:"u",t:"Sharp pain on my right side when I stand up. Should I worry?"},
{w:"b",t:"Sharp, brief, worse when you move. That's usually round ligament stretching, which often shows up in the second trimester."},
{w:"b",t:"Come straight back to me if it turns constant, or comes with bleeding, fever or contractions. That's a call-your-midwife moment."},
{w:"u",t:"It comes and goes. Thank you."},
{w:"b",t:"I'll check in tomorrow. You're doing well, mama."}];
SCRIPTS.postpartum=[{w:"u",t:"Baby is 10 days old and I cry every evening. Is that normal?"},{w:"b",t:"So many mamas feel this. The baby blues often show up in the first two weeks and usually ease on their own."},{w:"b",t:"If it lasts past that, feels heavy, or you have thoughts that scare you, tell your midwife or doctor right away. And tell me. You're not alone in this."},{w:"u",t:"Thank you. I needed that."},{w:"b",t:"Warm food, a nap when baby naps, and one person whose only job is you. I'll check in tonight."}];
SCRIPTS.trying=[{w:"u",t:"Another month of waiting. I'm so tired of it."},{w:"b",t:"The waiting is the hardest part, and it's okay to be tired of it."},{w:"b",t:"Let's make this month gentler: warm meals, early nights, and one thing just for you today. Want me to walk your cycle with you?"},{w:"u",t:"Yes please."},{w:"b",t:"Then we start tonight. You're doing more right than you know."}];
SCRIPTS.little=[{w:"u",t:"My toddler won't fall asleep before 10pm. I'm exhausted."},{w:"b",t:"That's such a long day for both of you. Let's build a wind-down together."},{w:"b",t:"Dim lights an hour before, a warm bath, the same three songs every night. Consistency does the heavy lifting."},{w:"u",t:"We'll try it tonight."},{w:"b",t:"Tell me how it goes. I'll be here at 10pm too."}];
function curScript(){return SCRIPTS[ME.s]||SCRIPTS.pregnant;}
var chat=document.getElementById('chat'),chatRun=false;
function add(m){var d=document.createElement('div');d.className='msg '+m.w;d.textContent=m.t;chat.appendChild(d);}
function runChat(){if(chatRun)return;chatRun=true;chat.innerHTML='';var i=0,lastB=false,SCRIPT=curScript();
 (function next(){if(i>=SCRIPT.length){setTimeout(function(){chatRun=false;if(activeN==='bella')runChat();},6000);return;}
  var m=SCRIPT[i++];
  if(m.w==='b'){if(!lastB){var who=document.createElement('div');who.className='who';who.innerHTML='<span class="orb dot"></span>Bella · '+(ME.s==='pregnant'?'week '+ME.w:ME.s==='postpartum'?'your fourth trimester':ME.s==='trying'?'your cycle':ME.s==='little'?'your little one':'here for you');chat.appendChild(who);}
   var ty=document.createElement('div');ty.className='typing';ty.innerHTML='<span></span><span></span><span></span>';chat.appendChild(ty);
   setTimeout(function(){ty.remove();add(m);lastB=true;setTimeout(next,900);},reduce?0:1300);}
  else{lastB=false;setTimeout(function(){add(m);setTimeout(next,700);},reduce?0:450);}
 })();}

/* ---------- 2 · fruit growth ---------- */
var F={
poppy:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="9" fill="#3A2A33"/><circle cx="47" cy="47" r="3" fill="#7A6570"/></svg>',
rasp:'<svg viewBox="0 0 100 100"><path d="M42 20c4-8 12-8 16 0-6-2-10-2-16 0z" fill="#2C9C8F"/><path d="M50 22c-2-6 0-10 3-12" stroke="#2C9C8F" stroke-width="3" fill="none"/>'+
 [[40,34],[52,32],[63,36],[35,46],[47,45],[59,45],[68,49],[40,57],[52,57],[63,58],[45,68],[57,68],[51,78]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#C23A68"/><circle cx="'+(p[0]-2.5)+'" cy="'+(p[1]-2.5)+'" r="2.4" fill="#F08AAE"/>';}).join('')+'</svg>',
lime:'<svg viewBox="0 0 100 100"><ellipse cx="50" cy="52" rx="32" ry="28" fill="#7FB23A"/><ellipse cx="50" cy="52" rx="32" ry="28" fill="none" stroke="#5E8C22" stroke-width="3"/><ellipse cx="40" cy="42" rx="10" ry="6" fill="#B7DC74" opacity=".8"/><path d="M82 50l6-3" stroke="#5E8C22" stroke-width="4" stroke-linecap="round"/></svg>',
avo:'<svg viewBox="0 0 100 100"><path d="M50 12c-14 0-20 20-26 38-6 20 6 38 26 38s32-18 26-38C70 32 64 12 50 12z" fill="#3E5B1E"/><path d="M50 20c-10 0-15 16-20 32-5 16 5 30 20 30s25-14 20-30c-5-16-10-32-20-32z" fill="#C9DB7A"/><circle cx="50" cy="60" r="13" fill="#8A5230"/><circle cx="46" cy="56" r="4" fill="#B0764C"/></svg>',
banana:'<svg viewBox="0 0 100 100"><path d="M18 30c8 34 40 50 70 36-2 8-10 14-20 16-30 6-54-18-56-50z" fill="#F2C94C"/><path d="M18 30c8 34 40 50 70 36" fill="none" stroke="#D9A21B" stroke-width="3"/><path d="M14 24l6 8" stroke="#6B4A1E" stroke-width="5" stroke-linecap="round"/><path d="M88 66l4 2" stroke="#6B4A1E" stroke-width="4" stroke-linecap="round"/></svg>',
corn:'<svg viewBox="0 0 100 100"><path d="M36 86C28 60 30 30 50 12c-6 26-6 50 2 74z" fill="#5E9A3A"/><path d="M64 86c8-26 6-56-14-74 6 26 6 50-2 74z" fill="#76B04A"/><ellipse cx="50" cy="48" rx="12" ry="32" fill="#F2B647"/>'+
 [30,38,46,54,62].map(function(y){return '<path d="M40 '+y+'h20" stroke="#D99A2B" stroke-width="1.5"/>';}).join('')+'<path d="M50 18v60M44 20v56M56 20v56" stroke="#D99A2B" stroke-width="1.2"/></svg>',
egg:'<svg viewBox="0 0 100 100"><path d="M40 30c-18 8-24 30-14 46 10 16 34 16 44 0 8-14 2-30-10-40-6-5-12-9-20-6z" fill="#5B2A6E"/><path d="M36 42c-6 6-8 16-4 24" stroke="#9A62B0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M38 30c4-10 16-14 24-8-4 0-6 4-4 8-6-4-14-4-20 0z" fill="#4F8A2C"/><path d="M56 22l8-10" stroke="#4F8A2C" stroke-width="4" stroke-linecap="round"/></svg>',
pine:'<svg viewBox="0 0 100 100"><path d="M50 8l-6 18-10-10 4 18-12-4 12 12h24l12-12-12 4 4-18-10 10z" fill="#3E8A4A"/><ellipse cx="50" cy="62" rx="24" ry="30" fill="#E3A12F"/><path d="M30 44l40 40M26 60l30 30M34 36l40 40M70 44L30 84M74 60L44 90M66 36L26 76" stroke="#B87618" stroke-width="2"/></svg>',
papaya:'<svg viewBox="0 0 100 100"><path d="M50 10c-18 0-30 22-30 44s12 36 30 36 30-14 30-36-12-44-30-44z" fill="#E8622E"/><path d="M50 18c-12 0-22 18-22 36s10 28 22 28 22-10 22-28-10-36-22-36z" fill="#FFA477"/><ellipse cx="50" cy="56" rx="8" ry="16" fill="#3A1A38"/><circle cx="48" cy="48" r="2" fill="#6B4A5E"/><circle cx="52" cy="58" r="2" fill="#6B4A5E"/></svg>',
melon:'<svg viewBox="0 0 100 100"><circle cx="50" cy="52" r="38" fill="#2E7D3A"/><path d="M50 14c-8 12-8 64 0 76M50 14c8 12 8 64 0 76M50 14c-22 10-26 62 0 76M50 14c22 10 26 62 0 76" stroke="#1C5A26" stroke-width="4" fill="none"/><ellipse cx="36" cy="36" rx="10" ry="6" fill="#6FB27A" opacity=".5"/><path d="M50 14l2-6" stroke="#6B4A1E" stroke-width="4" stroke-linecap="round"/></svg>'};
var FP={rasp:[51,55,.8],lime:[50,54,1],avo:[50,44,.8],banana:[58,62,.8],corn:[50,50,.7],egg:[48,60,1],pine:[50,64,1],papaya:[50,36,.8],melon:[50,50,1.1]};
function cute(svg,k){var p=FP[k];if(!p)return svg;var x=p[0],y=p[1],sc=p[2],e=6*sc,r=2.6*sc;
 var f='<g class="bounce-face"><g class="eye"><circle cx="'+(x-e)+'" cy="'+y+'" r="'+r+'" fill="#2A0E28"/><circle cx="'+(x-e+.9)+'" cy="'+(y-.9)+'" r="'+(r*.35)+'" fill="#fff"/></g><g class="eye"><circle cx="'+(x+e)+'" cy="'+y+'" r="'+r+'" fill="#2A0E28"/><circle cx="'+(x+e+.9)+'" cy="'+(y-.9)+'" r="'+(r*.35)+'" fill="#fff"/></g>'+
 '<path d="M'+(x-2.6*sc)+' '+(y+4*sc)+'q'+(2.6*sc)+' '+(3*sc)+' '+(5.2*sc)+' 0" stroke="#2A0E28" stroke-width="'+(1.6*sc)+'" fill="none" stroke-linecap="round"/>'+
 '<ellipse cx="'+(x-e-3*sc)+'" cy="'+(y+4*sc)+'" rx="'+(3*sc)+'" ry="'+(1.7*sc)+'" fill="#FF8FB1" opacity=".55"/><ellipse cx="'+(x+e+3*sc)+'" cy="'+(y+4*sc)+'" rx="'+(3*sc)+'" ry="'+(1.7*sc)+'" fill="#FF8FB1" opacity=".55"/></g>';
 return svg.replace('<svg viewBox="0 0 100 100">','<svg viewBox="0 0 100 100"><g class="bounce">').replace(/<\/svg>$/,f+'</g></svg>');}
var STOPS=[{w:4,f:'poppy',n:'a poppy seed',cm:'0.2 cm',s:.35,t:0,b:"A tiny heartbeat is starting. You might not even know yet."},
{w:8,f:'rasp',n:'a raspberry',cm:'1.6 cm',s:.45,t:0,b:"Fingers and toes are forming. Nausea, meet ginger tea."},
{w:12,f:'lime',n:'a lime',cm:'5.4 cm',s:.52,t:0,b:"The 12-week scan. Who are you ready to tell?"},
{w:16,f:'avo',n:'an avocado',cm:'11.6 cm',s:.6,t:1,b:"Baby can hear your voice now. Talk to them."},
{w:20,f:'banana',n:'a banana',cm:'25 cm',s:.68,t:1,b:"Halfway. The anatomy scan, and maybe a first flutter."},
{w:24,f:'corn',n:'an ear of corn',cm:'30 cm',s:.74,t:1,b:"Kicks you can feel from the outside. Sleep on your side."},
{w:28,f:'egg',n:'an eggplant',cm:'37 cm',s:.8,t:2,b:"Eyes open and close. Start counting kicks."},
{w:32,f:'pine',n:'a pineapple',cm:'42 cm',s:.86,t:2,b:"Practice breaths in there. Time to pack the bag."},
{w:36,f:'papaya',n:'a papaya',cm:'47 cm',s:.92,t:2,b:"Head down, getting ready. So are you."},
{w:40,f:'melon',n:'a watermelon',cm:'51 cm',s:1,t:2,b:"Any day now, and that's fine. Bella's here for every contraction."}];
var TRI=[{g:'#2C9C8F',gs:'rgba(44,156,143,.6)',col:'#7ED8CB',c:'rgba(44,156,143,.35)'},{g:'#B5386B',gs:'rgba(181,56,107,.6)',col:'#E58AAE',c:'rgba(181,56,107,.38)'},{g:'#F2B647',gs:'rgba(242,182,71,.6)',col:'#FFE9B0',c:'rgba(242,182,71,.3)'}];
var gw=document.getElementById('gw'),fruit=document.getElementById('fruit'),track=document.getElementById('track'),knob=document.getElementById('knob'),gamb=document.getElementById('gamb');
var wkEl=document.getElementById('wk'),cmEl=document.getElementById('cm'),fn=document.getElementById('fname'),bn=document.getElementById('bnote');
var line=track.querySelector('.line');
STOPS.forEach(function(s,k){var d=document.createElement('i');d.className='stop';d.style.left=(k/(STOPS.length-1)*100)+'%';track.appendChild(d);});
var cur=-1,auto=null,touched=false;
function setStop(k){k=Math.max(0,Math.min(STOPS.length-1,k));if(k===cur)return;cur=k;var s=STOPS[k],t=TRI[s.t];
 knob.style.left=(k/(STOPS.length-1)*100)+'%';track.setAttribute('aria-valuenow',s.w);track.setAttribute('aria-valuetext','week '+s.w+', size of '+s.n);
 gw.style.setProperty('--g',t.g);gw.style.setProperty('--gs',t.gs);gw.style.setProperty('--gcol',t.col);gamb.style.setProperty('--c',t.c);
 fruit.innerHTML=cute(F[s.f],s.f);fruit.style.setProperty('--fs',s.s);fruit.classList.remove('swap');void fruit.offsetWidth;fruit.classList.add('swap');
 wkEl.textContent=s.lab||'week '+s.w;cmEl.textContent=s.cm||'';fn.textContent=s.nm||'size of '+s.n;bn.textContent=s.b;
 if(navigator.vibrate&&touched)navigator.vibrate(8);}
setStop(1);
function startAuto(){if(touched||auto||reduce||(ME.s&&ME.s!=='all'))return;auto=setInterval(function(){setStop(cur>=STOPS.length-1?0:cur+1);},2200);}
function stopAuto(){clearInterval(auto);auto=null;}
function fromX(x){var r=track.getBoundingClientRect();setStop(Math.round((x-r.left)/r.width*(STOPS.length-1)));}
track.addEventListener('pointerdown',function(e){touched=true;stopAuto();track.classList.add('drag');track.setPointerCapture(e.pointerId);track._d=true;fromX(e.clientX);});
track.addEventListener('pointermove',function(e){if(track._d)fromX(e.clientX);});
function tup(){track._d=false;track.classList.remove('drag');}
track.addEventListener('pointerup',tup);track.addEventListener('pointercancel',tup);
track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();touched=true;stopAuto();setStop(cur+(e.key==='ArrowRight'?1:-1));}});

/* ---------- 3 · box ---------- */


/* ---------- 4 · breathe ---------- */
var motes=document.getElementById('motes');
for(var m=0;m<16;m++){var i=document.createElement('i');i.style.left=(Math.random()*100)+'%';i.style.animationDuration=(10+Math.random()*12)+'s';i.style.animationDelay=(-Math.random()*20)+'s';i.style.opacity=0;if(m%3===0)i.style.background='#F2B647';motes.appendChild(i);}
var borb=document.getElementById('borb'),bword=document.getElementById('bword'),bsub=document.getElementById('bsub'),timer=document.getElementById('timer'),circ=timer.querySelector('circle');
var bt=null,phaseT=null,sessionT=null,sessionEnd=0;
function breathCycle(){borb.classList.remove('exh');borb.classList.add('inh');bword.textContent='breathe in';
 phaseT=setTimeout(function(){borb.classList.remove('inh');borb.classList.add('exh');bword.textContent='breathe out';phaseT=setTimeout(breathCycle,6000);},4000);}
function startBreath(){if(phaseT||reduce)return;breathCycle();}
function stopBreath(){clearTimeout(phaseT);phaseT=null;borb.classList.remove('inh','exh');}
borb.addEventListener('click',function(){
 if(sessionT){clearInterval(sessionT);sessionT=null;timer.classList.remove('on');bsub.textContent="Tap the glow for one quiet minute. This one's on the house.";return;}
 sessionEnd=Date.now()+60000;timer.classList.add('on');circ.style.transition='none';circ.style.strokeDashoffset=880;void circ.offsetWidth;circ.style.transition='stroke-dashoffset 60s linear';circ.style.strokeDashoffset=0;
 sessionT=setInterval(function(){var left=Math.max(0,Math.ceil((sessionEnd-Date.now())/1000));bsub.textContent=left+' seconds. Nowhere else to be.';
  if(left<=0){clearInterval(sessionT);sessionT=null;timer.classList.remove('on');bsub.textContent="That was one minute for you. There are more inside Belly.";}},500);
});

/* ---------- 5 · apothecary ---------- */
var REM=[{n:"First Trimester Kit",f:"Nux Vomica 30c · Sepia 30c · Ginger Blend Tea",p:"sold out",kit:true,c:["#8a3a12","#c2561f"]},
{n:"Nux Vomica 30c",f:"Traditionally used to support digestive comfort",p:"sold out",c:["#6a2a12","#c2561f"]},
{n:"Sepia 30c",f:"Traditionally used to support steady energy and mood",p:"sold out",c:["#5b1d3c","#a3386a"]},
{n:"Pulsatilla 30c",f:"Traditionally used to support emotional balance",p:"sold out",c:["#1f5c56","#2C9C8F"]},
{n:"Chamomilla 30c",f:"Traditionally used to support rest",p:"sold out",c:["#7a5410","#d69a2a"]}];
var car=document.getElementById('car'),remtxt=document.getElementById('remtxt'),remSel=0;
car.innerHTML=REM.map(function(r,k){var grad='linear-gradient(90deg,'+r.c[0]+','+r.c[1]+' 45%,'+r.c[0]+')';
 var vials=r.kit?'<i class="v" style="height:92px;background:linear-gradient(90deg,#6a2a12,#c2561f 45%,#6a2a12)"></i><i class="v" style="height:110px;background:linear-gradient(90deg,#5b1d3c,#a3386a 45%,#5b1d3c);animation-delay:-2s"></i><i class="v" style="height:74px;width:54px;border-radius:8px;background:linear-gradient(90deg,#DCC29F,#F4E2C8 50%,#CDB594);animation-delay:-4s"></i>'
  :'<i class="v" style="height:112px;background:'+grad+';animation-delay:-'+k+'s"></i>';
 return '<div class="card'+(k===0?' on':'')+'" data-k="'+k+'"><div class="bot">'+vials+'</div><span class="mono">'+(r.kit?'bella recommends':'single remedy')+'</span><p class="n">'+r.n+'</p><p class="f">'+r.f+'</p><span class="p">'+r.p+'</span></div>';}).join('');
var cards=[].slice.call(car.children);
function pickRem(k){remSel=k;cards.forEach(function(c,j){c.classList.toggle('on',j===k);});var s=document.querySelector('[data-offer="rem"]');if(!s.classList.contains('done'))remtxt.textContent='sold out · notify me';}
function nearest(){var mid=car.scrollLeft+car.clientWidth/2,best=0,bd=1e9;cards.forEach(function(c,j){var d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=j;}});if(best!==remSel||!cards[best].classList.contains('on'))pickRem(best);}
var rt;car.addEventListener('scroll',function(){clearTimeout(rt);rt=setTimeout(nearest,60);});
function centerFirst(){car.scrollLeft=cards[0].offsetLeft-(car.clientWidth-cards[0].offsetWidth)/2;pickRem(0);}
cards.forEach(function(c,j){c.addEventListener('click',function(){car.scrollTo({left:c.offsetLeft-(car.clientWidth-c.offsetWidth)/2,behavior:'smooth'});});});
pickRem(0);

/* ---------- 7 · community ---------- */
var POSTS=[["Z","zara · wk 18","#E8622E","I felt the first kick today and I ugly cried",42],["T","tabitha · wk 36","#B5386B","36 weeks and I finally let myself believe",88],["I","isla · wk 39","#2C9C8F","My home birth was everything I hoped for",131],["N","nina · wk 28","#F2B647","NICU journey, week 28. Ask me anything.",64],["M","maya · wk 11","#2C9C8F","Nobody warned me about the tiredness",57],["R","rae · wk 24","#B5386B","Anyone else awake at 3am?",203]];
var h='';POSTS.concat(POSTS).forEach(function(p){h+='<div class="post"><div class="h"><span class="av" style="background:'+p[2]+'">'+p[0]+'</span><span class="w">'+p[1]+'</span></div><p class="t">'+p[3]+'</p></div>';});
document.getElementById('col').innerHTML=h;

/* ---------- herbs in jars ---------- */
function herbShape(){var k=Math.random(),s;
 if(k<.35){s='<ellipse rx="'+(4+Math.random()*4)+'" ry="'+(2+Math.random()*1.5)+'" fill="'+['#6E8B3D','#86A34A','#4F6B2A'][Math.floor(Math.random()*3)]+'"/>';}
 else if(k<.55){s='<ellipse rx="3.5" ry="2.2" fill="'+['#E8A0B4','#D86A8E','#F4C6D4'][Math.floor(Math.random()*3)]+'"/>';}
 else if(k<.75){s='<circle r="3" fill="#F2B647"/><circle r="1.2" fill="#E8622E"/>';}
 else if(k<.9){s='<circle r="3" fill="#F8F1E4"/><circle r="1.3" fill="#F2B647"/>';}
 else{s='<rect x="-4" y="-.8" width="8" height="1.6" rx=".8" fill="#A7773E"/>';}
 return s;}
function fillJar(id,n,y0,y1){var g=document.getElementById(id);if(!g)return;var h='';
 for(var i=0;i<n;i++){var x=30+Math.random()*150,y=y0+Math.random()*(y1-y0);
  h+='<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+Math.floor(Math.random()*360)+')"><g class="herb" style="--d:'+(6+Math.random()*8).toFixed(1)+'s;--tx:'+(Math.random()*8-4).toFixed(1)+'px;--ty:'+(Math.random()*-10).toFixed(1)+'px;--r:'+Math.floor(Math.random()*90-45)+'deg;animation-delay:-'+(Math.random()*8).toFixed(1)+'s">'+herbShape()+'</g></g>';}
 g.innerHTML=h;}
function herbShape(){var k=Math.random(),c;
 if(k<.45){c=['#5E8A3A','#7BA24A','#44662A','#8DB35A'][Math.floor(Math.random()*4)];return '<path d="M-8 0C-3-5 5-5 9 0C5 5-3 5-8 0Z" fill="'+c+'"/><path d="M-7 0H8" stroke="rgba(0,0,0,.28)" stroke-width=".7"/>';}
 if(k<.7)return '<ellipse rx="5" ry="3" fill="'+['#E58AAE','#D2587F','#F3B6CB'][Math.floor(Math.random()*3)]+'"/><ellipse cx="-1.4" cy="-.8" rx="2" ry="1" fill="#fff" opacity=".35"/>';
 if(k<.85)return '<circle r="3.6" fill="#F2A43A"/><circle r="1.5" fill="#B5561C"/>';
 if(k<.95)return '<circle r="3.4" fill="#FBF3E4"/><circle r="1.4" fill="#F2B647"/>';
 return '<rect x="-5" y="-.9" width="10" height="1.8" rx=".9" fill="#8E6232"/>';}
function fillJar(id,n,y0,y1){var g=document.getElementById(id);if(!g)return;var h='';
 for(var i=0;i<n;i++){var x=56+Math.random()*128,y=y0+Math.random()*(y1-y0);
  h+='<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+Math.floor(Math.random()*360)+') scale('+(.8+Math.random()*.7).toFixed(2)+')"><g class="herb" style="--d:'+(6+Math.random()*8).toFixed(1)+'s;--tx:'+(Math.random()*8-4).toFixed(1)+'px;--ty:'+(Math.random()*-10).toFixed(1)+'px;--r:'+Math.floor(Math.random()*90-45)+'deg;animation-delay:-'+(Math.random()*8).toFixed(1)+'s">'+herbShape()+'</g></g>';}
 g.innerHTML=h;}
function lidSvg(id){return '<rect x="62" y="40" width="116" height="34" rx="6" fill="url(#lg'+id+')"/><path d="M64 48H176M64 55H176M64 62H176M64 69H176" stroke="rgba(60,40,10,.35)" stroke-width="1.2"/><rect x="62" y="40" width="116" height="6" rx="3" fill="rgba(255,255,255,.35)"/><rect x="66" y="42" width="10" height="30" rx="4" fill="rgba(255,255,255,.28)"/>';}
function mkJar(big){var id=big?'herbs2':'herbs1',t=big?['#7C8A42','#3F4B20']:['#B9722F','#5C3318'],fy=big?160:124;
 var B='M70 76C70 94 50 100 50 124L50 258Q50 278 70 278H170Q190 278 190 258V124C190 100 170 94 170 76Z';
 var cup=big?'':'<g transform="translate(176 242)"><ellipse cx="26" cy="43" rx="34" ry="5" fill="#E8DCC8"/><g class="steam"><path d="M14 -8c-6 -10 6 -18 0 -30"/><path d="M26 -6c-6 -10 6 -18 0 -30"/><path d="M38 -8c-6 -10 6 -18 0 -30"/></g><path d="M0 0h52v14c0 18-12 28-26 28S0 32 0 14z" fill="#F4ECE0"/><path d="M0 0h10v14c0 14 4 24 12 28S0 32 0 14z" fill="rgba(0,0,0,.08)"/><path d="M7 10v14" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/><path d="M52 6c14 0 14 18 0 18" stroke="#F4ECE0" stroke-width="5" fill="none"/><ellipse cx="26" cy="2" rx="24" ry="5" fill="#9A5A22"/><g class="eye"><circle cx="18" cy="17" r="2.4" fill="#3A1A38"/></g><g class="eye"><circle cx="34" cy="17" r="2.4" fill="#3A1A38"/></g><path d="M22 23q4 4 8 0" stroke="#3A1A38" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="12" cy="23" rx="4" ry="2.2" fill="#E98AA6" opacity=".6"/><ellipse cx="40" cy="23" rx="4" ry="2.2" fill="#E98AA6" opacity=".6"/><path class="heartsteam" d="M26 -30c-3-5-10-3-9 2 1 4 9 9 9 9s8-5 9-9c1-5-6-7-9-2z" fill="#E98AA6"/></g>';
 return '<svg viewBox="0 0 240 310" aria-hidden="true"><defs><linearGradient id="lg'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#8A7448"/><stop offset=".2" stop-color="#F1E2B2"/><stop offset=".45" stop-color="#B99B5C"/><stop offset=".7" stop-color="#F6E9C2"/><stop offset="1" stop-color="#7C6A42"/></linearGradient><linearGradient id="gl'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".12" stop-color="#fff" stop-opacity=".05"/><stop offset=".88" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".26"/></linearGradient><linearGradient id="tc'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+t[0]+'"/><stop offset="1" stop-color="'+t[1]+'"/></linearGradient><linearGradient id="kr'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#C9AA7C"/><stop offset=".5" stop-color="#E3C99B"/><stop offset="1" stop-color="#BFA070"/></linearGradient><linearGradient id="ed'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient><clipPath id="cp'+id+'"><path d="'+B+'"/></clipPath></defs><ellipse cx="120" cy="284" rx="88" ry="9" fill="rgba(0,0,0,.5)"/><ellipse cx="120" cy="286" rx="66" ry="6" fill="rgba('+(big?'160,180,80':'232,150,60')+',.3)"/><g clip-path="url(#cp'+id+')"><rect x="40" y="'+fy+'" width="160" height="170" fill="url(#tc'+id+')"/><ellipse cx="120" cy="'+fy+'" rx="72" ry="7" fill="rgba(255,235,190,.25)"/><g id="'+id+'"></g></g><path d="'+B+'" fill="url(#gl'+id+')" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/><path d="M60 130V250" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".22"/><path d="M72 120V150" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".4"/><path d="M181 132V248" stroke="#fff" stroke-width="2" opacity=".16"/><path d="M76 90C74 104 62 110 58 124" stroke="#fff" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/><path d="M72 80H168M72 86H168" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/><rect x="76" y="170" width="88" height="64" rx="4" fill="url(#kr'+id+')"/><rect x="76" y="170" width="88" height="64" rx="4" fill="url(#ed'+id+')"/><text x="120" y="196" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="22" fill="#4A1730">belly</text><text x="120" y="211" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7" letter-spacing="1.6" fill="#6B2331">'+(big?'LOOSE LEAF':'EVERYDAY TEA')+'</text><path d="M98 217H142" stroke="#6B2331" stroke-width=".8"/><text x="120" y="227" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="5.5" fill="#6B2331">'+(big?'HAND-BLENDED':'30 CUPS')+'</text>'+(big?'<g transform="translate(0 -30)"><g class="lidfloat">'+lidSvg(id)+'</g></g><g id="herbs2f"></g>':lidSvg(id)+'<path d="M68 90Q120 100 172 90" stroke="#E9DCC0" stroke-width="3" fill="none"/><path d="M120 96c-10 6-18 14-14 22M120 96c10 6 18 14 14 22" stroke="#E9DCC0" stroke-width="2.4" fill="none" stroke-linecap="round"/>')+cup+'</svg>';}
var jst=document.querySelectorAll('.jarstage');if(jst[0])jst[0].innerHTML=mkJar(false);if(jst[1])jst[1].innerHTML=mkJar(true);
fillJar('herbs1',90,128,268);fillJar('herbs2',100,170,268);
[].forEach.call(document.querySelectorAll('[data-n="jar"],[data-n="herbs"],[data-n="shelf"]'),function(sc){var b=document.createElement('div');b.className='bokeh';sc.insertBefore(b,sc.firstChild);});
var LOT='<svg class="prod" viewBox="0 0 100 214" aria-hidden="true"><defs><linearGradient id="bo" x1="0" x2="1"><stop offset="0" stop-color="#CFC7B8"/><stop offset=".18" stop-color="#F6F1E8"/><stop offset=".55" stop-color="#EDE6DA"/><stop offset="1" stop-color="#B9B0A0"/></linearGradient><linearGradient id="lb" x1="0" x2="1"><stop offset="0" stop-color="#9FB59A"/><stop offset=".3" stop-color="#C9D8C2"/><stop offset=".7" stop-color="#B7C9B0"/><stop offset="1" stop-color="#86A082"/></linearGradient><linearGradient id="pm" x1="0" x2="1"><stop offset="0" stop-color="#9C8452"/><stop offset=".35" stop-color="#F0DFA6"/><stop offset="1" stop-color="#8A7444"/></linearGradient><linearGradient id="cy" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".14" stop-color="#fff" stop-opacity=".35"/><stop offset=".26" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient></defs><ellipse cx="50" cy="209" rx="36" ry="4.5" fill="rgba(0,0,0,.55)"/><path d="M36 8h26q8 0 8 6v3H36z" fill="url(#pm)"/><rect x="44" y="17" width="10" height="24" fill="url(#pm)"/><rect x="35" y="40" width="30" height="14" rx="3" fill="url(#pm)"/><path d="M26 66C26 57 34 54 50 54S74 57 74 66V72H26Z" fill="url(#bo)"/><rect x="20" y="64" width="60" height="142" rx="16" fill="url(#bo)"/><rect x="22" y="96" width="56" height="92" rx="3" fill="url(#lb)"/><rect class="hl" x="31" y="144.6" width="38" height="5.4" rx="1" fill="#E8622E"/><rect class="hl h2" x="31" y="149.8" width="38" height="5.4" rx="1" fill="#E8622E"/><g font-family="JetBrains Mono,monospace" fill="#2F3F2C" text-anchor="middle"><text x="50" y="112" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="9">lavender calm</text><text x="50" y="121" font-size="4" letter-spacing=".8">BABY LOTION · 8 FL OZ</text><text x="50" y="132" font-size="3">INGREDIENTS</text><text x="50" y="139" font-size="3.3">Aqua, Glycerin, Shea Butter, Oat</text><text x="50" y="144" font-size="3.3">Extract, Cetearyl Alcohol,</text><text x="50" y="149" font-size="3.3">Phenoxyethanol,</text><text x="50" y="154" font-size="3.3">Parfum (Fragrance),</text><text x="50" y="159" font-size="3.3">Tocopherol, Citric Acid.</text></g><rect x="20" y="54" width="60" height="152" rx="16" fill="url(#cy)"/><rect x="27" y="70" width="4" height="120" rx="2" fill="#fff" opacity=".35"/></svg>';
var oldp=document.querySelector('svg.prod');if(oldp)oldp.outerHTML=LOT;
(function(){var g=document.getElementById('herbs2f');if(!g)return;var h='';
 for(var i=0;i<16;i++){var x=70+Math.random()*80;
  h+='<g transform="translate('+x.toFixed(1)+' 20)"><g class="fall" style="--d:'+(2.6+Math.random()*2).toFixed(1)+'s;--dl:-'+(Math.random()*4).toFixed(1)+'s;--tx:'+(Math.random()*30-15).toFixed(0)+'px;--r:'+Math.floor(Math.random()*360)+'deg">'+herbShape()+'</g></g>';}
 g.innerHTML=h;})();

/* ---------- scan ---------- */
var vf=document.getElementById('vf'),scoreEl=document.getElementById('score'),scanT=[];
var hp=document.getElementById('hp');
function runScan(){scanT.forEach(clearTimeout);scanT=[];vf.classList.remove('focus','beam','done');hp.classList.remove('in');void hp.offsetWidth;hp.classList.add('in');scoreEl.textContent='0';
 var q=reduce?[0,0,0]:[900,1500,3900];
 scanT.push(setTimeout(function(){vf.classList.add('focus');},q[0]));
 scanT.push(setTimeout(function(){vf.classList.add('beam');},q[1]));
 scanT.push(setTimeout(function(){vf.classList.add('done');var n=0,iv=setInterval(function(){n+=2;scoreEl.textContent=Math.min(n,38);if(n>=38)clearInterval(iv);},30);scanT.push(iv);},q[2]));}

/* ---------- scratch to reveal (two cards) ---------- */
function makeScratch(card,cv,title,sub,onReveal){var me={ready:false,revealed:false},ctx=cv.getContext('2d'),moves=0,dust=null;
 me.setDust=function(d){dust=d;};
 me.init=function(){if(me.ready||me.revealed)return;me.ready=true;var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1,W=r.width,H=r.height;
  cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
  var g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#B98530');g.addColorStop(.22,'#F7DC93');g.addColorStop(.42,'#DDA845');g.addColorStop(.62,'#FCE7AE');g.addColorStop(.82,'#D49B3A');g.addColorStop(1,'#A8762A');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(var y=0;y<H;y+=1.3){ctx.fillStyle='rgba('+(Math.random()<.5?'255,250,235':'110,70,15')+','+(.025+Math.random()*.06).toFixed(3)+')';ctx.fillRect(0,y,W,.7);}
  for(var yy=12,row=0;yy<H;yy+=22,row++)for(var xx=(row%2)*11+8;xx<W;xx+=22){ctx.fillStyle='rgba(120,78,18,.30)';star(ctx,xx+.7,yy+.7,3.4,.4);ctx.fillStyle='rgba(255,247,220,.45)';star(ctx,xx-.4,yy-.4,3.4,.4);}
  var pg=ctx.createLinearGradient(0,H*.28,0,H*.72);pg.addColorStop(0,'rgba(255,246,220,.42)');pg.addColorStop(1,'rgba(255,236,190,.18)');ctx.fillStyle=pg;rr(ctx,W*.11,H*.28,W*.78,H*.44,16);ctx.fill();
  ctx.strokeStyle='rgba(120,78,18,.25)';ctx.lineWidth=1;rr(ctx,W*.11+.5,H*.28+.5,W*.78,H*.44,16);ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 500 21px Fraunces, Georgia, serif';
  ctx.fillStyle='rgba(255,250,232,.8)';ctx.fillText(title,W/2,H/2-6);ctx.fillStyle='rgba(74,23,48,.86)';ctx.fillText(title,W/2,H/2-7);
  ctx.font='500 8.5px "JetBrains Mono", ui-monospace, monospace';ctx.fillStyle='rgba(74,23,48,.6)';ctx.fillText(sub,W/2,H/2+16);
  ctx.strokeStyle='rgba(255,247,220,.6)';rr(ctx,6.5,6.5,W-13,H-13,16);ctx.stroke();
  var drawing=false,last=null;
  function pt(e){var b=cv.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top,cx:e.clientX,cy:e.clientY};}
  function scratch(p){ctx.globalCompositeOperation='destination-out';ctx.strokeStyle=ctx.fillStyle='#000';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=46;ctx.beginPath();
   if(last){ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();}else{ctx.arc(p.x,p.y,23,0,Math.PI*2);ctx.fill();}
   ctx.globalCompositeOperation='source-over';last=p;if(dust)dust.spray(p.cx,p.cy);if(++moves%6===0)check();if(navigator.vibrate&&moves%10===0)navigator.vibrate(3);}
  cv.addEventListener('pointerdown',function(e){if(me.revealed)return;card.classList.add('touched');drawing=true;last=null;cv.setPointerCapture(e.pointerId);scratch(pt(e));});
  cv.addEventListener('pointermove',function(e){if(drawing)scratch(pt(e));});
  function end(){drawing=false;last=null;check();}
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);};
 function check(){if(me.revealed||!cv.width)return;var data=ctx.getImageData(0,0,cv.width,cv.height).data,clear=0,tot=0;
  for(var i=3;i<data.length;i+=4*24){tot++;if(data[i]===0)clear++;}if(clear/tot>.38)me.reveal();}
 me.reveal=function(silent){if(me.revealed)return;me.revealed=true;card.classList.add('revealed');if(!silent){if(navigator.vibrate)navigator.vibrate([10,40,20]);if(dust)dust.burst();}
  onReveal(silent);updGift();};
 return me;}

var scr1=makeScratch(document.getElementById('scard'),document.getElementById('scratch'),'scratch for your founding price','R U B   W I T H   Y O U R   F I N G E R',function(){
 var ys=document.querySelector('.slide[data-offer="year"]');ys.classList.remove('locked');ys.querySelector('.txt').textContent='slide to start 7 days free';document.getElementById('reveal').style.visibility='hidden';});
document.getElementById('reveal').onclick=function(){scr1.init();scr1.reveal();};

/* ---------- finale: fireworks + a real 5-minute bonus ---------- */
var FKEY='belly_finale_v1',FDUR=5*60*1000,fT=null;
function fget(){try{return JSON.parse(localStorage.getItem(FKEY)||'null');}catch(e){return null;}}
function fset(v){try{localStorage.setItem(FKEY,JSON.stringify(v));}catch(e){}}
var fstate=fget();
var scard2=document.getElementById('scard2'),fslide=document.getElementById('fslide'),ftimer=document.getElementById('ftimer'),fclock=document.getElementById('fclock'),fbar=document.getElementById('fbar');
function fExpire(){clearInterval(fT);fT=null;ftimer.classList.remove('on');scard2.classList.add('isexp');
 document.getElementById('fh').textContent='Thank you for staying.';
 document.getElementById('fsub').textContent='The bonus ended, but your founding price hasn\'t: 7 days free, then $89 a year.';
 
 if(!fslide.classList.contains('done')){fslide.dataset.offer='year';fslide.classList.remove('locked');fslide.querySelector('.txt').textContent='slide to start 7 days free';fslide._reset&&fslide._reset();}
 document.getElementById('reveal2').style.visibility='hidden';updGift();}
function fTick(){var st=fget()||fstate;var left=st?st.exp-Date.now():0;
 if(left<=0){fExpire();return;}
 var m=Math.floor(left/60000),sec=Math.floor(left%60000/1000);fclock.textContent=m+':'+(sec<10?'0':'')+sec;
 fbar.style.transform='scaleX('+(left/FDUR).toFixed(4)+')';ftimer.classList.toggle('low',left<60000);}
function fStart(){if(window.BellyFunnel)BellyFunnel.bonusStart();ftimer.classList.add('on');fTick();clearInterval(fT);fT=setInterval(fTick,1000);
 if(!fslide.classList.contains('done')){fslide.classList.remove('locked');fslide.querySelector('.txt').textContent='slide to claim 14 days free';}
 document.getElementById('fsub').textContent='14 days free instead of 7. Then $89 a year, founding price.';
 document.getElementById('reveal2').style.visibility='hidden';}
var scr2=makeScratch(scard2,document.getElementById('scratch2'),'scratch for a thank-you','F O R   S T A Y I N G   T I L L   T H E   E N D',function(silent){
 if(!fstate){fstate={exp:Date.now()+FDUR};fset(fstate);}
 if(!silent)fireworks();fStart();});
document.getElementById('reveal2').onclick=function(){scr2.init();scr2.reveal();};
function initFinale(){if(fstate){scr2.reveal(true);return;}scr2.init();}
if(fstate){scr2.revealed=false;scr2.reveal(true);if(fstate.exp<=Date.now())fExpire();}

function fireworks(){var c=document.getElementById('fw'),x=c.getContext('2d'),d=window.devicePixelRatio||1,W=innerWidth,H=innerHeight;
 c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);
 var cols=['#F2B647','#E8622E','#B5386B','#2C9C8F','#FBEEE0','#FFE9B0'],rk=[],pt=[],t0=performance.now(),N=reduce?2:9;
 for(var i=0;i<N;i++)rk.push({at:i*(reduce?0:300)+Math.random()*140,x:W*(.15+Math.random()*.7),y:H+10,ty:H*(.14+Math.random()*.3),vy:0,live:false,done:false,col:cols[i%cols.length]});
 if(navigator.vibrate)navigator.vibrate([20,60,20,60,30]);
 (function f(now){var el=now-t0;x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.14)';x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';
  rk.forEach(function(r){if(r.done||el<r.at)return;if(!r.live){r.live=true;r.vy=-(Math.sqrt(2*0.24*(H-r.ty))+.5);}
   r.y+=r.vy;r.vy+=0.24;x.fillStyle='#FFE9B0';x.beginPath();x.arc(r.x,r.y,2.2,0,6.29);x.fill();
   if(r.vy>=-.4){r.done=true;var n=reduce?30:96;for(var k=0;k<n;k++){var a=k/n*6.283+Math.random()*.1,sp=1.6+Math.random()*4.4;pt.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:1,c:Math.random()<.25?'#FBEEE0':r.col});}}});
  pt.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vx*=.975;p.vy=p.vy*.975+.055;p.l-=.0105;if(p.l>0){x.globalAlpha=Math.max(0,p.l)*.35;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,5.5,0,6.29);x.fill();x.globalAlpha=Math.max(0,p.l);x.beginPath();x.arc(p.x,p.y,2.4,0,6.29);x.fill();}});
  x.globalAlpha=1;pt=pt.filter(function(p){return p.l>0;});
  if(el<5200||pt.length)requestAnimationFrame(f);else x.clearRect(0,0,W,H);})(t0);}

/* ---------- video slots: paste clip URLs (e.g. Higgsfield exports) to replace illustrations ---------- */
var VIDEO={scan:'',jar:'',herbs:'',breathe:''};
Object.keys(VIDEO).forEach(function(k){if(!VIDEO[k])return;var sc=document.querySelector('[data-n="'+k+'"] .visual');if(!sc)return;
 var v=document.createElement('video');v.className='vslot';v.src=VIDEO[k];v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='none';
 sc.innerHTML='';sc.style.borderRadius='28px';sc.style.overflow='hidden';sc.appendChild(v);});
function playVideos(n){[].forEach.call(document.querySelectorAll('video.vslot'),function(v){var mine=v.closest('[data-n="'+n+'"]');if(mine){v.play().catch(function(){});}else v.pause();});}

/* ---------- scene tracking ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;activeN=e.target.dataset.n;active=scenes.indexOf(e.target);updGift();
 bars.forEach(function(b,k){b.classList.toggle('seen',k<=active);});
 playVideos(activeN);onScene(activeN);
 if(activeN==='bella')runChat();
 if(activeN==='scan')runScan2();
 if(activeN==='glow')startAuto();else stopAuto();
 if(activeN==='breathe')startBreath();else stopBreath();
 if(activeN==='offer')scr1.init();
 if(activeN==='finale')initFinale();
 if(activeN==='shelf'&&!car._c){car._c=1;centerFirst();}
});},{root:feed,threshold:.6});
scenes.forEach(function(s){io.observe(s);});
(function(){var q=qp('s');if(!q)return;var t=document.querySelector('[data-n="'+q+'"]');if(t)setTimeout(function(){t.scrollIntoView();},50);})();

/* ---------- wallet sheet ---------- */
var BF=window.BellyFunnel||{track:function(){},email:function(){return '';},isTestMode:function(){return true;}};
function slug(s){return String(s).toLowerCase().replace(/&amp;|&/g,'and').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40)||'item';}
var T7='Free for 7 days, then $89/year. Renews automatically every year until you cancel. Cancel anytime before your trial ends and you won’t be charged.';
var T14='Free for 14 days, then $89/year. Renews automatically every year until you cancel. Cancel anytime before your trial ends and you won’t be charged.';
var TN='$89 today, then $89 every year. Renews automatically until you cancel. Cancel anytime.';
var TW='Sold out for now. We’ll email you when it’s available. No spam.';
function SOLD(key,item,done){return{soldout:true,key:key,item:item,price:'sold out',ship:false,terms:TW,done:done||"We'll let you know"};}
var OFFERS={trial:function(){return{plan:'trial',item:"belly · 7 days free",price:"$0.00 today",ship:false,bump:true,terms:T7,done:"You're in. Bella's waiting."};},
 bonus:function(){return{plan:'bonus',item:"belly · 14 days free",price:"$0.00 today",ship:false,bump:true,terms:T14,done:"You're in, founding mama"};},
 rem:function(){var r=REM[remSel];return SOLD('remedy_'+slug(r.n),r.n);},
 book:function(){var o=SOLD('recipe_book',"The Belly Recipe Book (e-book)");o.price='coming soon';o.terms='Coming soon. We’ll email you when it’s ready. No spam.';return o;},
 calm:function(){return SOLD('calm_'+slug(CALMN()),CALMN());},
 pick:function(){return SOLD('comfort_pick',"Comfort pick, "+(STOPS[Math.max(cur,0)].lab||"week "+STOPS[Math.max(cur,0)].w));},
 tip:function(b){return SOLD('tea_'+slug(b.dataset.item),b.dataset.item);},
 tea:function(){return SOLD('tea_raspberry_leaf_and_lemon_balm',"Raspberry Leaf & Lemon Balm");},
 herbs:function(){return SOLD('golden_elixir',"Golden Elixir (turmeric + raw honey)");},
 year:function(){return{plan:'year',item:"belly · 7 days free, then $89/yr",price:"$0.00 today",ship:false,bump:true,terms:T7,done:"Welcome, founding mama"};}};
var sheet=document.getElementById('sheet'),veil=document.getElementById('veil'),pay=document.getElementById('pay'),semail=document.getElementById('semail'),serr=document.getElementById('serr'),pend=null,busy=false;
function shipRows(on){[].forEach.call(document.querySelectorAll('.ship'),function(e){e.style.display=on?'':'none';});}
function payLabel(){return pend&&pend.o.soldout?'Notify me':(pend&&pend.o.plan==='notrial'?'Continue · $89 today':'Continue to secure checkout');}
function paint(){var o=pend.o;document.getElementById('sItem').textContent=o.item;document.getElementById('sPrice').textContent=o.price;
 document.getElementById('sTotL').textContent=o.soldout?'Status':'Total';shipRows(false);document.getElementById('terms').textContent=o.terms||'';
 document.getElementById('bumpl').textContent='Also tell me when the '+CALMN()+' is back';
 document.getElementById('bump').style.display=o.bump?'':'none';
 document.getElementById('sfoot').textContent=o.soldout?'one email when it’s back · unsubscribe anytime':(BF.isTestMode()?'secure checkout by stripe · test mode, no real charge':'secure checkout by stripe');
 pay.disabled=false;pay.textContent=payLabel();}
function openS(o,s){pend={o:o,s:s};serr.textContent='';semail.value=semail.value||BF.email();document.getElementById('bumpcb').checked=false;paint();
 veil.classList.add('on');sheet.classList.add('on');BF.track(o.soldout?'waitlist_sheet_open':'checkout_sheet_open',o.soldout?{product:o.key}:{offer:o.plan});
 setTimeout(function(){(semail.value?pay:semail).focus();},60);}
function closeS(ok){if(busy)return;veil.classList.remove('on');sheet.classList.remove('on');if(!pend)return;
 if(ok){pop(pend.s);pend.s.classList.add('done');pend.s.querySelector('.txt').textContent=pend.o.done;}else pend.s._reset();pend=null;}
function fail(msg){busy=false;pay.disabled=false;pay.textContent=payLabel();serr.textContent=msg||'Something went wrong. Try again.';}
function submit(){if(!pend||busy)return;var em=semail.value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){serr.textContent='Enter your email so we can send your sign-in link.';semail.focus();return;}
 serr.textContent='';busy=true;pay.disabled=true;pay.innerHTML='<span class="spin"></span>';
 if(pend.o.soldout){BF.waitlist([pend.o.key],em).then(function(){busy=false;pay.innerHTML='<span>You’re on the list</span>';setTimeout(function(){closeS(true);},750);},function(e){fail(e&&e.message);});return;}
 var extra=document.getElementById('bumpcb').checked?['calm_'+slug(CALMN())]:[];
 BF.checkout(pend.o.plan,em,extra).then(function(r){
  if(r&&r.url){pay.innerHTML='<span>Opening secure checkout…</span>';location.href=r.url;return;}
  var c=r&&r.code;
  if(c==='bonus_expired'){var s=pend.s;pend={o:OFFERS.year(),s:s};paint();fail('That bonus has ended, but your founding price is still here: 7 days free, then $89 a year.');return;}
  if(c==='trial_used'){pend.o={plan:'notrial',item:"belly · $89/yr",price:"$89.00 today",ship:false,bump:false,terms:TN,done:"Welcome back, mama"};paint();fail('Looks like you’ve already had a free trial. You can still join at the founding price.');return;}
  if(c==='already_member'){BF.loginLink(em);busy=false;pay.disabled=false;pay.textContent='Close';pay.onclick=null;serr.textContent='You’re already a member. We just emailed you a sign-in link.';pend.o.done='Check your email';pay.addEventListener('click',function once(){pay.removeEventListener('click',once);closeS(true);},{once:true});return;}
  if(c==='closed'){BF.waitlist(['membership'],em).then(function(){},function(){});fail('Memberships open very soon. We saved your spot and will email you.');return;}
  fail(r&&r.error);});}
pay.addEventListener('click',function(){if(pay.textContent==='Close')return;submit();});
semail.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit();}});
document.getElementById('cancel').onclick=function(){busy=false;closeS(false);};
veil.onclick=function(){if(!busy)closeS(false);};

/* ---------- slide-to-act ---------- */
[].forEach.call(document.querySelectorAll('.slide'),function(s){
 var t=s.querySelector('.thumb'),f=s.querySelector('.fill'),tx=s.querySelector('.txt'),x=0,x0=0,max=0,drag=false,T='transform .3s, width .3s';
 function set(v){x=Math.max(0,Math.min(max,v));t.style.transform='translateX('+x+'px)';f.style.width=(54+x)+'px';tx.style.opacity=1-Math.min(1,x/(max*.6));}
 s._reset=function(){t.style.transition=f.style.transition=T;set(0);};
 function fire(){if(navigator.vibrate)navigator.vibrate(12);openS(OFFERS[s.dataset.offer](),s);}
 t.addEventListener('pointerdown',function(e){if(s.classList.contains('done'))return;drag=true;max=s.clientWidth-54;x0=e.clientX-x;t.style.transition=f.style.transition='none';t.setPointerCapture(e.pointerId);});
 t.addEventListener('pointermove',function(e){if(drag)set(e.clientX-x0);});
 function up(){if(!drag)return;drag=false;if(x>max*.85){t.style.transition=f.style.transition=T;set(max);fire();}else s._reset();}
 t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up);
 t.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' '||e.key==='ArrowRight')&&!s.classList.contains('done')){e.preventDefault();max=s.clientWidth-54;t.style.transition=f.style.transition=T;set(max);setTimeout(fire,300);}});
});

function wireAdd(b){b._reset=function(){};b.addEventListener('click',function(){if(!b.classList.contains('done'))openS(OFFERS[b.dataset.offer](b),b);});}
[].forEach.call(document.querySelectorAll('.addbtn'),wireAdd);
document.getElementById('skip').onclick=function(){scenes[1].scrollIntoView({behavior:'smooth'});};
var TBT=[['Ginger Blend Tea',PRICES.tea],['Calm Evenings blend',PRICES.calm],['Raspberry Leaf & Lemon Balm',PRICES.tea]],feedN=0;
function tipScene(){var st=STOPS[feedN%STOPS.length],k=feedN++,t=TRI[st.t],tb=TBT[st.t]||TBT[1],yr=(k%2===0)||k%5===2||!ME.s||ME.s!=='pregnant';
 var e=document.createElement('section');e.className='scene';e.dataset.n='tip';
 e.innerHTML='<div class="amb" style="--c:'+t.c+';--y:35%"></div><div class="visual"><div class="gorb tipfruit" style="--g:'+t.g+';--gs:'+t.gs+'"><div class="fruit" style="--fs:'+st.s+'">'+cute(F[st.f],st.f)+'</div></div></div><div class="copy"><p class="mono">'+(st.lab||'week '+st.w)+' · '+(st.nm||'size of '+st.n)+'</p><h2 style="margin-top:8px">'+st.b+'</h2>'+(yr?'<button class="addbtn" data-offer="trial"><span class="txt">start 7 days free · $89/yr after</span></button>':'<button class="addbtn" data-offer="tip" data-item="'+tb[0]+'" data-price="'+tb[1]+'"><span class="txt">'+tb[0]+' · '+tb[1]+'</span></button>')+'</div>';
 if(k%5===2){e.querySelector('.visual').innerHTML=qaV(k);e.querySelector('.copy .mono').textContent='bella · ask anything';e.querySelector('.copy h2').textContent='Ask Bella anything.';e.querySelector('.addbtn .txt').textContent='ask Bella free for 7 days';e.querySelector('.addbtn').dataset.offer='trial';}return e;}
var endIO=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){endIO.unobserve(x.target);addBatch();}});},{root:feed,threshold:.5});
function addBatch(){for(var i=0;i<4;i++){var e=tipScene();feed.appendChild(e);scenes.push(e);io.observe(e);[].forEach.call(e.querySelectorAll('.addbtn'),wireAdd);}endIO.observe(scenes[scenes.length-2]);}
F.moon='<svg viewBox="0 0 100 100"><path d="M64 12a40 40 0 1 0 26 66A34 34 0 0 1 64 12z" fill="#F6D58A"/></svg>';
F.heart='<svg viewBox="0 0 100 100"><path d="M50 86S12 62 12 36a20 20 0 0 1 38-8 20 20 0 0 1 38 8c0 26-38 50-38 50z" fill="#E5588A"/></svg>';
F.sprout='<svg viewBox="0 0 100 100"><path d="M50 90V50" stroke="#4F8A2C" stroke-width="6" stroke-linecap="round"/><path d="M50 56C30 56 18 44 16 28c20-2 32 8 34 28z" fill="#6FB23A"/><path d="M50 46C66 46 78 36 82 20c-18-2-30 8-32 26z" fill="#86C94A"/></svg>';
F.star='<svg viewBox="0 0 100 100"><path d="M50 8l12 26 28 4-20 20 5 28-25-14-25 14 5-28L10 38l28-4z" fill="#F2B647"/></svg>';
FP.moon=[34,52,.7];FP.heart=[50,44,.8];FP.star=[50,52,.8];
function mk(a,t){return a.map(function(r,i){return{w:i+1,f:r[1],lab:r[0],nm:r[2],n:r[2],cm:'',s:.7,t:t[i],b:r[3]};});}
var SEAS={trying:mk([['cycle day 1','moon','a fresh start','Rest, warm food and an early night. Your body is resetting.'],['cycle day 7','sprout','energy returning','Energy rises. Nourishing meals and gentle movement now.'],['cycle day 14','star','your fertile window','The window is here. Stay hydrated and keep it calm.'],['cycle day 21','heart','the two-week wait','Be gentle with yourself. Bella is here for every wait.']],[0,1,2,1]),
postpartum:mk([['day 1','moon','rest first','Nothing is expected of you but rest and feeding.'],['week 1','heart','milk and mood','Warmth, water, and one person whose only job is you.'],['week 6','sprout','finding your rhythm','Your body is healing. Slow and steady wins.'],['month 3','star','you made it','The fourth trimester is ending. Look how far you have come.']],[0,1,2,1]),
little:mk([['newborn','moon','all the cuddles','Sleep when they sleep. Everything else can wait.'],['6 months','sprout','first foods','New tastes, new messes. Bella has gentle ideas.'],['1 year','star','first steps','Wobbly, brave, and so proud. So are you.'],['toddler','heart','big feelings','Big feelings need a calm grown-up. That is you.']],[0,1,2,1])};
var PREG=STOPS.slice(),PREGREM=REM.slice(),PREGHTML=car.innerHTML;
var SREM={trying:[['Cycle Balance Blend','Traditionally used to support cycle balance',PRICES.tea,'#6a2a12','#c2561f'],['Sepia 30c','Traditionally used to support hormonal balance','sold out','#5b1d3c','#a3386a'],['Pulsatilla 30c','Traditionally used to support emotional balance','sold out','#1f5c56','#2C9C8F']],
postpartum:[['Postpartum Recovery Blend','Traditionally used to support rest and recovery',PRICES.tea,'#6a2a12','#c2561f'],['Arnica 30c','Traditionally used to support body recovery','sold out','#7a5410','#d69a2a'],['Night Feed Calm blend','Warm, caffeine-free, made for 3am',PRICES.calm,'#1f5c56','#2C9C8F']],
little:[['Little Sleep Blend','A caffeine-free wind-down tea for you',PRICES.tea,'#6a2a12','#c2561f'],['Chamomilla 30c','Traditionally used to support rest','sold out','#7a5410','#d69a2a'],['After Bedtime Calm blend','Your quiet hour in a cup',PRICES.calm,'#1f5c56','#2C9C8F']]};
function setRems(list){if(!list){REM=PREGREM;car.innerHTML=PREGHTML;}else{REM=list.map(function(r){return{n:r[0],f:r[1],p:r[2],c:[r[3],r[4]]};});
 car.innerHTML=REM.map(function(r,k){return '<div class="card'+(k===0?' on':'')+'" data-k="'+k+'"><div class="bot"><i class="v" style="height:112px;background:linear-gradient(90deg,'+r.c[0]+','+r.c[1]+' 45%,'+r.c[0]+')"></i></div><span class="mono">bella recommends</span><p class="n">'+r.n+'</p><p class="f">'+r.f+'</p><span class="p">'+r.p+'</span></div>';}).join('');}
 cards=[].slice.call(car.children);cards.forEach(function(c){c.addEventListener('click',function(){car.scrollTo({left:c.offsetLeft-(car.clientWidth-c.offsetWidth)/2,behavior:'smooth'});});});pickRem(0);car._c=0;}
var CALM={pregnant:'Calm Evenings blend',trying:'Calm Evenings blend',postpartum:'Night Feed Calm blend',little:'After Bedtime Calm blend'};
function CALMN(){return CALM[ME.s]||CALM.pregnant;}
var GT={pregnant:['Forty weeks, one glow.','Drag it. Watch your baby grow.'],trying:['Every cycle, one glow.','Drag it. See what is ahead.'],postpartum:['Your fourth trimester, one glow.','Drag it. Look how far you have come.'],little:['Every stage, one glow.','Drag it. Watch them grow.']};
function applySeason(){var d=SEAS[ME.s];STOPS=d||PREG;
 [].forEach.call(track.querySelectorAll('.stop'),function(e){e.remove();});
 STOPS.forEach(function(x,j){var i=document.createElement('i');i.className='stop';i.style.left=(j/(STOPS.length-1)*100)+'%';track.appendChild(i);});
 touched=false;cur=-1;var k=ME.s?0:1;if(ME.s==='pregnant')STOPS.forEach(function(st,j){if(st.w<=ME.w)k=j;});setStop(k);
 var g=GT[ME.s]||GT.pregnant;document.getElementById('gh').textContent=g[0];document.getElementById('gsub').textContent=g[1];
 setRems(SREM[ME.s]);var gb=document.querySelector('#glowbtn .txt');if(gb&&ME.s==='pregnant')gb.textContent='see week '+ME.w+' inside · 7 days free';}
function pop(el){var r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,c=['#F2B647','#E8622E','#B5386B','#2C9C8F','#FBEEE0'];
 for(var i=0;i<16;i++){var d=document.createElement('i'),a=Math.random()*6.28,m=60+Math.random()*70;d.className='cf';
  d.style.cssText='left:'+x+'px;top:'+y+'px;background:'+c[i%5]+';--tx:'+(Math.cos(a)*m).toFixed(0)+'px;--ty:'+(Math.sin(a)*m-20).toFixed(0)+'px;--r:'+Math.floor(Math.random()*540)+'deg';
  document.body.appendChild(d);setTimeout(function(n){return function(){n.remove();};}(d),1100);}}
function updGift(){var g=document.getElementById('gift');if(!g)return;var o=scenes.findIndex(function(x){return x.id==='offer';}),f=scenes.findIndex(function(x){return x.id==='finale';});
 var t1=typeof scr1!=='undefined'&&scr1.revealed,t2=typeof scr2!=='undefined'&&scr2.revealed;
 var tgt=(!t1&&o>=active)?o:(!t2&&f>=active)?f:-1;if(tgt<0){g.textContent='';return;}var r=tgt-active,w=tgt===f?'a thank-you':'scratch card';
 g.textContent=r>1?w+' in '+r+' swipes':r===1?w+' next':(tgt===f?'scratch your thank-you':'scratch it now');}
var QA=[['Is it okay to feel this tired?','Very. Your body is doing huge work. Rest counts as progress.'],['Can I try a warm bath tonight?','Warm, not hot. Add chamomile and keep it short.'],['I keep forgetting everything.','Totally normal. Write it down and let me remember it for you.'],['Is this cramp okay?','Mild and brief is common. If it is strong or constant, call your midwife or doctor.']];
function qaV(k){var q=QA[k%QA.length];return '<div class="chat" style="height:auto;justify-content:center;-webkit-mask-image:none;mask-image:none"><div class="msg u">'+q[0]+'</div><div class="who"><span class="orb dot"></span>Bella</div><div class="msg b">'+q[1]+'</div></div>';}
document.getElementById('col2').innerHTML=document.getElementById('col').innerHTML;
function herbMass(n,x0,x1,y0,y1,pal){var D=['M-5 0L-2-3L2-2.5L5 0L2 3L-2 2.5Z','M-6-1L4-2L6 1L-3 2Z','M-3-3L3-2L2 3L-3 2Z'],h='';
 for(var i=0;i<n;i++){h+='<path transform="translate('+(x0+Math.random()*(x1-x0)).toFixed(1)+' '+(y0+Math.random()*(y1-y0)).toFixed(1)+') rotate('+Math.floor(Math.random()*360)+') scale('+(.7+Math.random()*1.1).toFixed(2)+')" d="'+D[i%3]+'" fill="'+pal[Math.floor(Math.random()*pal.length)]+'" opacity="'+(.65+Math.random()*.35).toFixed(2)+'"/>';}return h;}
var TJ1='RASPBERRY LEAF',TJ2='&amp; LEMON BALM';
function teaJar(){var B='M70 78C70 96 50 102 50 126L50 262Q50 282 70 282H170Q190 282 190 262V126C190 102 170 96 170 78Z',
 pal=['#3e4a22','#3e4a22','#55662c','#55662c','#6e8038','#6e8038','#8a9a4c','#8a9a4c','#2d3519','#2d3519','#a7b565','#5b4a2a','#5b4a2a','#b9667b'],rd='';
 for(var y=48;y<80;y+=4)rd+='M62 '+y+'H178';
 return '<svg viewBox="0 0 240 320" aria-hidden="true"><defs><clipPath id="tjc"><path d="'+B+'"/></clipPath><clipPath id="tjlc"><rect x="62" y="40" width="116" height="40" rx="7"/></clipPath>'+
 '<linearGradient id="tjg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".1" stop-color="#fff" stop-opacity=".06"/><stop offset=".9" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>'+
 '<linearGradient id="tjs" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".25" stop-color="#000" stop-opacity=".05"/><stop offset=".75" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>'+
 '<linearGradient id="tjv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>'+
 '<linearGradient id="tjb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c5a2a"/><stop offset="1" stop-color="#1b210d"/></linearGradient>'+
 '<linearGradient id="tjl" x1="0" x2="1"><stop offset="0" stop-color="#7d8087"/><stop offset=".2" stop-color="#f7f8fa"/><stop offset=".42" stop-color="#b5b8bf"/><stop offset=".68" stop-color="#eef0f3"/><stop offset="1" stop-color="#70737a"/></linearGradient>'+
 '<linearGradient id="tjp" x1="0" x2="1"><stop offset="0" stop-color="#d9cdb8"/><stop offset=".3" stop-color="#f4ecdc"/><stop offset=".7" stop-color="#eee3cf"/><stop offset="1" stop-color="#cfc2a9"/></linearGradient></defs>'+
 '<ellipse cx="120" cy="288" rx="92" ry="10" fill="rgba(0,0,0,.55)"/><ellipse cx="120" cy="289" rx="62" ry="6" fill="rgba(255,214,150,.2)"/>'+
 '<g clip-path="url(#tjc)"><rect x="40" y="112" width="160" height="180" fill="url(#tjb)"/>'+herbMass(560,48,192,108,284,pal)+'<rect x="40" y="108" width="160" height="180" fill="url(#tjv)"/><rect x="40" y="108" width="160" height="180" fill="url(#tjs)"/></g>'+
 '<path d="'+B+'" fill="url(#tjg)" stroke="rgba(255,255,255,.42)" stroke-width="1.6"/><path d="M60 132V252" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".2"/><path d="M72 124V152" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/><path d="M181 136V250" stroke="#fff" stroke-width="2" opacity=".18"/><path d="M76 92C74 106 62 112 58 126" stroke="#fff" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/><path d="M72 84H168M72 90H168" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/><path d="M54 266Q120 292 186 266" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"/>'+
 '<rect x="72" y="170" width="96" height="86" rx="3" fill="url(#tjp)"/><rect x="72" y="170" width="96" height="86" rx="3" fill="url(#tjs)" opacity=".4"/><text x="120" y="198" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="25" fill="#3A1A38">belly</text><path d="M96 206H144" stroke="#6B2331" stroke-width=".7"/><text x="120" y="219" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.2" letter-spacing="1" fill="#6B2331">'+TJ1+'</text><text x="120" y="229" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.2" letter-spacing="1" fill="#6B2331">'+TJ2+'</text><text x="120" y="246" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="4.6" letter-spacing="1" fill="#8a5a4a">LOOSE-LEAF BLEND · 2 OZ</text>'+
 '<g clip-path="url(#tjlc)"><rect x="62" y="40" width="116" height="40" fill="url(#tjl)"/><path d="'+rd+'" stroke="rgba(0,0,0,.16)" stroke-width="1"/><rect class="sheen" x="30" y="40" width="22" height="40" fill="rgba(255,255,255,.55)"/><rect x="62" y="40" width="116" height="4" fill="rgba(255,255,255,.7)"/></g><rect x="64" y="80" width="112" height="4" rx="2" fill="rgba(0,0,0,.28)"/></svg>';}
function elixir(){var B='M42 124C42 108 62 100 74 98H186C198 100 218 108 218 124V232Q218 266 186 266H74Q42 266 42 232Z',sp='';
 for(var i=0;i<40;i++)sp+='<circle cx="'+(52+Math.random()*156).toFixed(1)+'" cy="'+(120+Math.random()*138).toFixed(1)+'" r="'+(.8+Math.random()).toFixed(1)+'" fill="#3b2005" opacity=".55"/>';
 return '<svg viewBox="0 0 260 310" aria-hidden="true"><defs><clipPath id="elc"><path d="'+B+'"/></clipPath>'+
 '<linearGradient id="elq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2B02A"/><stop offset=".45" stop-color="#D88A12"/><stop offset="1" stop-color="#9C5506"/></linearGradient>'+
 '<linearGradient id="els" x1="0" x2="1"><stop offset="0" stop-color="#2a1000" stop-opacity=".6"/><stop offset=".22" stop-color="#2a1000" stop-opacity="0"/><stop offset=".78" stop-color="#2a1000" stop-opacity="0"/><stop offset="1" stop-color="#2a1000" stop-opacity=".65"/></linearGradient>'+
 '<linearGradient id="elg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".12" stop-color="#fff" stop-opacity=".05"/><stop offset=".88" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>'+
 '<radialGradient id="elt" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFD66E"/><stop offset="1" stop-color="#C97A0B"/></radialGradient>'+
 '<linearGradient id="elw" x1="0" x2="1"><stop offset="0" stop-color="#A97B44"/><stop offset=".4" stop-color="#E2BC84"/><stop offset="1" stop-color="#8E6330"/></linearGradient></defs>'+
 '<ellipse cx="130" cy="272" rx="102" ry="11" fill="rgba(0,0,0,.55)"/><ellipse cx="130" cy="273" rx="70" ry="7" fill="rgba(242,176,42,.32)"/>'+
 '<ellipse cx="130" cy="98" rx="58" ry="10" fill="rgba(255,255,255,.1)"/>'+
 '<g clip-path="url(#elc)"><rect x="40" y="112" width="180" height="162" fill="url(#elq)"/><g class="swl"><path d="M56 154Q108 138 150 158T216 150" stroke="rgba(255,222,140,.4)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M50 196Q104 180 156 202T224 192" stroke="rgba(255,222,140,.3)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M60 236Q112 222 160 240T220 232" stroke="rgba(255,222,140,.25)" stroke-width="5" fill="none" stroke-linecap="round"/></g>'+sp+'<circle cx="64" cy="132" r="2.4" fill="none" stroke="#FFE9A8" stroke-width="1"/><circle cx="196" cy="128" r="1.8" fill="none" stroke="#FFE9A8" stroke-width="1"/><rect x="40" y="112" width="180" height="162" fill="url(#els)"/></g>'+
 '<ellipse cx="130" cy="112" rx="56" ry="9" fill="url(#elt)"/><ellipse cx="108" cy="110" rx="18" ry="2.6" fill="#FFF1C2" opacity=".7"/>'+
 '<path d="'+B+'" fill="url(#elg)" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/><ellipse cx="130" cy="98" rx="58" ry="10" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><path d="M54 140V240" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".22"/><path d="M66 128V160" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/><path d="M208 140V236" stroke="#fff" stroke-width="2" opacity=".2"/>'+
 '<rect x="82" y="170" width="96" height="62" rx="4" fill="#F3EAD8"/><rect x="82" y="170" width="96" height="62" rx="4" fill="url(#els)" opacity=".3"/><text x="130" y="196" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="18" fill="#4A1730">golden elixir</text><path d="M104 203H156" stroke="#6B2331" stroke-width=".7"/><text x="130" y="215" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="5.6" letter-spacing="1" fill="#6B2331">TURMERIC · RAW HONEY</text><text x="130" y="225" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="4.6" letter-spacing="1" fill="#8a5a4a">belly · 4 OZ</text>'+
 '<g transform="translate(176 -16) rotate(18)"><rect x="-4" y="-10" width="8" height="96" rx="4" fill="url(#elw)"/><ellipse cx="0" cy="92" rx="13" ry="16" fill="url(#elw)"/><path d="M-12 84h24M-13 92h26M-12 100h24" stroke="rgba(60,30,5,.45)" stroke-width="1.4" fill="none"/></g>'+
 '<path class="drip" d="M148 88C147 98 149 106 148 112" stroke="#F4B83A" stroke-width="3.6" stroke-linecap="round" fill="none"/><ellipse class="rip" cx="148" cy="112" rx="4" ry="1" fill="none" stroke="#FFE08F" stroke-width="1.2"/>'+
 '<path class="tw" transform="translate(66 120)" d="M0-5L1.2-1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2-1.2Z" fill="#fff"/><path class="tw" style="animation-delay:1.2s" transform="translate(204 150)" d="M0-4L1-1L4 0L1 1L0 4L-1 1L-4 0L-1-1Z" fill="#fff"/><path class="tw" style="animation-delay:2.2s" transform="translate(190 100)" d="M0-4L1-1L4 0L1 1L0 4L-1 1L-4 0L-1-1Z" fill="#fff"/></svg>';}
var PHOTOS={tea:'',elixir:''};
var jst2=document.querySelectorAll('.jarstage');
if(jst2[0])jst2[0].innerHTML=PHOTOS.tea?'<img class="pimg" alt="Raspberry leaf and lemon balm blend" src="'+PHOTOS.tea+'">':teaJar();
if(jst2[1])jst2[1].innerHTML=PHOTOS.elixir?'<img class="pimg" alt="Golden elixir" src="'+PHOTOS.elixir+'">':elixir();
var FT={pregnant:[['Kick counter','tap me'],['Hospital bag','6 of 8 packed'],['Sleep rescue','2am, handled'],['Mood journal','how are you?'],['Appointments','never miss one'],['Birth plan','in your words']],
trying:[['Cycle tracker','day 14'],['Fertile window','5 days out'],['Sleep rescue','2am, handled'],['Mood journal','how are you?'],['Appointments','never miss one'],['Meal ideas','warm and easy']],
postpartum:[['Feed log','tap me'],['Recovery list','4 of 6 done'],['3am rescue','you are not alone'],['Mood journal','how are you?'],['Checkups','never miss one'],['Milestones','week by week']],
little:[['Sleep log','tap me'],['Milestones','first steps'],['Wind-down','bedtime, calmer'],['Mood journal','how are you?'],['Checkups','never miss one'],['Little recipes','picky-eater proof']]};
function setFeat(){var f=FT[ME.s]||FT.pregnant,t=document.querySelectorAll('.ft');kc=0;for(var i=0;i<6;i++){t[i].querySelector('b').textContent=f[i][0];t[i].querySelector('span').textContent=f[i][1];}}
var kc=0;document.getElementById('ft0').onclick=function(){kc++;this.querySelector('span').textContent=kc+(kc===1?' logged':' logged, nice');if(kc%3===0)pop(this);};
var RI=[[.5,'cup','rolled oats'],[1,'tsp','turmeric'],[1,'tbsp','raw honey'],[.5,'tsp','cinnamon']],sv=2;
function rcp(){document.getElementById('ri').innerHTML=RI.map(function(r){return '<li><b>'+(Math.round(r[0]*sv/2*4)/4)+'</b> '+r[1]+' '+r[2]+'</li>';}).join('');document.getElementById('svn').textContent='serves '+sv;}
document.getElementById('svp').onclick=function(){sv=Math.min(8,sv+1);rcp();};document.getElementById('svm').onclick=function(){sv=Math.max(1,sv-1);rcp();};rcp();setFeat();
var COL0=document.getElementById('col2').innerHTML;
var TR={pregnant:{nm:'Growing',o:['bella','scan','offer','glow','meme','breathe','courses','comm','feat','recipes','jar','shelf','herbs','finale'],
 me:['me at 3am, googling:','is this normal?','why am I crying at a commercial','can I eat this','Skip the 3am spiral.'],
 sc:['lavender calm','BODY LOTION · 8 FL OZ',"Know what's in it before it's on them.",''],sh:'Remedies chosen for this week.'},
trying:{nm:'The Wait',o:['bella','glow','offer','meme','scan','breathe','courses','comm','feat','recipes','jar','shelf','herbs','finale'],
 me:['me, day 9 of the wait:','is this a symptom or wishful thinking','how many days until I can test','did I do this right','Skip the two-week-wait spiral.'],
 sc:['rose glow','FACE SERUM · 1 FL OZ',"Know what's in it before it's on you.",''],sh:'Remedies chosen for your cycle.',
 po:[['A','ana · cycle 4','#2C9C8F','Two pink lines. I still do not believe it.'],['S','sade · cycle 9','#B5386B','Nine months of trying. Be gentle with yourself.'],['K','kim · cycle 2','#E8622E','Anyone else counting days to testing?'],['L','lena · cycle 6','#F2B647','Warm meals and early nights. That is my whole plan.']]},
postpartum:{nm:'Mama Mode',o:['bella','glow','offer','breathe','meme','scan','courses','comm','feat','recipes','jar','shelf','herbs','finale'],
 me:['me, holding baby at 3am:','is it normal that I cry every evening','how often should they eat','am I doing this right','Skip the 3am-feed spiral.'],
 sc:['soft wash','BABY WASH · 8 FL OZ',"Know what's in it before it's on them.",''],sh:'Remedies chosen for recovery.',
 po:[['M','maya · day 6','#2C9C8F','Nobody warned me about the 3am quiet.'],['J','jo · week 3','#B5386B','Cried happy tears and tired tears in the same hour.'],['T','tia · week 8','#E8622E','We left the house today. Victory.'],['R','rae · day 12','#F2B647','Anyone else awake feeding right now?']]},
little:{nm:'Big Feelings',o:['bella','scan','offer','meme','glow','breathe','courses','comm','feat','recipes','jar','shelf','herbs','finale'],
 me:['me, after bedtime, googling:','why will they only eat beige food','how do I get them to sleep','is this a phase','Skip the bedtime-battle spiral.'],
 sc:['sunny splash','KIDS SHAMPOO · 8 FL OZ',"Know what's in it before it's on them.",''],sh:'Remedies chosen for little ones.',
 po:[['D','dee · 2 yrs','#E8622E','Toddler ate a green thing. Frame it.'],['P','pia · 4 mo','#2C9C8F','Sleep regression is not a personality trait.'],['N','nia · 18 mo','#B5386B','Big feelings at the grocery store again.'],['C','cam · 3 yrs','#F2B647','Bedtime took 90 minutes. We survived.']]}};
function postsHtml(a){var h='';a.concat(a).forEach(function(q){h+='<div class="post"><div class="h"><span class="av" style="background:'+q[2]+'">'+q[0]+'</span><span class="w">'+q[1]+'</span></div><p class="t">'+q[3]+'</p></div>';});return h;}
/* ================= v3 module: custom funnels, Lens 2, ticket cards, product facts ================= */
var CUP='about 93¢ a cup';
var TK={
 pregnant:{
  scan:{n:'lavender calm',ty:'BABY LOTION · 8 FL OZ',h:"Know what’s in it before it’s on them.",lab:'#C9D8C2',ink:'#2F3F2C',
   ing:['Aqua','Glycerin','Shea Butter','Oat Extract','Phenoxyethanol','Parfum (Fragrance)','Tocopherol'],fl:{2:'ok',3:'ok',4:'look',5:'look'},score:62,
   say:'“Fragrance” can be a blend of undisclosed ingredients. Want a few gentler swaps?'},
  offer:"Founding mamas, this one’s yours.",
  tea:{n:'Raspberry Leaf & Lemon Balm',l1:'RASPBERRY LEAF',l2:'&amp; LEMON BALM',h:'Raspberry leaf &amp; lemon balm.',
   sub:'Hand-blended loose leaf. Traditionally used to support late-pregnancy comfort and a calm evening.',bens:['raspberry leaf','lemon balm','caffeine-free'],
   facts:[['Midwife classic','A traditional third-trimester ritual.'],['Caffeine-free','Sip it at 9pm. Sleep anyway.'],['Lemon balm','A calm-evening herb, traditionally.'],['About 93¢ a cup','Roughly 30 cups in every jar.'],['Small batch','Whole leaf, hand-blended, no dust.'],['Ask first','Check with your midwife before starting herbs.']]},
  rec:{t:'Golden milk oats',m:'tonight · 15 min · one bowl',ri:[[.5,'cup','rolled oats'],[1,'tsp','turmeric'],[1,'tbsp','raw honey'],[.5,'tsp','cinnamon']],fine:'raw honey is not for children under 1',oat:['#F6C453','#C98414']},
  crs:[[12,'Prep for birth','#6B2331','#B5386B'],[8,'Homeopathy, honestly','#1f5c56','#2C9C8F'],[6,'Rest &amp; your nervous system','#7a5410','#d69a2a'],[9,'Feeding &amp; recovery','#4A1730','#8A3A2C']],
  build:function(){var st=STOPS[0];STOPS.forEach(function(x){if(x.w<=ME.w)st=x;});return['Week '+ME.w+': about the size of '+st.n,'Bella tuned to trimester '+(ME.w<=13?1:ME.w<=27?2:3),'Your founding price, saved'];}
 },
 trying:{
  scan:{n:'rose glow',ty:'FACE SERUM · 1 FL OZ',h:"Know what’s in it before it’s on you.",lab:'#F2C9CF',ink:'#5A1F2E',
   ing:['Aqua','Niacinamide','Retinyl Palmitate','Hyaluronic Acid','Parfum (Fragrance)','Squalane','Tocopherol'],fl:{1:'ok',2:'look',3:'ok',4:'look',5:'ok'},score:58,
   say:'Retinoids are something many mamas pause while trying. Want a few swaps to ask your provider about?'},
  offer:'For every month of waiting.',
  tea:{n:'Cycle Comfort',l1:'NETTLE &amp; ROSE',l2:'+ PEPPERMINT',h:'Cycle Comfort.',
   sub:'Nettle, rose petal and peppermint. Warm, caffeine-free, and made for the wait.',bens:['nettle','rose petal','peppermint'],
   facts:[['Nettle','A leafy, mineral-rich classic.'],['Rose petal','Pretty enough for the two-week wait.'],['Peppermint','A cool, bright finish.'],['Caffeine-free','Sip it any hour of the day.'],['About 93¢ a cup','Roughly 30 cups in every jar.'],['Ask first','Check with your provider about herbs while trying.']]},
  rec:{t:'Warm lentil & greens bowl',m:'tonight · 20 min · one pot',ri:[[.5,'cup','red lentils'],[1,'cup','spinach'],[1,'tbsp','olive oil'],[.5,'','lemon, squeezed']],fine:'batch it once, eat well all week',oat:['#E8955A','#B4552A']},
  crs:[[7,'Know your cycle','#6B2331','#B5386B'],[8,'Food for the wait','#1f5c56','#2C9C8F'],[6,'Stress, sleep &amp; you','#7a5410','#d69a2a'],[8,'Homeopathy, honestly','#4A1730','#8A3A2C']],
  build:function(){return['Your cycle tracker, ready','Bella tuned to the wait','Your founding price, saved'];}
 },
 postpartum:{
  scan:{n:'soft wash',ty:'BABY WASH · 8 FL OZ',h:"Know what’s in it before it’s on them.",lab:'#C8DCEB',ink:'#1F3A55',
   ing:['Aqua','Coco-Glucoside','Glycerin','Sodium Benzoate','Parfum (Fragrance)','Aloe Leaf Juice','Citric Acid'],fl:{1:'ok',2:'ok',4:'look',5:'ok'},score:74,
   say:'Mostly gentle. The “fragrance” is the one to look at for newborn skin.'},
  offer:'For the 3am mamas.',
  tea:{n:'Nourish & Restore',l1:'OATSTRAW',l2:'NETTLE &amp; FENNEL',h:'Nourish &amp; Restore.',
   sub:'Oatstraw, nettle and fennel for the fourth trimester. Traditionally used to support rest and recovery.',bens:['oatstraw','nettle','fennel'],
   facts:[['Fennel','Traditionally sipped by nursing mamas.'],['Oatstraw','A gentle, nourishing classic.'],['Caffeine-free','Made for 3am feeds.'],['One-handed','Warm cup in one hand, baby in the other.'],['About 93¢ a cup','Roughly 30 cups in every jar.'],['Ask first','Check with your provider if you’re nursing.']]},
  rec:{t:'Ginger chicken congee',m:'tonight · 25 min · one pot',ri:[[.5,'cup','rice'],[1,'cup','shredded chicken'],[1,'tbsp','fresh ginger'],[3,'cups','broth']],fine:'one-handed eating, approved',oat:['#F4E6C8','#CDB27A']},
  crs:[[10,'The fourth trimester','#6B2331','#B5386B'],[9,'Feeding, your way','#1f5c56','#2C9C8F'],[7,'Recovery, gently','#7a5410','#d69a2a'],[6,'Sleep for two','#4A1730','#8A3A2C']],
  build:function(){return['Your fourth-trimester plan, ready','Bella tuned to 3am','Your founding price, saved'];}
 },
 little:{
  scan:{n:'sunny splash',ty:'KIDS SHAMPOO · 8 FL OZ',h:"Know what’s in it before it’s on them.",lab:'#F6DE8A',ink:'#5A3A0A',
   ing:['Aqua','Sodium Laureth Sulfate','Cocamidopropyl Betaine','Glycerin','Parfum (Fragrance)','Red 40','Citric Acid'],fl:{1:'look',3:'ok',4:'look',5:'look'},score:41,
   say:'Three worth a look, including a dye. Want a few kid-approved swaps?'},
  offer:'For the mamas of little ones.',
  tea:{n:'Mama’s Quiet Hour',l1:'CHAMOMILE',l2:'&amp; LAVENDER',h:'Mama’s Quiet Hour.',
   sub:'Chamomile, lemon balm and lavender, for the minute bedtime ends. Traditionally used to support a calm evening.',bens:['chamomile','lemon balm','lavender'],
   facts:[['Chamomile','The original wind-down.'],['Lavender','Floral, soft, a little fancy.'],['The quiet hour','Brew it the minute they’re asleep.'],['Caffeine-free','Bedtime is for you too.'],['About 93¢ a cup','Roughly 30 cups in every jar.'],['Grown-ups only','This one’s yours, mama.']]},
  rec:{t:'Banana oat pancakes',m:'breakfast · 10 min · one bowl',ri:[[1,'','ripe banana'],[.5,'cup','rolled oats'],[1,'','egg'],[.25,'tsp','cinnamon']],fine:'picky-eater approved, no added sugar',oat:['#E9B866','#B57A2A']},
  crs:[[8,'Big feelings, small people','#6B2331','#B5386B'],[6,'Picky eaters','#1f5c56','#2C9C8F'],[7,'Bedtime without battles','#7a5410','#d69a2a'],[5,'Mama’s own reset','#4A1730','#8A3A2C']],
  build:function(){return['Your little-ones toolkit, ready','Bella tuned to big feelings','Your founding price, saved'];}
 }
};
TK.all={scan:TK.pregnant.scan,offer:'Founding mamas, this one’s yours.',
 tea:{n:'Everyday Calm',l1:'CHAMOMILE',l2:'&amp; LEMON BALM',h:'Everyday Calm.',sub:'Chamomile and lemon balm, hand-blended. Traditionally used to support a calm evening.',bens:['chamomile','lemon balm','caffeine-free'],
  facts:[['Chamomile','The original wind-down.'],['Lemon balm','A calm-evening herb, traditionally.'],['Caffeine-free','Sip it at 9pm. Sleep anyway.'],['About 93¢ a cup','Roughly 30 cups in every jar.'],['Small batch','Whole leaf, hand-blended, no dust.'],['Ask first','Pregnant or nursing? Check with your provider.']]},
 rec:TK.pregnant.rec,crs:TK.pregnant.crs,build:function(){return['A little of everything, all yours','Bella, on call day and night','Your founding price, saved'];}};
var ELX=[['Turmeric + black pepper','Pepper’s piperine helps your body absorb turmeric.'],['Raw honey','Unpasteurized, straight from the hive.'],['Golden milk','Stir a spoon into warm milk. That’s the recipe.'],['An old ritual','A kitchen staple long before it was a latte.'],['4 oz jar','Weeks of golden evenings.'],['Heads up','Raw honey isn’t for babies under 1.']];
function TKC(){return TK[ME.s]||TK.all;}

SCRIPTS.all=[{w:"u",t:"I feel like I'm doing everything wrong today."},{w:"b",t:"You're not. Hard days don't mean you're failing. They mean you're carrying a lot."},{w:"b",t:"Let's make tonight lighter: one warm meal, one early night, one thing just for you. Want ideas?"},{w:"u",t:"Yes please."},{w:"b",t:"Then we start with the warm meal. I'll be right here."}];
TR.all={nm:'Every Mama',o:TR.pregnant.o.slice(),me:['me at 3am, googling:','is this normal?','why am I so tired','am I doing this right','Skip the 3am spiral.'],sc:TR.pregnant.sc,sh:'Remedies, gently chosen.'};

/* ---------- Belly Lens 2 ---------- */
var lensEl={},scanRun=0;
function wt(ms){return new Promise(function(r){setTimeout(r,ms);});}
function A(el,k,o){return el.animate(k,Object.assign({fill:'forwards'},o));}
function buildLens(){var D=TKC().scan,v=document.querySelector('[data-n="scan"] .visual');if(!v)return;scanRun++;
 v.innerHTML='<div class="sc2"><div class="dev"><div class="cam2"><div class="bok"></div>'+
 '<div class="prod2" style="--lab:'+D.lab+';--ink:'+D.ink+'"><i class="pump"></i><i class="neck"></i><div class="pbody"><div class="plab"><p class="pn">'+D.n+'</p><p class="pt">'+D.ty+'</p><p class="ph">INGREDIENTS</p><ul class="pi">'+
 D.ing.map(function(x,i){return '<li>'+x+'</li>';}).join('')+'</ul><i class="beam2"></i></div></div></div>'+
 '<div class="brk2"><i></i><i></i><i></i><i></i></div>'+
 '<div class="hud"><span class="stat"><i class="dotr"></i><span class="lstat">finding the label</span></span><span class="stat">belly lens</span></div>'+
 '<div class="sheet2"><div class="rtop2"><div class="rg2"><svg viewBox="0 0 60 60"><defs><linearGradient id="rgg" x1="0" x2="1"><stop offset="0" stop-color="#F2B647"/><stop offset="1" stop-color="#E8622E"/></linearGradient></defs><circle class="bg" cx="30" cy="30" r="24"/><circle class="fg2" cx="30" cy="30" r="24"/></svg><b>0</b></div>'+
 '<div><p class="st2"></p><p class="mono" style="margin-top:3px">score out of 100</p></div></div><div class="fl2"></div><div class="bs2"><span class="orb dot"></span><span class="bt"></span></div></div>'+
 '</div></div></div>';
 var q=function(s){return v.querySelector(s);};
 lensEl={v:v,cam:q('.cam2'),prod:q('.prod2'),lab:q('.plab'),lines:[].slice.call(v.querySelectorAll('.pi li')),beam:q('.beam2'),brk:q('.brk2'),stat:q('.lstat'),sheet:q('.sheet2'),ring:q('.fg2'),num:q('.rg2 b'),st:q('.st2'),fl:q('.fl2'),bt:q('.bt')};
 var nl=0;D.ing.forEach(function(x,i){if(D.fl[i]==='look')nl++;});
 lensEl.st.textContent=nl+(nl===1?' thing':' things')+' worth a look';
 lensEl.fl.innerHTML=D.ing.map(function(x,i){return D.fl[i]?'<span class="'+(D.fl[i]==='look'?'bad':'ok')+'">'+x.toLowerCase()+'</span>':'';}).join('');
 var h=document.querySelector('[data-n="scan"] .copy h2');if(h)h.innerHTML=D.h;
 if(activeN==='scan')runScan2();}
async function runScan2(){var my=++scanRun,E=lensEl,D=TKC().scan;if(!E.v)return;
 [E.prod,E.brk,E.beam,E.sheet,E.ring].concat([].slice.call(E.fl.children)).forEach(function(e){if(e.getAnimations)e.getAnimations().forEach(function(a){a.cancel();});});
 E.lines.forEach(function(l){l.className='';});E.bt.textContent='';E.num.textContent='0';E.stat.textContent='finding the label';
 var C=150.8,SP='cubic-bezier(.2,1.15,.35,1)',score=D.score;
 if(reduce){E.prod.style.opacity=1;E.brk.style.opacity=1;E.sheet.style.transform='none';E.lines.forEach(function(l,i){l.className=D.fl[i]==='look'?'hl hb':D.fl[i]==='ok'?'hl hg':'';});
  E.ring.style.strokeDashoffset=C*(1-score/100);E.num.textContent=score;[].forEach.call(E.fl.children,function(c){c.style.opacity=1;});E.bt.textContent=D.say;E.stat.textContent='done';return;}
 A(E.prod,[{transform:'translate(-50%,46%) rotate(-9deg) scale(.9)',filter:'blur(8px)',opacity:0},{transform:'translate(-50%,0) rotate(-3deg) scale(1)',filter:'blur(4px)',opacity:1}],{duration:850,easing:SP});
 A(E.brk,[{opacity:0,transform:'scale(1.08)'},{opacity:1,transform:'none'}],{duration:500,delay:200,easing:'ease-out'});
 await wt(880);if(my!==scanRun)return;
 var c=E.cam.getBoundingClientRect(),l=E.lab.getBoundingClientRect(),p=7;
 function pc(v,t){return (Math.max(0,v)/t*100).toFixed(2)+'%';}
 E.stat.textContent='hold steady';
 A(E.brk,[{top:'9%',right:'9%',bottom:'9%',left:'9%'},{top:pc(l.top-c.top-p,c.height),right:pc(c.right-l.right-p,c.width),bottom:pc(c.bottom-l.bottom-p,c.height),left:pc(l.left-c.left-p,c.width)}],{duration:650,easing:SP});
 A(E.prod,[{transform:'translate(-50%,0) rotate(-3deg) scale(1)',filter:'blur(4px)',opacity:1},{transform:'translate(-50%,0) rotate(0deg) scale(1.03)',filter:'blur(0px)',opacity:1}],{duration:650,easing:'cubic-bezier(.3,.8,.3,1)'});
 await wt(720);if(my!==scanRun)return;
 E.stat.textContent='reading ingredients';
 var lh=E.lab.offsetHeight;
 A(E.beam,[{transform:'translateY(-6px)',opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.9},{transform:'translateY('+lh+'px)',opacity:0}],{duration:1500,easing:'cubic-bezier(.45,0,.55,1)'});
 E.lines.forEach(function(li,i){var f=D.fl[i],t=(li.offsetTop+li.offsetHeight/2)/lh;setTimeout(function(){if(my!==scanRun)return;li.className=f==='look'?'hl hb':f==='ok'?'hl hg':'';if(f&&navigator.vibrate)navigator.vibrate(3);},Math.max(0,(t-.02))*1500);});
 await wt(1600);if(my!==scanRun)return;
 E.stat.textContent=D.ing.length+' ingredients read';
 A(E.sheet,[{transform:'translateY(115%)'},{transform:'translateY(0)'}],{duration:720,easing:SP});
 await wt(280);if(my!==scanRun)return;
 A(E.ring,[{strokeDashoffset:C},{strokeDashoffset:C*(1-score/100)}],{duration:1300,easing:'cubic-bezier(.2,.8,.2,1)'});
 var t0=performance.now();(function cnt(n){var k=Math.min(1,(n-t0)/1300),e=1-Math.pow(1-k,3);E.num.textContent=Math.round(score*e);if(k<1&&my===scanRun)requestAnimationFrame(cnt);})(t0);
 [].forEach.call(E.fl.children,function(ch,i){A(ch,[{transform:'scale(.6) translateY(6px)',opacity:0},{transform:'none',opacity:1}],{duration:440,delay:260+i*110,easing:SP});});
 await wt(1150);if(my!==scanRun)return;
 E.bt.innerHTML='<span class="typing2"><i></i><i></i><i></i></span>';await wt(850);if(my!==scanRun)return;
 var s=D.say,k=0;E.bt.textContent='';
 while(k<s.length){k=Math.min(s.length,k+2);E.bt.textContent=s.slice(0,k);await wt(24);if(my!==scanRun)return;}
 E.stat.textContent='done';
 await wt(4600);if(my!==scanRun||activeN!=='scan')return;
 A(E.sheet,[{transform:'translateY(0)'},{transform:'translateY(115%)'}],{duration:480,easing:'cubic-bezier(.5,0,.75,0)'});
 A(E.prod,[{opacity:1},{opacity:0}],{duration:420});A(E.brk,[{opacity:1},{opacity:0}],{duration:300});
 await wt(560);if(my!==scanRun||activeN!=='scan')return;runScan2();}

/* ---------- ticket cards: wrap, sparkle, gold dust ---------- */
function star(x,px,py,s,r){x.save();x.translate(px,py);x.rotate(r||0);x.beginPath();for(var i=0;i<8;i++){var q=i%2?s*.32:s,a=i*Math.PI/4;x.lineTo(Math.cos(a)*q,Math.sin(a)*q);}x.closePath();x.fill();x.restore();}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function dustFor(card){var c=card.parentNode.querySelector('.dust'),x=c.getContext('2d'),P=[],run=false,d=window.devicePixelRatio||1;
 function size(){var r=c.getBoundingClientRect();if(c.width!==Math.round(r.width*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);}}
 function loop(){x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,c.width,c.height);
  P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.98;p.l-=p.dl;p.r+=p.vr;if(p.l>0){x.globalAlpha=Math.min(1,p.l);x.fillStyle=p.c;if(p.st)star(x,p.x,p.y,p.s,p.r);else x.fillRect(p.x,p.y,p.s,p.s);}});
  x.globalAlpha=1;P=P.filter(function(p){return p.l>0;});if(P.length)requestAnimationFrame(loop);else{run=false;x.clearRect(0,0,c.width,c.height);}}
 function go(){if(!run){run=true;requestAnimationFrame(loop);}}
 var G=['#F6D58A','#E3B04F','#FBE3A6','#C9973A'];
 return{spray:function(cx,cy){size();var r=c.getBoundingClientRect(),X=cx-r.left,Y=cy-r.top;
   for(var i=0;i<4;i++)P.push({x:X+(Math.random()-.5)*14,y:Y+(Math.random()-.5)*8,vx:(Math.random()-.5)*2.4,vy:-Math.random()*1.4,g:.17,l:1,dl:.016+Math.random()*.02,s:1.2+Math.random()*2.4,c:G[i%4],r:0,vr:0});
   if(Math.random()<.28)P.push({x:X,y:Y,vx:(Math.random()-.5)*1.4,vy:-1-Math.random()*1.5,g:.04,l:1.2,dl:.013,s:4+Math.random()*3,c:'#FFF3C8',st:1,r:0,vr:.08});go();},
  burst:function(){size();var r=c.getBoundingClientRect(),cr=card.getBoundingClientRect(),X=cr.left-r.left+cr.width/2,Y=cr.top-r.top+cr.height/2,C=['#F2B647','#FFE9B0','#E8622E','#FBEEE0','#F6D58A'];
   for(var i=0;i<110;i++){var a=Math.random()*6.283,s=2+Math.random()*6.5;P.push({x:X+(Math.random()-.5)*cr.width*.7,y:Y+(Math.random()-.5)*cr.height*.5,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2.6,g:.14,l:1.35,dl:.010+Math.random()*.012,s:i%3?2+Math.random()*2.6:5+Math.random()*4.5,st:i%3===0,c:C[i%5],r:Math.random()*3,vr:(Math.random()-.5)*.22});}go();}};}
[['scard',scr1],['scard2',scr2]].forEach(function(pair){var card=document.getElementById(pair[0]);if(!card||card.parentNode.classList.contains('tkwrap'))return;
 var w=document.createElement('div');w.className='tkwrap';card.parentNode.insertBefore(w,card);w.appendChild(card);
 var sh=document.createElement('div');sh.className='sheen2';card.appendChild(sh);var hi=document.createElement('div');hi.className='hint';card.appendChild(hi);
 var dc=document.createElement('canvas');dc.className='dust';dc.setAttribute('aria-hidden','true');w.appendChild(dc);
 [[-16,18],[-10,72],[104,10],[102,58],[18,-12],[70,-14],[30,104],[84,102]].forEach(function(p,i){var t=document.createElement('i');t.className='tw4';t.style.left=p[0]+'%';t.style.top=p[1]+'%';t.style.animationDelay=(i*.37)+'s';if(i%2)t.style.width=t.style.height='8px';w.appendChild(t);});
 pair[1].setDust(dustFor(card));});

/* ---------- product facts + sparkles ---------- */
var factT=null,factI={};
['jar','herbs'].forEach(function(n){var v=document.querySelector('[data-n="'+n+'"] .visual');if(!v)return;
 var f=document.createElement('div');f.className='facts';v.appendChild(f);
 for(var i=0;i<7;i++){var t=document.createElement('i');t.className='tw4';t.style.left=(12+Math.random()*76)+'%';t.style.top=(6+Math.random()*80)+'%';t.style.animationDelay=(Math.random()*2.8).toFixed(2)+'s';if(i%2)t.style.width=t.style.height='8px';v.appendChild(t);}
 var js=v.querySelector('.jarstage');if(js){js.style.position='relative';var th=document.createElement('span');th.className='taphint';th.textContent='tap the jar';v.appendChild(th);
  js.addEventListener('click',function(){js.classList.remove('tapped');void js.offsetWidth;js.classList.add('tapped');pop(js);if(f._one)f._one();});}});
(function(){var hs=document.querySelector('[data-n="herbs"] .copy h2');if(hs&&!document.getElementById('elxsub')){var p=document.createElement('p');p.className='sub';p.id='elxsub';p.textContent='Turmeric, raw honey and black pepper. One spoon in warm milk is golden milk.';hs.parentNode.insertBefore(p,hs.nextSibling);}})();
function factsStart(n){factsStop();var sc=document.querySelector('[data-n="'+n+'"]'),box=sc&&sc.querySelector('.facts');if(!box)return;
 var list=n==='jar'?TKC().tea.facts:ELX,slots=[[0,'1%'],[1,'17%'],[0,'50%'],[1,'66%']],k=factI[n]||0;
 function one(){var f=list[k%list.length],s=slots[k%4];k++;factI[n]=k;var e=document.createElement('div');e.className='fact';e.style[s[0]?'right':'left']='0';e.style.top=s[1];
  e.innerHTML='<i class="fi"></i><div><b>'+f[0]+'</b><span>'+f[1]+'</span></div>';box.appendChild(e);setTimeout(function(){e.remove();},4900);}
 box._one=one;one();factT=setInterval(one,reduce?4200:2300);}
function factsStop(){clearInterval(factT);factT=null;}
function onScene(n){if(n==='jar'||n==='herbs')factsStart(n);else factsStop();if(n!=='scan')scanRun++;}

/* ---------- apply a path ---------- */
function applyTK(){var T=TKC();buildLens();
 var off=document.querySelector('#offer .copy h2');if(off)off.innerHTML=T.offer;
 var js=document.querySelector('[data-n="jar"]');js.querySelector('.copy h2').innerHTML=T.tea.h;js.querySelector('.copy .sub').innerHTML=T.tea.sub;
 js.querySelector('.bens').innerHTML=T.tea.bens.map(function(b){return '<span>'+b+'</span>';}).join('');
 var pm=js.querySelector('.price .mono');if(pm)pm.textContent=CUP;
 var nt=js.querySelector('.note');if(nt){var NT={pregnant:'Ask your midwife or doctor before using herbs in pregnancy.',trying:'Ask your provider about herbs while you\u2019re trying.',postpartum:'Nursing? Ask your provider before starting herbs.',little:'Pregnant or nursing? Ask your provider first.',all:'Pregnant or nursing? Ask your provider first.'};nt.lastChild.textContent=NT[ME.s||'all']||NT.all;}
 TJ1=T.tea.l1;TJ2=T.tea.l2;var j0=js.querySelector('.jarstage');if(j0&&!PHOTOS.tea)j0.innerHTML=teaJar();
 var rs=document.querySelector('[data-n="recipes"]');rs.querySelector('.rn').textContent=T.rec.t;rs.querySelector('.rc .mono').textContent=T.rec.m;rs.querySelector('.copy .mono.fine').textContent=T.rec.fine;
 RI.length=0;T.rec.ri.forEach(function(r){RI.push(r);});rcp();
 var st=document.querySelectorAll('#oat stop');if(st.length>1){st[0].setAttribute('stop-color',T.rec.oat[0]);st[1].setAttribute('stop-color',T.rec.oat[1]);}
 document.querySelector('.crs').innerHTML=T.crs.map(function(c,i){return '<div class="cc" style="--a:'+c[2]+';--b:'+c[3]+'"><span class="cn">'+c[0]+'</span><span class="mono" style="color:var(--cream)">lessons</span><p class="ct">'+c[1]+'</p>'+(i===0?'<div class="eq"><i></i><i></i><i></i><i></i></div>':'')+'</div>';}).join('');
 factI={};}
OFFERS.tea=function(){return SOLD('tea_'+slug(TKC().tea.n),TKC().tea.n);};

/* ---------- the 'building your Belly' moment ---------- */
function showBuild(cb){var h=document.querySelector('.hello'),b=h.querySelector('.build');if(!b){b=document.createElement('div');b.className='build';h.appendChild(b);}
 var items=TKC().build(),step=reduce?60:380;
 b.innerHTML='<div class="orb"></div><h2>Building your Belly…</h2><ul>'+items.map(function(t){return '<li><i></i><span>'+t+'</span></li>';}).join('')+'</ul>';
 requestAnimationFrame(function(){b.classList.add('on');});var lis=b.querySelectorAll('li');
 [].forEach.call(lis,function(li,i){setTimeout(function(){li.classList.add('on');if(navigator.vibrate)navigator.vibrate(6);},350+i*step);});
 setTimeout(function(){b.querySelector('h2').textContent=(ME.s&&ME.s!=='all'&&TR[ME.s])?'Your '+TR[ME.s].nm+' Belly is ready.':'Your Belly is ready.';},350+lis.length*step+120);
 setTimeout(function(){cb();setTimeout(function(){b.classList.remove('on');},800);},350+lis.length*step+(reduce?200:900));}
go.onclick=function(){applySeason();showBuild(function(){scenes[1].scrollIntoView({behavior:'smooth'});});};
document.getElementById('skip').onclick=function(){ME.s='all';seasonBtns.forEach(function(b){b.setAttribute('aria-pressed','false');});wkpick.classList.remove('on');chatRun=false;applyTrack();
 showBuild(function(){scenes[1].scrollIntoView({behavior:'smooth'});});};

function applyTrack(){var t=TR[ME.s];if(!t)return;applySeason();
 t.o.forEach(function(n){var e=document.querySelector('section[data-n="'+n+'"]');if(e)feed.appendChild(e);});
 [].forEach.call(document.querySelectorAll('section[data-n="tip"]'),function(e){feed.appendChild(e);});
 scenes.length=0;[].forEach.call(feed.querySelectorAll('section.scene'),function(e){scenes.push(e);});
 var m=document.querySelector('[data-n="meme"]'),q=m.querySelectorAll('.mq');m.querySelector('.mm .mono').textContent=t.me[0];q[0].textContent=t.me[1];q[1].textContent=t.me[2];q[2].textContent=t.me[3];m.querySelector('.copy h2').textContent=t.me[4];
 var tx=document.querySelectorAll('svg.prod text');if(tx[1]){tx[0].textContent=t.sc[0];tx[1].textContent=t.sc[1];}
 document.querySelector('[data-n="scan"] .copy h2').textContent=t.sc[2];
 document.querySelector('[data-n="shelf"] .copy h2').textContent=t.sh;
 document.getElementById('col2').innerHTML=t.po?postsHtml(t.po):COL0;
 setFeat();go.textContent='Take me to '+t.nm;document.querySelector('.top .mark span').textContent=t.nm.toLowerCase();updGift();applyTK();}
seasonBtns.forEach(function(b){b.addEventListener('click',applyTrack);});
wkin.addEventListener('input',function(){if(ME.s==='pregnant')applySeason();});
(function(){var q=qp('t');if(q&&TR[q]){ME.s=q;seasonBtns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.s===q);});wkpick.classList.toggle('on',q==='pregnant');go.classList.add('on');chatRun=false;applyTrack();setTimeout(function(){var sq=qp('s'),t=sq&&document.querySelector('[data-n="'+sq+'"]');(t||scenes[1]).scrollIntoView();},80);}})();
(function(){if(ME.s)return;TR.pregnant.o.forEach(function(n){var e=document.querySelector('section[data-n="'+n+'"]');if(e)feed.appendChild(e);});
 scenes.length=0;[].forEach.call(feed.querySelectorAll('section.scene'),function(e){scenes.push(e);});})();
if(!ME.s)applyTK();
updGift();
addBatch();
})();
