

# Fix Community.tsx & Shop.tsx — Text Colors, Category System, Card Polish

## Changes

### Community.tsx

**1. Update CATEGORY_STYLES constant (line 30-35)**
Replace with new category color system:
- question: `{ bg: "rgba(255,210,185,0.4)", text: "#E07040", ring: "rgba(255,140,80,0.3)", avatarBg: "rgba(255,210,185,0.6)" }`
- tip: `{ bg: "rgba(200,240,208,0.4)", text: "#40A060", ring: "rgba(140,210,160,0.3)", avatarBg: "rgba(210,244,216,0.6)" }`
- story: `{ bg: "rgba(225,210,252,0.4)", text: "#9060D0", ring: "rgba(190,155,240,0.3)", avatarBg: "rgba(230,215,255,0.6)" }`
- support: `{ bg: "rgba(255,240,200,0.4)", text: "#B08020", ring: "rgba(200,170,80,0.3)", avatarBg: "rgba(255,240,200,0.6)" }`

**2. Add titleCase helper + short title filter**
- Add `const titleCase = (s: string) => s?.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ') || ''`
- After fetching/filtering posts, add `.filter(p => p.title && p.title.trim().length >= 4)`

**3. Text color updates across all sections**
Replace all `#2A1200` with warm orange equivalents:
- Screen title "Community" → `#C85828`, `fontWeight: 600`
- Subtitle → `#D4906A`, `fontWeight: 400`
- Author names → `#B86040`, `fontWeight: 600`, wrap in `titleCase()`
- Post titles → `#A84E28`, `fontWeight: 600`
- Post body → `#C4906A`, `fontWeight: 400`
- Timestamps → `rgba(180,100,60,0.38)`
- Like/comment counts → `rgba(180,100,60,0.45)`
- Liked heart → `#FF7840`
- Unlike heart → `rgba(180,100,60,0.4)`
- Filter inactive → `#C4784A`
- Notifications title → `#C85828`
- Notification item title → `#A84E28`
- Comment author → `#B86040`
- Comment body → `#A84E28`
- Post detail title → `#A84E28`
- Post detail body → `#C4906A`

**4. Post card styling**
- Card: `background: rgba(255,255,255,0.72)`, `border: 0.5px solid rgba(255,170,130,0.18)`, `borderRadius: 15px`, `backdropFilter: blur(12px)`, `boxShadow: 0 1px 8px rgba(255,140,90,0.05)`, `padding: 11px 13px`
- Bottom action row: `borderTop: 0.5px solid rgba(255,170,130,0.14)`, `paddingTop: 6px`, `marginTop: 7px`, `gap: 10px`
- Category pill: `borderRadius: 6px`, `padding: 2px 7px`, `fontSize: 6.5px`, `fontWeight: 600`
- Week badge: `background: rgba(255,200,170,0.25)`, `border: 0.5px solid rgba(255,170,130,0.3)`, `borderRadius: 7px`, `padding: 2px 6px`, `fontSize: 6px`
- Avatar: use `catStyle.avatarBg` for bg, `box-shadow: 0 0 0 1.5px ${catStyle.ring}` for ring

**5. Delete test posts via SQL**
Run: `DELETE FROM public.posts WHERE length(title) < 4 OR title IN ('eee','frr','rrrr','test') OR body IN ('eee','rrrr','eeee');`

### Shop.tsx

**6. Text color updates**
Replace all `#2A1200` with warm orange:
- "Belly Shop" → `#C85828`, `fontWeight: 600`
- Subtitle → `#D4906A`, `fontWeight: 400`
- Section labels → `rgba(200,88,40,0.4)`, `fontSize: 10px`, `fontWeight: 600`, `letterSpacing: 0.11em`
- Hero title → `#FFF9F6`, `fontWeight: 600`
- Hero body → `rgba(255,255,255,0.7)`, `fontWeight: 400`
- Kit titles → `#A84E28`, `fontWeight: 600`
- Kit descriptions → `#C4906A`
- Kit contents → `#D4B098`
- Prices → `#A84E28`, `fontWeight: 600`
- "Add to cart" button → `color: white`
- "Most popular" badge → `background: rgba(255,184,153,0.25)`, `color: #C4622A`
- Remedy titles → `#A84E28`
- Remedy use → `#C4906A`
- "✓ Pregnancy safe" → `#40A060`
- Active tab → `background: linear-gradient(135deg, #FF7840, #FFA070)`, `color: white`
- Inactive tab → `background: rgba(255,255,255,0.7)`, `border: 0.5px solid rgba(255,170,130,0.3)`, `color: #C4784A`
- Cart titles → `#A84E28`
- Subtotal label → `#A84E28`
- Learn tab titles → `#A84E28`
- Course descriptions → `#C4906A`

**7. Card styling**
- Kit cards: `background: rgba(255,255,255,0.75)`, `border: 0.5px solid rgba(255,170,130,0.2)`, `borderRadius: 18px`, `backdropFilter: blur(10px)`, `boxShadow: 0 4px 16px rgba(255,140,90,0.08)`
- Kit emoji header: `background: linear-gradient(135deg, #FF9F6B, #FFCDB4)`, `height: 72px`
- Remedy cards: `background: rgba(255,255,255,0.72)`, `border: 0.5px solid rgba(255,170,130,0.18)`, `borderRadius: 16px`, `backdropFilter: blur(12px)`

## Files touched
- `src/pages/Community.tsx` — full text color + category + card polish pass
- `src/pages/Shop.tsx` — full text color + card polish pass
- SQL delete for test posts (via insert tool)

