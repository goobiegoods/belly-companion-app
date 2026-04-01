import { useState } from "react";

export interface QuizOption {
  text: string;
  emoji: string;
  correct: boolean;
  funFact: string;
}

interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  onAnswer?: (correct: boolean) => void;
  onContinue?: () => void;
  darkTheme?: boolean;
  progressDots?: { total: number; current: number };
  continueLabel?: string;
}

const QuizBlock = ({ question, options, onAnswer, onContinue, darkTheme, progressDots, continueLabel = "Continue lesson →" }: QuizBlockProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);

  const answered = selected !== null;
  const isCorrect = answered && options[selected].correct;
  const correctIdx = options.findIndex(o => o.correct);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    if (!options[idx].correct) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
    onAnswer?.(options[idx].correct);
  };

  const headerBg = darkTheme
    ? "linear-gradient(135deg, #2A1A40, #4A2060)"
    : "linear-gradient(135deg, rgba(255,100,30,0.60), rgba(255,140,60,0.40))";

  const cardBg = darkTheme
    ? "rgba(255,255,255,0.08)"
    : "rgba(255,255,255,0.20)";

  const cardBorder = darkTheme
    ? "0.5px solid rgba(255,180,255,0.15)"
    : "1.5px solid rgba(255,255,255,0.32)";

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: cardBg, border: cardBorder, backdropFilter: darkTheme ? "blur(16px)" : undefined, WebkitBackdropFilter: darkTheme ? "blur(16px)" : undefined }}>
      {/* Header */}
      <div style={{ background: headerBg, padding: "14px 16px", borderBottom: darkTheme ? undefined : "1px solid rgba(255,255,255,0.20)" }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: darkTheme ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.65)", fontWeight: 600 }}>Quick check ✓</span>
          {progressDots && (
            <div className="flex gap-1">
              {Array.from({ length: progressDots.total }, (_, i) => (
                <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i <= progressDots.current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
          )}
        </div>
        <p style={{ fontSize: 15, fontFamily: darkTheme ? undefined : "'Fraunces', serif", fontWeight: 700, color: darkTheme ? "#FFF0FF" : "white", lineHeight: 1.4 }}>{question}</p>
      </div>

      {/* Options 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, padding: "12px 13px" }}>
        {options.map((opt, i) => {
          const isThis = selected === i;
          const isCorrectOpt = i === correctIdx;
          let bg = darkTheme ? "rgba(255,242,255,0.08)" : "rgba(255,255,255,0.18)";
          let border = darkTheme ? "0.5px solid rgba(255,180,255,0.15)" : "1px solid rgba(255,255,255,0.26)";
          let textColor = darkTheme ? "#E0C0E0" : "white";

          if (answered && isThis && opt.correct) {
            bg = darkTheme ? "rgba(200,240,210,0.85)" : "rgba(100,220,130,0.25)";
            border = darkTheme ? "0.5px solid rgba(100,200,130,0.5)" : "1px solid rgba(100,220,130,0.45)";
            textColor = darkTheme ? "#40A060" : "rgba(200,255,220,0.95)";
          } else if (answered && isThis && !opt.correct) {
            bg = darkTheme ? "rgba(255,220,220,0.8)" : "rgba(255,100,100,0.20)";
            border = darkTheme ? "0.5px solid rgba(255,140,140,0.4)" : "1px solid rgba(255,130,130,0.35)";
            textColor = darkTheme ? "#D04040" : "rgba(255,200,200,0.95)";
          } else if (answered && isCorrectOpt) {
            bg = darkTheme ? "rgba(200,240,210,0.85)" : "rgba(100,220,130,0.25)";
            border = darkTheme ? "0.5px solid rgba(100,200,130,0.5)" : "1px solid rgba(100,220,130,0.45)";
            textColor = darkTheme ? "#40A060" : "rgba(200,255,220,0.95)";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              style={{
                borderRadius: 14, padding: "10px 8px", textAlign: "center", background: bg, border,
                cursor: answered ? "default" : "pointer",
                transition: "transform 140ms, background 180ms",
                animation: answered && isThis && !opt.correct && shaking ? "shake 200ms ease" : undefined,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.emoji}</div>
              <div style={{ fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: textColor, lineHeight: 1.3 }}>
                {opt.text}{answered && isCorrectOpt && " ✓"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result */}
      {answered && (
        <div style={{ padding: "0 13px 12px" }}>
          <div style={{
            background: darkTheme
              ? (isCorrect ? "rgba(200,240,210,0.5)" : "rgba(255,230,220,0.5)")
              : "rgba(255,255,255,0.15)",
            border: darkTheme
              ? (isCorrect ? "0.5px solid rgba(100,200,130,0.3)" : "0.5px solid rgba(255,170,130,0.3)")
              : "1px solid rgba(255,255,255,0.25)",
            borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            animation: "pageEnter 260ms ease forwards",
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: darkTheme ? (isCorrect ? "#40A060" : "#E07040") : (isCorrect ? "rgba(200,255,220,0.95)" : "rgba(255,200,200,0.95)"), marginBottom: 4 }}>
              {isCorrect ? "✓ Correct! 🌸" : "Almost! Here's why 💡"}
            </p>
            <p style={{ fontSize: 11, fontFamily: "'Outfit', sans-serif", color: darkTheme ? (isCorrect ? "#60B080" : "#C4784A") : "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>
              {options[selected].funFact}
            </p>
          </div>

          {onContinue && (
            <button onClick={onContinue}
              style={{
                width: "100%", borderRadius: 14, padding: 9,
                background: darkTheme ? "linear-gradient(145deg, #FF7840, #FFAB80)" : "white",
                color: darkTheme ? "white" : "#FF6520",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13, fontWeight: 700, border: "none",
              }}>
              {continueLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizBlock;
