import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { SceneBackground, GlassCard } from "@/components/golden";
import type { Scene } from "@/components/golden";
import termsMd from "../../Belly-Terms-of-Service.md?raw";
import privacyMd from "../../Belly-Privacy-Policy.md?raw";
import disclaimerMd from "../../Belly-Medical-Wellness-Disclaimer.md?raw";
import autoRenewalMd from "../../Belly-Auto-Renewal-Terms.md?raw";

const LEGAL_CSS = `
  .gh-legal h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: 19px;
    line-height: 1.3;
    color: var(--cream);
    margin: 26px 0 10px;
  }
  .gh-legal h1:first-child {
    font-size: 26px;
    margin-top: 0;
  }
  .gh-legal h2 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--cream);
    margin: 20px 0 8px;
  }
  .gh-legal p {
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(251,238,224,0.85);
    margin: 0 0 12px;
  }
  .gh-legal ul {
    list-style: disc;
    padding-left: 20px;
    margin: 0 0 12px;
  }
  .gh-legal li {
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    line-height: 1.65;
    color: rgba(251,238,224,0.85);
    margin-bottom: 4px;
  }
  .gh-legal strong { color: var(--cream); font-weight: 700; }
  .gh-legal em { font-style: italic; }
  .gh-legal a { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; }
  .gh-legal hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.12);
    margin: 22px 0;
  }
`;

function LegalPage({ scene, label, markdown }: { scene: Scene; label: string; markdown: string }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <SceneBackground scene={scene}>
      <style>{LEGAL_CSS}</style>
      <div style={{ minHeight: "100dvh", maxWidth: 430, margin: "0 auto", padding: "20px 18px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button
            onClick={goBack}
            aria-label="Go back"
            className="belly-btn-press"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <ArrowLeft size={17} color="var(--cream)" strokeWidth={1.8} />
          </button>
          <span className="gh-brand-tag" style={{ marginTop: 0 }}>{label}</span>
        </div>

        <GlassCard style={{ padding: "24px 20px 26px", marginBottom: 0 }}>
          <div className="gh-legal">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </GlassCard>
      </div>
    </SceneBackground>
  );
}

export const Terms = () => <LegalPage scene="today" label="terms of service" markdown={termsMd} />;
export const Privacy = () => <LegalPage scene="ask" label="privacy policy" markdown={privacyMd} />;
export const AutoRenewal = () => <LegalPage scene="today" label="automatic renewal terms" markdown={autoRenewalMd} />;
export const Disclaimer = () => <LegalPage scene="baby" label="medical & wellness disclaimer" markdown={disclaimerMd} />;
