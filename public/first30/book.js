
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
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.day,.weekp,.pg,.home').forEach(s=>io.observe(s));

document.getElementById('printbtn').onclick=function(){window.print()};
