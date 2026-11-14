import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Logo, Words } from "../components";
import { C, EASE, EASE_IN_OUT, sans } from "../theme";
import { SITE_URL } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 22.98s — « Rendez-vous dès maintenant sur … »
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = Math.round(interpolate(frame, [48, 92], [0, SITE_URL.length], clamp));
  const caretOn = Math.floor(frame / 8) % 2 === 0 || frame < 92;
  const pill = interpolate(frame, [36, 52], [0, 1], { ...clamp, easing: EASE });
  // Curseur qui vient cliquer sur le bouton
  const cx = interpolate(frame, [96, 116], [420, 0], { ...clamp, easing: EASE_IN_OUT });
  const cy = interpolate(frame, [96, 116], [260, 0], { ...clamp, easing: EASE_IN_OUT });
  const press = interpolate(frame, [118, 122, 128], [1, 0.92, 1], clamp);
  const ring = interpolate(frame, [120, 145], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill name="CTA">
      <Backdrop glow={[50, 40]} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 56 }}>
        <div style={{ opacity: interpolate(frame, [0, 14], [0, 1], clamp) }}>
          <Logo size={72} />
        </div>
        <Words text="Rendez-vous dès maintenant" size={110} delay={2} stagger={5} accentWords={["maintenant"]} />

        {/* Barre d'URL + bouton */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: 14,
            paddingLeft: 40,
            borderRadius: 99,
            background: C.paper,
            boxShadow: "0 30px 70px -25px rgba(120,53,15,0.35), 0 0 0 1px rgba(17,17,20,0.06)",
            opacity: pill,
            translate: `0px ${(1 - pill) * 30}px`,
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
          </svg>
          <div style={{ fontFamily: sans, fontSize: 46, fontWeight: 600, color: C.ink, minWidth: 620, letterSpacing: "-0.01em" }}>
            {SITE_URL.slice(0, typed)}
            <span style={{ opacity: caretOn ? 1 : 0, color: C.orange, fontWeight: 400 }}>|</span>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 99,
                boxShadow: `0 0 0 ${ring * 26}px rgba(245,158,11,${0.35 * (1 - ring)})`,
              }}
            />
            <div
              style={{
                padding: "26px 44px",
                borderRadius: 99,
                fontFamily: sans,
                fontSize: 34,
                fontWeight: 600,
                color: "#fff",
                background: `linear-gradient(100deg, ${C.amber}, ${C.orange})`,
                boxShadow: "0 14px 30px -10px rgba(234,88,12,0.6)",
                scale: String(press),
              }}
            >
              Commencer →
            </div>
            {/* Curseur */}
            <svg
              width="46"
              height="46"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: "55%",
                top: "55%",
                translate: `${cx}px ${cy}px`,
                opacity: interpolate(frame, [94, 100], [0, 1], clamp),
                scale: String(press),
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
              }}
            >
              <path d="M4 2l16 9-7 2-3 7z" fill={C.ink} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            color: C.muted,
            letterSpacing: "0.02em",
            opacity: interpolate(frame, [104, 120], [0, 1], clamp),
          }}
        >
          Exercices · Sujets d'examen · Corrigés détaillés
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
