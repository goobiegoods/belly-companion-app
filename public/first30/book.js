const K='first30-v2';let S={};try{S=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
document.querySelectorAll('input[type=checkbox]').forEach(cb=>{const id=cb.dataset.d?('d'+cb.dataset.d+'_'+cb.dataset.i):('p'+cb.dataset.p);cb.checked=!!S[id];cb.addEventListener('change',()=>{S[id]=cb.checked;save();paint()})});
function done(n){return [0,1,2].every(i=>S['d'+n+'_'+i])}
function paint(){let c=0;for(let n=1;n<=30;n++){const d=done(n);if(d)c++;document.querySelectorAll('[data-dot="'+n+'"]').forEach(e=>e.classList.toggle('on',d));const m=document.getElementById('m'+n);if(m)m.classList.toggle('on',d)}
 document.getElementById('pbar').style.width=(c/30*100)+'%';document.getElementById('pnum').textContent=c+'/30'}
const mg=document.getElementById('mg');for(let n=1;n<=30;n++){const a=document.createElement('a');a.href='#d'+n;a.id='m'+n;a.className='mg';a.innerHTML='<i></i><span>'+String(n).padStart(2,'0')+'</span>';mg.appendChild(a)}
paint();
const open=()=>{document.body.classList.add('opened');try{sessionStorage.setItem('f30o','1')}catch(e){}};
document.getElementById('open').onclick=()=>{document.body.classList.add('opening');setTimeout(()=>{open();location.hash='#home';window.scrollTo(0,0)},900)};
if(location.hash&&location.hash!=='#'||(()=>{try{return sessionStorage.getItem('f30o')}catch(e){}})())open();
const toc=document.getElementById('toc'),root=document.documentElement;
function lastDay(){const l=+S.last||0;if(l&&!done(l))return l;for(let n=1;n<=30;n++)if(!done(n))return n;return 30}
function paintToc(){const L=lastDay();document.querySelectorAll('.tday').forEach(t=>{const n=+t.dataset.tn;t.classList.toggle('on',done(n));t.classList.toggle('now',n===L)});
 document.getElementById('tcont').href='#d'+L;document.getElementById('tcl').textContent='Day '+String(L).padStart(2,'0')}
function openToc(){paintToc();toc.classList.add('show');toc.setAttribute('aria-hidden','false');document.body.classList.add('tocon');const nw=toc.querySelector('.tday.now');if(nw)setTimeout(()=>nw.scrollIntoView({block:'center'}),30)}
function closeToc(){toc.classList.remove('show');toc.setAttribute('aria-hidden','true');document.body.classList.remove('tocon')}
function jump(id){const el=document.getElementById(id);if(!el)return;root.style.scrollBehavior='auto';el.scrollIntoView();history.replaceState(null,'','#'+id);setTimeout(()=>root.style.scrollBehavior='',50)}
document.querySelectorAll('[data-toc]').forEach(b=>b.addEventListener('click',openToc));
document.querySelectorAll('[data-tocx]').forEach(b=>b.addEventListener('click',closeToc));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeToc()});
toc.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;e.preventDefault();closeToc();jump(a.getAttribute('href').slice(1))});
document.querySelectorAll('.dnav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();jump(a.getAttribute('href').slice(1))}));
const seen=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){S.last=+e.target.dataset.n;save()}}),{threshold:.35});document.querySelectorAll('.day').forEach(s=>seen.observe(s));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.day,.weekp,.pg,.home').forEach(s=>io.observe(s));

document.getElementById('printbtn').onclick=function(){window.print()};
