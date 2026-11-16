(function(){
var b=document.body,o=document.getElementById('open');
function open(){b.classList.add('opened');window.scrollTo(0,0)}
o.onclick=function(){b.classList.add('opening');setTimeout(open,900)};
if(location.hash&&location.hash!=='#')open();
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in')})},{threshold:.12});
document.querySelectorAll('.day,.weekp,.pg').forEach(function(s){io.observe(s)});
document.querySelectorAll('#book a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var el=document.getElementById(a.getAttribute('href').slice(1));if(!el)return;e.preventDefault();el.scrollIntoView({behavior:'smooth'})})});
})();
