(function(){var f=document.getElementById('f'),em=document.getElementById('em'),msg=document.getElementById('msg'),b=f.querySelector('button');
f.addEventListener('submit',function(e){e.preventDefault();var v=(em.value||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){msg.textContent='That email doesn’t look right.';return}
b.disabled=true;msg.textContent='Sending…';
fetch('/api/ebook-resend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v})}).then(function(r){return r.json()}).then(function(){msg.innerHTML='If that email bought a Belly book, your link is on its way. Check your inbox (and Promotions).'}).catch(function(){msg.textContent='Something went wrong. Try again in a minute.';b.disabled=false})})})();
