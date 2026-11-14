import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Eyebrow, Phone, Words } from "../components";
import { C, EASE, sans, serif } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// « 7e » (15.53s), « BEPC » (16.10s), « bac » (17.14s)
const STEPS = [
  { t: 22, label: "7e", sub: "Fin du primaire" },
  { t: 40, label: "BEPC", sub: "Fin du collège" },
  { t: 70, label: "BAC", sub: "Fin du lycée" },
];

// 14.68s — « De l'entrée en 7e au BEPC, jusqu'au bac, prépare-toi efficacement et avance à ton rythme. »
export const Levels: React.FC = () => {
  const frame = useCurrentFrame();
  const lineW = 820;
  const fill = interpolate(frame, [STEPS[0].t, STEPS[2].t], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill name="Levels">
      <Backdrop glow={[20, 70]} />

      <div style={{ position: "absolute", left: 140, top: 180 }}>
        <Eyebrow delay={0}>Du primaire au bac</Eyebrow>

        {/* Frise de progression */}
        <div style={{ position: "relative", width: lineW + 120, height: 260, marginTop: 70 }}>
          <div style={{ position: "absolute", top: 34, left: 18, width: lineW, height: 4, borderRadius: 4, background: C.line }} />
          <div
            style={{
              position: "absolute",
              top: 34,
              left: 18,
              width: lineW * fill,
              height: 4,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${C.amber}, ${C.orange})`,
            }}
          />
          {STEPS.map((s, i) => {
            const p = interpolate(frame, [s.t - 4, s.t + 12], [0, 1], { ...clamp, easing: EASE });
            const x = (lineW / (STEPS.length - 1)) * i;
            return (
              <div key={s.label} style={{ position: "absolute", left: x, top: 0, opacity: p, translate: `0px ${(1 - p) * 24}px` }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 99,
                    marginTop: 16,
                    background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                    boxShadow: "0 0 0 8px rgba(245,158,11,0.18)",
                    scale: String(p),
                  }}
                />
                <div
                  style={{
                    fontFamily: serif,
                    fontWeight: 800,
                    fontSize: 110,
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "lining-nums",
                    color: C.ink,
                    marginTop: 26,
                    marginLeft: -6,
                    lineHeight: 1,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontFamily: sans, fontSize: 26, color: C.muted, marginTop: 10 }}>{s.sub}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 140, display: "flex", flexDirection: "column", gap: 8 }}>
          <Words text="Prépare-toi efficacement," size={76} align="left" delay={84} stagger={4} />
          <Words text="à ton rythme." size={76} align="left" delay={136} stagger={4} accentWords={["rythme"]} />
        </div>
      </div>

      {/* Mobile : partout, tout le temps */}
      <div
        style={{
          position: "absolute",
          right: 170,
          top: 110,
          opacity: interpolate(frame, [4, 24], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [4, 40], [140, 0], { ...clamp, easing: EASE })}px`,
          rotate: `${interpolate(frame, [4, 160], [4, -2])}deg`,
        }}
      >
        <Phone src="shots/mobile-landing-full.png" height={830} scrollFrom={60} scrollDur={90} scrollTo={1000} />
      </div>
    </AbsoluteFill>
  );
};
