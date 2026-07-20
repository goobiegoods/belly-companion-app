import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon } from "lucide-react";

const THUMB = 46;
const PAD = 5;
const THRESHOLD = 0.8;

/**
 * Slide-to-unlock strip at the bottom of Today. Dragging the moon thumb past
 * the threshold opens the Can't Sleep night-mode screen; a partial drag
 * springs back. The thumb uses `touch-action: pan-y` so vertical page
 * scrolling over the strip keeps working.
 */
export function SlideToNight() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const startX = useRef(0);

  const maxX = () => {
    const track = trackRef.current;
    return track ? track.clientWidth - THUMB - PAD * 2 : 0;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (unlocked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX - x;
    setDragging(true);
    setTouched(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || unlocked) return;
    setX(Math.max(0, Math.min(maxX(), e.clientX - startX.current)));
  };

  const onPointerUp = () => {
    if (!dragging || unlocked) return;
    setDragging(false);
    if (maxX() > 0 && x >= maxX() * THRESHOLD) {
      setUnlocked(true);
      setX(maxX());
      setTimeout(() => navigate("/cant-sleep"), 220);
    } else {
      setX(0);
    }
  };

  const progress = maxX() > 0 ? x / maxX() : 0;

  return (
    <div className="gh-slide-track" ref={trackRef} aria-label="Slide to enter night mode">
      <div className="gh-slide-fill" style={{ opacity: progress * 0.9, transition: dragging ? "none" : "opacity 300ms ease" }} />
      <div className="gh-slide-label" style={{ opacity: Math.max(0, 1 - progress * 1.6) }}>
        slide to enter night mode
      </div>
      <div
        className={`gh-slide-thumb${touched ? "" : " gh-slide-hint"}`}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? "none" : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: unlocked
            ? "0 0 26px rgba(242,182,71,0.85)"
            : "0 4px 16px -4px rgba(242,182,71,0.6)",
        }}
      >
        <Moon size={19} strokeWidth={1.8} style={{ color: "var(--night)" }} />
      </div>
    </div>
  );
}
