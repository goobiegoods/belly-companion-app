

# Baby Tracker — Full emoji audit & fix

## What's wrong

Reviewing all 40 weeks, I found multiple emoji↔fruit mismatches (the user-reported three plus several more). Unicode lacks dedicated emojis for some fruits (lentil, raspberry, cherry, fig, kumquat, papaya, jicama, butternut squash, winter melon), so I'll pick the closest visual match in each case and document it.

## All emoji changes

| Week | Fruit | Current | Issue | New |
|---|---|---|---|---|
| 6  | Lentil           | 🫐 | blueberry | 🫛 (peas — closest small green legume) |
| 8  | Raspberry        | 🍓 | strawberry | 🫐 (closest small red/purple cluster berry) |
| 9  | Cherry           | 🍇 | grape cluster | 🍒 (cherries) |
| 10 | Kumquat          | 🍓 | strawberry | 🍊 (small orange citrus — closest) |
| 11 | Fig              | 🫐 | blueberry | 🍑 (no fig emoji; pear-shaped purple fruit closest is peach tone — keep visual approximation) → use 🟣 alternative? Going with 🍑 best-shape match |
| 22 | Papaya           | 🍐 | pear | 🥭 (no papaya emoji; mango is the closest tropical orange-fleshed fruit) |
| 32 | Jicama           | 🥔 | potato (acceptable — jicama is a root, no dedicated emoji) | keep 🥔 |
| 38 | Winter melon     | 🍈 | melon (acceptable) | keep 🍈 |

### Final decisions for tricky ones

- **Week 11 Fig** — there's no fig emoji in standard Unicode. Best options: 🍑 (peach, similar teardrop shape & purple-pink hue) or 🍇 (grape, similar dark color). I'll go with **🍑** for shape match.
- **Week 22 Papaya** — no papaya emoji. **🥭** (mango) is the closest in size, color, and tropical category. This reuses the same emoji as Week 19 (Mango) but they're 3 weeks apart and the labels differ.
- **Week 8 Raspberry** — no raspberry emoji. **🫐** (blueberries — clustered small berries) is closer than 🍓 (strawberry), which is a single large smooth berry.

### Sanity check — entries that are already correct, no change

W1–5 🫘 seeds ✓ · W7 🫐 blueberry ✓ · W12 🥝 lime (kiwi stands in — actually let me flag) · W13 🍑 peach ✓ · W14 🍋 lemon ✓ · W15 🍎 apple ✓ · W16 🥑 avocado ✓ · W17 🍐 pear ✓ · W18 🫑 bell pepper ✓ · W19 🥭 mango ✓ · W20 🍌 banana ✓ · W21 🥕 carrot ✓ · W23 🍊 grapefruit ✓ · W24 🌽 corn ✓ · W25 🥦 cauliflower (broccoli stands in — no cauliflower emoji, acceptable) · W26 🥒 zucchini ✓ · W27 🥬 lettuce ✓ · W28 🍆 eggplant ✓ · W29 🥥 butternut squash (no squash emoji, coconut is poor — change to 🎃 pumpkin/squash family) · W30 🥬 cabbage ✓ · W31 🥥 coconut ✓ · W33 🍍 pineapple ✓ · W34–35 🍈 melons ✓ · W36–37 🥬 lettuce/chard ✓ · W39–40 🍉 watermelon ✓

### Two more I'm flagging

- **Week 12 Lime** — currently 🥝 (kiwi). There IS a lime emoji (🍋‍🟩) but support is spotty. **Change to 🟢** is wrong. Best portable option: keep **🥝** (similar small green fruit) OR use **🍋** with note. Recommend keeping 🥝 since 🍋 is already used at W14.
- **Week 29 Butternut squash** — currently 🥥 (coconut, very wrong shape & color). Change to **🎃** (closest squash-family emoji, orange-fleshed gourd).

## Final consolidated change list

| Week | Old → New | Reason |
|---|---|---|
| 6  | 🫐 → 🫛 | lentil ≠ blueberry; peas closest small legume |
| 8  | 🍓 → 🫐 | raspberry ≠ strawberry; blueberries closest cluster berry |
| 9  | 🍇 → 🍒 | cherry ≠ grapes (literal cherry emoji exists) |
| 10 | 🍓 → 🍊 | kumquat ≠ strawberry; small orange citrus closest |
| 11 | 🫐 → 🍑 | fig ≠ blueberry; peach closest in shape |
| 22 | 🍐 → 🥭 | papaya ≠ pear; mango closest tropical fruit |
| 29 | 🥥 → 🎃 | butternut squash ≠ coconut; pumpkin same family |

7 emoji edits in `src/data/pregnancyWeeks.ts`. No other files touched.

## Test plan

After deploy, scrub through weeks 6, 8, 9, 10, 11, 22, 29 and confirm the hero card emoji visually matches the fruit name. Spot-check W7 (🫐 blueberry), W13 (🍑 peach), W23 (🍊 grapefruit) to ensure nothing else regressed.

