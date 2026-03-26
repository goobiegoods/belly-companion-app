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
    : "linear-gradient(135deg, #FF7E48, #FFA070)";

  const cardBg = darkTheme
    ? "rgba(255,255,255,0.08)"
    : "rgba(255,255,255,0.68)";

  const cardBorder = darkTheme
    ? "0.5px solid rgba(255,180,255,0.15)"
    : "0.5px solid rgba(255,170,130,0.22)";

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", background: cardBg, border: cardBorder, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: darkTheme ? "none" : "0 2px 14px rgba(255,140,90,0.07)" }}>
      {/* Header */}
      <div style={{ background: headerBg, padding: "14px 16px" }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Quick check ✓</span>
          {progressDots && (
            <div className="flex gap-1">
              {Array.from({ length: progressDots.total }, (_, i) => (
                <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i <= progressDots.current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: darkTheme ? "#FFF0FF" : "#FFF9F6", lineHeight: 1.4 }}>{question}</p>
      </div>

      {/* Options 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, padding: "12px 13px" }}>
        {options.map((opt, i) => {
          const isThis = selected === i;
          const isCorrectOpt = i === correctIdx;
          let bg = darkTheme ? "rgba(255,242,255,0.08)" : "rgba(255,242,234,0.8)";
          let border = darkTheme ? "0.5px solid rgba(255,180,255,0.15)" : "0.5px solid rgba(255,170,130,0.25)";
          let textColor = darkTheme ? "#E0C0E0" : "#C4784A";

          if (answered && isThis && opt.correct) {
            bg = "rgba(200,240,210,0.85)";
            border = "0.5px solid rgba(100,200,130,0.5)";
            textColor = "#40A060";
          } else if (answered && isThis && !opt.correct) {
            bg = "rgba(255,220,220,0.8)";
            border = "0.5px solid rgba(255,140,140,0.4)";
            textColor = "#D04040";
          } else if (answered && isCorrectOpt) {
            bg = "rgba(200,240,210,0.85)";
            border = "0.5px solid rgba(100,200,130,0.5)";
            textColor = "#40A060";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className="belly-card-interactive"
              style={{
                borderRadius: 13, padding: "10px 8px", textAlign: "center", background: bg, border,
                cursor: answered ? "default" : "pointer",
                transition: "transform 140ms, background 180ms",
                animation: answered && isThis && !opt.correct && shaking ? "shake 200ms ease" : undefined,
                transform: answered && isThis && opt.correct ? "scale(1)" : undefined,
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.emoji}</div>
              <div style={{ fontSize: 7.5, fontWeight: 500, color: textColor, lineHeight: 1.3 }}>
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
            background: isCorrect ? "rgba(200,240,210,0.5)" : "rgba(255,230,220,0.5)",
            border: isCorrect ? "0.5px solid rgba(100,200,130,0.3)" : "0.5px solid rgba(255,170,130,0.3)",
            borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            animation: "pageEnter 260ms ease forwards",
          }}>
            <p style={{ fontSize: 8, fontWeight: 600, color: isCorrect ? "#40A060" : "#E07040", marginBottom: 4 }}>
              {isCorrect ? "✓ Correct! 🌸" : "Almost! Here's why 💡"}
            </p>
            <p style={{ fontSize: 7.5, color: isCorrect ? "#60B080" : "#C4784A", lineHeight: 1.5 }}>
              {options[selected].funFact}
            </p>
          </div>

          {onContinue && (
            <button onClick={onContinue}
              className="belly-btn-primary"
              style={{
                width: "100%", borderRadius: 12, padding: 9,
                background: darkTheme ? "linear-gradient(145deg, #FF7840, #FFAB80)" : "linear-gradient(145deg, #FF7840, #FFAB80)",
                color: "white", fontSize: 8.5, fontWeight: 600, border: "none",
                boxShadow: "0 3px 10px rgba(255,120,64,0.28)",
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
