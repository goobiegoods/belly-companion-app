interface Props {
  week: number;
  size?: number;
}

const BabySizeIllustration = ({ week, size = 80 }: Props) => {
  const s = "#D4906A";
  const f1 = "#FFF0E8";
  const f2 = "#FFCDB4";
  const sw = 1.5;

  const illustrations: Record<number, JSX.Element> = {
    4: ( // Poppy seed
      <g><circle cx="40" cy="40" r="3" fill={s} /></g>
    ),
    5: ( // Sesame seed
      <g><ellipse cx="40" cy="40" rx="5" ry="3" fill={s} transform="rotate(-20 40 40)" /></g>
    ),
    6: ( // Lentil
      <g><ellipse cx="40" cy="40" rx="8" ry="6" fill={f2} stroke={s} strokeWidth={sw} /></g>
    ),
    7: ( // Blueberry
      <g><circle cx="40" cy="42" r="10" fill={f2} stroke={s} strokeWidth={sw} /><path d="M35 35 Q40 30 45 35" stroke={s} strokeWidth={1} fill="none" /></g>
    ),
    8: ( // Raspberry
      <g><circle cx="40" cy="42" r="12" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="35" cy="38" r="3" fill={f2} stroke={s} strokeWidth={0.8} /><circle cx="43" cy="37" r="3" fill={f2} stroke={s} strokeWidth={0.8} /><circle cx="38" cy="45" r="3" fill={f2} stroke={s} strokeWidth={0.8} /><circle cx="45" cy="44" r="3" fill={f2} stroke={s} strokeWidth={0.8} /><line x1="40" y1="30" x2="40" y2="24" stroke={s} strokeWidth={1.2} /></g>
    ),
    9: ( // Cherry
      <g><circle cx="40" cy="44" r="13" fill={f2} stroke={s} strokeWidth={sw} /><path d="M40 31 Q42 20 48 16" stroke={s} strokeWidth={1.2} fill="none" /><ellipse cx="50" cy="16" rx="4" ry="2" fill={f1} stroke={s} strokeWidth={0.8} transform="rotate(-30 50 16)" /></g>
    ),
    10: ( // Kumquat
      <g><ellipse cx="40" cy="40" rx="10" ry="14" fill={f2} stroke={s} strokeWidth={sw} /></g>
    ),
    11: ( // Lime
      <g><circle cx="40" cy="40" r="16" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="40" cy="40" r="8" fill="none" stroke={s} strokeWidth={0.5} strokeDasharray="2 3" /></g>
    ),
    12: ( // Plum
      <g><circle cx="40" cy="40" r="17" fill={f2} stroke={s} strokeWidth={sw} /><line x1="40" y1="23" x2="40" y2="57" stroke={s} strokeWidth={0.8} /><path d="M40 23 Q43 18 46 20" stroke={s} strokeWidth={1} fill="none" /></g>
    ),
    13: ( // Peach
      <g><circle cx="40" cy="42" r="18" fill={f2} stroke={s} strokeWidth={sw} /><path d="M32 25 Q40 20 48 25" stroke={s} strokeWidth={1} fill="none" /><ellipse cx="46" cy="22" rx="5" ry="3" fill={f1} stroke={s} strokeWidth={0.8} transform="rotate(20 46 22)" /></g>
    ),
    14: ( // Lemon
      <g><ellipse cx="40" cy="40" rx="12" ry="18" fill={f1} stroke={s} strokeWidth={sw} /><ellipse cx="40" cy="24" rx="3" ry="2" fill={f2} stroke={s} strokeWidth={0.8} /><ellipse cx="40" cy="56" rx="3" ry="2" fill={f2} stroke={s} strokeWidth={0.8} /></g>
    ),
    15: ( // Apple
      <g><circle cx="40" cy="44" r="18" fill={f2} stroke={s} strokeWidth={sw} /><path d="M40 26 L40 20" stroke={s} strokeWidth={1.5} /><ellipse cx="45" cy="20" rx="5" ry="3" fill={f1} stroke={s} strokeWidth={0.8} transform="rotate(15 45 20)" /></g>
    ),
    16: ( // Avocado
      <g><ellipse cx="40" cy="38" rx="16" ry="22" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="40" cy="44" r="10" fill={f2} stroke={s} strokeWidth={0.8} /></g>
    ),
    17: ( // Pear
      <g><ellipse cx="40" cy="48" rx="17" ry="16" fill={f2} stroke={s} strokeWidth={sw} /><ellipse cx="40" cy="30" rx="10" ry="12" fill={f2} stroke={s} strokeWidth={sw} /><line x1="40" y1="18" x2="40" y2="12" stroke={s} strokeWidth={1.2} /></g>
    ),
    18: ( // Bell pepper
      <g><path d="M28 30 Q24 50 30 58 Q36 64 40 64 Q44 64 50 58 Q56 50 52 30 Q48 24 40 24 Q32 24 28 30Z" fill={f2} stroke={s} strokeWidth={sw} /><line x1="40" y1="24" x2="40" y2="16" stroke={s} strokeWidth={1.2} /></g>
    ),
    19: ( // Mango
      <g><ellipse cx="40" cy="40" rx="18" ry="20" fill={f2} stroke={s} strokeWidth={sw} transform="rotate(-10 40 40)" /></g>
    ),
    20: ( // Banana
      <g><path d="M25 55 Q20 40 30 25 Q40 15 50 20 Q45 22 38 30 Q30 42 30 55Z" fill={f1} stroke={s} strokeWidth={sw} /></g>
    ),
    21: ( // Carrot
      <g><path d="M40 16 L30 62 L50 62 Z" fill={f2} stroke={s} strokeWidth={sw} /><path d="M36 16 Q40 8 44 16" stroke={s} strokeWidth={1} fill={f1} /><path d="M38 14 Q40 6 42 14" stroke={s} strokeWidth={0.8} fill={f1} /></g>
    ),
    22: ( // Coconut
      <g><circle cx="40" cy="40" r="20" fill={f2} stroke={s} strokeWidth={sw} /><path d="M25 35 Q40 30 55 35" stroke={s} strokeWidth={0.8} fill="none" /></g>
    ),
    23: ( // Eggplant
      <g><ellipse cx="40" cy="46" rx="14" ry="20" fill={f2} stroke={s} strokeWidth={sw} /><path d="M32 28 Q40 20 48 28" stroke={s} strokeWidth={1.2} fill={f1} /></g>
    ),
    24: ( // Corn
      <g><ellipse cx="40" cy="40" rx="12" ry="24" fill={f1} stroke={s} strokeWidth={sw} /><line x1="34" y1="28" x2="46" y2="28" stroke={s} strokeWidth={0.6} /><line x1="34" y1="34" x2="46" y2="34" stroke={s} strokeWidth={0.6} /><line x1="34" y1="40" x2="46" y2="40" stroke={s} strokeWidth={0.6} /><line x1="34" y1="46" x2="46" y2="46" stroke={s} strokeWidth={0.6} /><path d="M28 20 Q32 14 40 16" stroke={s} strokeWidth={1} fill="none" /><path d="M52 20 Q48 14 40 16" stroke={s} strokeWidth={1} fill="none" /></g>
    ),
    25: ( // Cauliflower
      <g><circle cx="34" cy="44" r="10" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="46" cy="44" r="10" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="40" cy="36" r="10" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="32" cy="36" r="6" fill={f1} stroke={s} strokeWidth={0.8} /><circle cx="48" cy="36" r="6" fill={f1} stroke={s} strokeWidth={0.8} /></g>
    ),
    26: ( // Zucchini
      <g><rect x="32" y="16" width="16" height="48" rx="8" fill={f1} stroke={s} strokeWidth={sw} /><line x1="40" y1="16" x2="40" y2="12" stroke={s} strokeWidth={1} /></g>
    ),
    27: ( // Cauliflower head (larger)
      <g><circle cx="33" cy="44" r="11" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="47" cy="44" r="11" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="40" cy="34" r="11" fill={f1} stroke={s} strokeWidth={sw} /><circle cx="30" cy="34" r="7" fill={f1} stroke={s} strokeWidth={0.8} /><circle cx="50" cy="34" r="7" fill={f1} stroke={s} strokeWidth={0.8} /></g>
    ),
    28: ( // Eggplant large
      <g><ellipse cx="40" cy="46" rx="16" ry="22" fill={f2} stroke={s} strokeWidth={sw} /><path d="M30 26 Q40 16 50 26" stroke={s} strokeWidth={1.5} fill={f1} /></g>
    ),
    29: ( // Butternut squash
      <g><ellipse cx="40" cy="50" rx="16" ry="14" fill={f2} stroke={s} strokeWidth={sw} /><ellipse cx="40" cy="28" rx="8" ry="12" fill={f2} stroke={s} strokeWidth={sw} /><line x1="40" y1="16" x2="40" y2="12" stroke={s} strokeWidth={1.2} /></g>
    ),
    30: ( // Cabbage
      <g><circle cx="40" cy="40" r="22" fill={f1} stroke={s} strokeWidth={sw} /><path d="M28 40 Q40 32 52 40" stroke={s} strokeWidth={0.8} fill="none" /><path d="M30 46 Q40 38 50 46" stroke={s} strokeWidth={0.6} fill="none" /></g>
    ),
    31: ( // Pineapple
      <g><ellipse cx="40" cy="44" rx="16" ry="20" fill={f2} stroke={s} strokeWidth={sw} /><path d="M34 24 L32 14" stroke={s} strokeWidth={1} /><path d="M40 24 L40 12" stroke={s} strokeWidth={1} /><path d="M46 24 L48 14" stroke={s} strokeWidth={1} /><line x1="30" y1="36" x2="50" y2="36" stroke={s} strokeWidth={0.5} /><line x1="30" y1="44" x2="50" y2="44" stroke={s} strokeWidth={0.5} /><line x1="30" y1="52" x2="50" y2="52" stroke={s} strokeWidth={0.5} /></g>
    ),
    32: ( // Squash
      <g><ellipse cx="40" cy="42" rx="20" ry="18" fill={f2} stroke={s} strokeWidth={sw} /><path d="M30 42 Q40 34 50 42" stroke={s} strokeWidth={0.8} fill="none" /><line x1="40" y1="24" x2="40" y2="18" stroke={s} strokeWidth={1.2} /></g>
    ),
    33: ( // Pineapple large
      <g><ellipse cx="40" cy="46" rx="18" ry="22" fill={f2} stroke={s} strokeWidth={sw} /><path d="M32 24 L28 12" stroke={s} strokeWidth={1.2} /><path d="M40" y1="24" x2="40" y2="10" stroke={s} strokeWidth={1.2} /><path d="M48 24 L52 12" stroke={s} strokeWidth={1.2} /><line x1="28" y1="38" x2="52" y2="38" stroke={s} strokeWidth={0.5} /><line x1="28" y1="46" x2="52" y2="46" stroke={s} strokeWidth={0.5} /><line x1="28" y1="54" x2="52" y2="54" stroke={s} strokeWidth={0.5} /></g>
    ),
    34: ( // Cantaloupe
      <g><ellipse cx="40" cy="40" rx="22" ry="20" fill={f1} stroke={s} strokeWidth={sw} /><path d="M20 40 Q40 30 60 40" stroke={s} strokeWidth={0.6} fill="none" /><path d="M40 20 Q45 40 40 60" stroke={s} strokeWidth={0.6} fill="none" /></g>
    ),
    35: ( // Honeydew melon
      <g><ellipse cx="40" cy="40" rx="24" ry="22" fill={f1} stroke={s} strokeWidth={sw} /></g>
    ),
    36: ( // Romaine lettuce
      <g><ellipse cx="40" cy="40" rx="14" ry="26" fill={f1} stroke={s} strokeWidth={sw} /><path d="M34 20 Q40 30 46 20" stroke={s} strokeWidth={0.6} fill="none" /><path d="M32 28 Q40 38 48 28" stroke={s} strokeWidth={0.6} fill="none" /></g>
    ),
    37: ( // Winter melon
      <g><ellipse cx="40" cy="40" rx="24" ry="24" fill={f1} stroke={s} strokeWidth={sw} /><path d="M18 36 Q40 28 62 36" stroke={s} strokeWidth={0.5} fill="none" /></g>
    ),
    38: ( // Leek
      <g><rect x="36" y="14" width="8" height="52" rx="4" fill={f1} stroke={s} strokeWidth={sw} /><path d="M32 20 Q36 14 40 10 Q44 14 48 20" stroke={s} strokeWidth={0.8} fill={f1} /></g>
    ),
    39: ( // Watermelon
      <g><ellipse cx="40" cy="40" rx="26" ry="22" fill={f1} stroke={s} strokeWidth={sw} /><path d="M16 38 Q28 34 40 38 Q52 34 64 38" stroke={s} strokeWidth={0.8} fill="none" /></g>
    ),
    40: ( // Pumpkin
      <g><circle cx="40" cy="42" r="24" fill={f2} stroke={s} strokeWidth={sw} /><path d="M22 42 Q30 34 40 42 Q50 34 58 42" stroke={s} strokeWidth={0.8} fill="none" /><line x1="40" y1="18" x2="40" y2="12" stroke={s} strokeWidth={1.5} /><ellipse cx="40" cy="12" rx="3" ry="2" fill={f1} stroke={s} strokeWidth={0.8} /></g>
    ),
  };

  // Interpolate: use closest known week
  const knownWeeks = Object.keys(illustrations).map(Number).sort((a, b) => a - b);
  let closest = knownWeeks[0];
  for (const k of knownWeeks) {
    if (k <= week) closest = k;
    else break;
  }

  // For weeks 1-3, show a tiny dot
  const content = week < 4 ? <circle cx="40" cy="40" r="2" fill={s} /> : illustrations[closest] || illustrations[40];

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {content}
    </svg>
  );
};

export default BabySizeIllustration;
