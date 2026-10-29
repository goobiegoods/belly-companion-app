#!/usr/bin/env python3
"""
Builds public/landing/{index.html,feed.js} from belly-feed-deploy.html.

The design file stays the source of truth (edit it, re-run this). This script
only applies the revenue/compliance wiring as exact, asserted replacements —
if a target string changes in the design file, the build fails loudly instead
of silently shipping a mock checkout.

    python3 scripts/build-landing.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "belly-feed-deploy.html"
OUT = ROOT / "public" / "landing"

html = SRC.read_text(encoding="utf-8")


def rep(text, old, new, count=1, label=""):
    n = text.count(old)
    if n != count:
        sys.exit(f"build-landing: expected {count}x, found {n}x: {label or old[:80]!r}")
    return text.replace(old, new)


# Course shelf = real courses that exist in the app (src/data/coursesData.ts,
# src/data/shopData.ts homeopathyCourses), with their real lesson counts.
REAL_COURSES = {
    "pregnant":   [(8, "Third Trimester Prep"), (4, "What is Homeopathy?"), (5, "Sleep &amp; Rest Techniques"), (7, "Postpartum Planning")],
    "trying":     [(7, "Nutrition &amp; Herbal Safety"), (6, "Stress &amp; Anxiety Support"), (5, "Sleep &amp; Rest Techniques"), (4, "What is Homeopathy?")],
    "postpartum": [(7, "Postpartum Planning"), (5, "Sleep &amp; Rest Techniques"), (6, "Stress &amp; Anxiety Support"), (7, "Nutrition &amp; Herbal Safety")],
    "little":     [(6, "Stress &amp; Anxiety Support"), (5, "Sleep &amp; Rest Techniques"), (7, "Nutrition &amp; Herbal Safety"), (4, "Building Your Home Remedy Kit")],
}
_seen = []
def _fix_crs(m):
    pre = html[max(0, m.start() - 3000):m.start()]
    key = re.findall(r"\b(pregnant|trying|postpartum|little)\s*:\s*\{", pre)[-1]
    _seen.append(key)
    items = iter(REAL_COURSES[key])
    def one(mm):
        n, name = next(items)
        return "[%d,'%s'" % (n, name)
    return re.sub(r"\[\d+,'[^']+'", one, m.group(0))
html = re.sub(r"crs:\[\[.*?\]\]", _fix_crs, html)
if sorted(_seen) != sorted(REAL_COURSES):
    sys.exit(f"build-landing: course shelves changed: {_seen}")
_static = iter(REAL_COURSES["pregnant"])
def _fix_static(m):
    n, name = next(_static)
    return '<span class="cn">%d</span><span class="mono" style="color:var(--cream)">lessons</span><p class="ct">%s</p>' % (n, name)
html, _cnt = re.subn(r'<span class="cn">\d+</span><span class="mono" style="color:var\(--cream\)">lessons</span><p class="ct">[^<]+</p>', _fix_static, html)
if _cnt != 4:
    sys.exit(f"build-landing: expected 4 static course cards, found {_cnt}")

# ---------------------------------------------------------------- split script
m = re.search(r"<script>\n(.*?)</script>", html, re.S)
if not m or html.count("<script>") != 1:
    sys.exit("build-landing: expected exactly one inline <script>")
js = m.group(1)
html = html[: m.start()] + '<script src="/landing/desktop.js"></script>\n<script src="/landing/funnel.js"></script>\n<script src="/landing/feed.js"></script>' + html[m.end():]

# Desktop frame (public/landing/desktop.js adds .dk on wide screens).
DESKTOP_CSS = """
/* desktop frame */
@media (min-width:1024px) and (min-height:640px){
html.dk body{display:grid;grid-template-columns:minmax(0,500px) 430px;column-gap:clamp(48px,7vw,110px);align-items:center;justify-content:center;padding:24px;
 background:radial-gradient(60% 70% at 15% 10%,rgba(242,182,71,.18),transparent 60%),radial-gradient(55% 65% at 90% 100%,rgba(181,56,107,.3),transparent 70%),var(--night)}
html.dk .dk-phone{position:relative;width:430px;height:min(900px,calc(100vh - 48px));height:min(900px,calc(100dvh - 48px));border-radius:46px;overflow:hidden;transform:translateZ(0);background:var(--night);
 box-shadow:0 0 0 10px #241326,0 0 0 11px rgba(251,238,224,.12),0 40px 120px rgba(0,0,0,.6),0 0 140px rgba(242,182,71,.14)}
html.dk .dk-phone .feed{height:100%}
.dk-side{color:var(--cream);max-width:500px}
.dk-mark b{display:block;font:italic 400 34px var(--serif)}
.dk-mark span{font:500 10px var(--mono);letter-spacing:.24em;text-transform:uppercase;color:var(--faint)}
.dk-eyebrow{margin:44px 0 0;font:500 12px var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.dk-h{margin:14px 0 0;font:400 clamp(40px,4.2vw,58px)/1.06 var(--serif);letter-spacing:-.01em;text-wrap:balance}
.dk-h em{color:var(--gold,#F2B647)}
.dk-p{margin:20px 0 0;font-size:17px;font-weight:300;line-height:1.55;color:var(--soft);max-width:40ch}
.dk-list{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:10px;font-size:15px;color:var(--soft)}
.dk-list li::before{content:"\\2713";color:var(--gold,#F2B647);margin-right:10px}
.dk-qr{display:flex;align-items:center;gap:18px;margin-top:38px;padding:16px;border-radius:20px;background:rgba(251,238,224,.06);border:1px solid rgba(251,238,224,.14);width:max-content;max-width:100%}
.dk-code{width:104px;height:104px;padding:8px;border-radius:12px;background:#FBEEE0;flex:none}
.dk-code svg{width:100%;height:100%;display:block}
.dk-code path{fill:#150A1F}
.dk-qr b{display:block;font-size:15px;font-weight:600}
.dk-qr span{display:block;margin-top:4px;font-size:13.5px;color:var(--soft);max-width:24ch;line-height:1.4}
}
"""
if html.count("</style>") < 1:
    sys.exit("build-landing: no </style> for desktop CSS")
_i = html.index("</style>")
html = html[:_i] + DESKTOP_CSS + html[_i:]

# ---------------------------------------------------------------- markup
html = rep(html, '<title>belly · virtual doula</title>',
           '<title>belly · virtual doula</title>\n<meta name="description" content="Belly is a warm virtual doula for every season of motherhood.">\n<meta name="robots" content="index,follow">\n<link rel="icon" href="/favicon.ico">')
# Sold-out products: same slide UI, honest label.
html = rep(html, '<span class="txt">slide to steep it</span><button class="thumb" aria-label="Buy the everyday wellness tea">',
           '<span class="txt">sold out · notify me</span><button class="thumb" aria-label="Get notified when the tea is back">')
html = rep(html, '<span class="txt">slide to make it yours</span><button class="thumb" aria-label="Buy the golden elixir">',
           '<span class="txt">sold out · notify me</span><button class="thumb" aria-label="Get notified when the golden elixir is back">')
html = rep(html, '<span class="txt" id="remtxt">slide to add</span><button class="thumb" aria-label="Buy the selected remedy">',
           '<span class="txt" id="remtxt">sold out · notify me</span><button class="thumb" aria-label="Get notified when the selected remedy is back">')
# No price-lock promise (removed per Orel).
html = rep(html, '<span class="was">a year · founding price, locked for life</span>',
           '<span class="was">a year · founding price</span>')
html = rep(html, ' Keep this price for as long as you stay.</p>', '</p>')
# Finale bonus = 14 days free only (e-books come later as store items).
html = rep(html, '<span class="gift-l">+ the belly recipe book, on us</span>',
           '<span class="gift-l">twice the free days, on us</span>')
html = rep(html, '<span class="txt">slide to get the recipe book</span>',
           '<span class="txt">coming soon · notify me</span>')

old_sheet = re.search(r'<div class="sheet" id="sheet".*?<button class="cancel" id="cancel">Cancel</button>\n</div>\n', html, re.S)
if not old_sheet or "demo only" not in old_sheet.group(0):
    sys.exit("build-landing: sheet markup changed")
html = html.replace(old_sheet.group(0), '''<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Checkout">
  <div class="grab"></div>
  <dl><dt>From</dt><dd>belly</dd><dt>Item</dt><dd id="sItem"></dd><dt class="ship">Ship to</dt><dd class="ship">add your address next</dd><dt id="sTotL">Total</dt><dd class="big" id="sPrice"></dd></dl>
  <label class="vh" for="semail">Email</label>
  <input class="semail" id="semail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="your email" required>
  <label class="bump" id="bump"><input type="checkbox" id="bumpcb"><span id="bumpl"></span></label>
  <p class="terms" id="terms"></p>
  <p class="serr" id="serr" role="alert" aria-live="polite"></p>
  <button class="pay" id="pay"></button>
  <p class="mono" id="sfoot" style="text-align:center;margin-top:10px"></p>
  <p class="legal"><a href="/terms" target="_blank" rel="noopener">Terms</a> · <a href="/privacy" target="_blank" rel="noopener">Privacy</a> · <a href="/auto-renewal" target="_blank" rel="noopener">Auto-renewal</a> · <a href="/landing/privacy-choices.html" target="_blank" rel="noopener">Your privacy choices</a></p>
  <button class="cancel" id="cancel">Cancel</button>
</div>
''')
html = rep(html, "</style>", """.semail{display:block;width:100%;height:50px;margin:0 0 14px;padding:0 14px;border-radius:14px;background:rgba(0,0,0,.22);border:1px solid rgba(251,238,224,.18);color:var(--cream);font:400 16px var(--sans);outline:none}
.semail::placeholder{color:var(--faint)}.semail:focus{border-color:rgba(242,182,71,.6);box-shadow:0 0 0 3px rgba(242,182,71,.15)}
.serr{margin:-6px 0 12px;font-size:13px;line-height:1.45;color:#FFB59A;text-align:center}.serr:empty{display:none}
.legal{margin-top:8px;text-align:center;font-size:11.5px;color:var(--faint)}.legal a{color:var(--soft);text-decoration:underline;text-underline-offset:2px}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.pay:disabled{opacity:.7;cursor:default}
.veil{z-index:41}.sheet{z-index:42} /* keep checkout above finale fireworks */
</style>""", label="style close")

# ---------------------------------------------------------------- script
js = rep(js, "function qp(k){var v=new URLSearchParams(location.search).get(k);if(v)return v;",
         "function qp(k){var I=window.__BELLY_INIT||{};if(I[k])return I[k];var v=new URLSearchParams(location.search).get(k);if(v)return v;")

# No placeholder prices on a public page — products are sold out until confirmed.
js = rep(js, "var PRICES={tea:'$28',herbs:'$38',book:'$12',calm:'$22',pick:'$16'};",
         "/* Placeholder prices removed until products + prices are confirmed. */\nvar PRICES={tea:'sold out',herbs:'sold out',book:'coming soon',calm:'sold out',pick:'sold out'};")
js = rep(js, 'p:"$34.99"', 'p:"sold out"')
js = rep(js, 'p:"$9.99"', 'p:"sold out"', count=js.count('p:"$9.99"'))
js = rep(js, "'$9.99'", "'sold out'", count=js.count("'$9.99'"))
if "$9.99" in js or "$34.99" in js:
    sys.exit("build-landing: a remedy price survived")
js = rep(js, "remtxt.textContent='slide to add · '+REM[k].p;", "remtxt.textContent='sold out · notify me';")
js = rep(js, "<span class=\"txt\">add '+tb[0]+' · '+tb[1]+'</span>", "<span class=\"txt\">'+tb[0]+' · '+tb[1]+'</span>")

# Offers: subscription → real checkout; everything physical/digital → waitlist.
start = js.index("var T7=")
end = js.index("veil.onclick=function(){closeS(false);};") + len("veil.onclick=function(){closeS(false);};")
js = js[:start] + r"""var BF=window.BellyFunnel||{track:function(){},email:function(){return '';},isTestMode:function(){return true;}};
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
veil.onclick=function(){if(!busy)closeS(false);};""" + js[end:]

js = rep(js, 'OFFERS.tea=function(){return{item:TKC().tea.n,price:PRICES.tea,ship:true,done:"Steeping its way to you"};};',
         "OFFERS.tea=function(){return SOLD('tea_'+slug(TKC().tea.n),TKC().tea.n);};")
js = rep(js, "function fStart(){", "function fStart(){if(window.BellyFunnel)BellyFunnel.bonusStart();")
js = rep(js, "'14 days free instead of 7, plus the recipe e-book. Then $89 a year, founding price.'",
         "'14 days free instead of 7. Then $89 a year, founding price.'")

for bad in ["Prep for birth", "Homeopathy, honestly", "Know your cycle", "Big feelings, small people", "locked for life", "as long as you stay", "recipe e-book", "recipe book, on us", "demo only", "Face ID", "var FACE", "$199", "$28", "$38", "$12'", "$22", "$16"]:
    if bad in js or bad in html:
        sys.exit(f"build-landing: leftover {bad!r}")

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "index.html").write_text(html, encoding="utf-8")
(OUT / "feed.js").write_text("/* Generated from belly-feed-deploy.html by scripts/build-landing.py — do not edit by hand. */\n" + js, encoding="utf-8")
print("build-landing: wrote", OUT / "index.html", "and feed.js")
