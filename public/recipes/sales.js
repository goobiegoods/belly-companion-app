const st=document.getElementById('s'),hw=document.getElementById('hw');
function fit(){const k=Math.min(1,innerWidth/1080);st.style.transform='scale('+k+')';hw.style.height=(1350*k)+'px'}
fit();addEventListener('resize',fit);
const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){setTimeout(()=>st.classList.add('open'),500);io.disconnect()}});io.observe(st);
document.getElementById('bk').addEventListener('click',function(){st.classList.toggle('open')});
var go=document.getElementById('go'),msg=document.getElementById('msg'),label=go.innerHTML;
function reset(){go.disabled=false;go.innerHTML=label}
addEventListener('pageshow',reset);
go.addEventListener('click',function(){if(go.disabled)return;if(window.BellyAttr)BellyAttr.track('ebook_checkout_click',{product:'recipes'});go.disabled=true;go.innerHTML='Opening secure checkout…';msg.textContent='';
 fetch('/api/ebook-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:'recipes',attr:window.BellyAttr?BellyAttr.get():null})}).then(function(r){return r.json()}).then(function(j){if(j.url){location.href=j.url}else{throw new Error(j.error||'Checkout is unavailable')}}).catch(function(e){reset();msg.textContent=e.message})});

