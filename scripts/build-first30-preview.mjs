// Builds public/first30/preview.html: the real book, cover + Week 1 intro + Days 1-3, ending on the buy card.
// Run after the book changes: node scripts/build-first30-preview.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('../api/_lib/first30-book.ts', import.meta.url), 'utf8');
const h = JSON.parse(src.match(/FIRST30_HTML = (".*");/s)[1]);
const cut = (a, b) => { const i = h.indexOf(a), j = h.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return h.slice(i, j); };
let head = h.slice(0, h.indexOf('<body'));
head = head.replace(/<title>[^<]*<\/title>/, '')
  .replace('</head>', '<title>Free preview · The First 30</title><meta name="description" content="Read the first three days of The First 30, Belly\'s day-by-day guide for the first month with baby."><meta property="og:title" content="The First 30 · free preview"><meta property="og:image" content="https://meetbelly.com/og.jpg"><link rel="icon" href="/favicon.ico" sizes="any"><meta name="theme-color" content="#150A1F"></head>');
let cover = h.slice(h.indexOf('<body'), h.indexOf('<main id="book">'))
  .replace('Open the book <i>→</i>', 'Read the first 3 days <i>→</i>');
const week = cut('<section class="weekp grain" id="w1"', '<section class="day" id="d1"').replace(/href="#d[4-7]"/g, 'href="#buy"');
let days = cut('<section class="day" id="d1"', '<section class="day" id="d4"')
  .replace(/<button class="dn all" data-toc>All days<\/button>/g, '<a class="dn all" href="#buy">All 30 days</a>')
  .replace('<a class="dn next" href="#d4"><span>Day 04</span><i>→</i></a>', '<a class="dn next" href="#buy"><span>Day 04</span><i>→</i></a>');
const buy = `<section id="buy" class="glowbg grain pg end"><div class="dnum serif" style="opacity:.9">04</div><h2 class="serif w">Day 4 is <span class="acc">waiting.</span></h2>
  <p class="sub">27 more days like these. Plus The Herbivore shopping list, the remedy shelf, five warm recipes and the 30-day check to print.</p>
  <div class="card bella"><div class="orb" style="--s:40px"></div><div><span class="mono" style="color:var(--ember)">The First 30 · one time</span><h4 class="serif">$29, or $24 with code MAMA5. Instant download. No subscription.</h4></div><a class="pill" href="/first30#buy">Get all 30 days <i>→</i></a></div>
  <p class="mono" style="color:#FBEEE066;margin-top:40px;font-size:10px">© 2026 Belly · The First 30 · Vol. 01 · meetbelly.com</p></section>`;
const out = head + cover + '<main id="book">\n ' + week + days + buy + '\n</main><script src="/first30/preview.js" defer></script>\n</body></html>';
writeFileSync(new URL('../public/first30/preview.html', import.meta.url), out);
console.log('preview.html', out.length, 'bytes');
