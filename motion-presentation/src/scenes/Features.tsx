import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, BrowserFrame, Eyebrow, Words } from "../components";
import { C, EASE, sans, serif } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Débuts calés sur « exercices » (9.92s), « sujets d'examen » (10.74s), « corrections » (11.89s)
const ITEMS = [
  { t: 18, n: "01", title: "Exercices", sub: "Par matière, niveau et difficulté", shot: "shots/exercices.png" },
  { t: 43, n: "02", title: "Sujets d'examen", sub: "Les annales officielles BAC & BEPC", shot: "shots/sujets.png" },
  { t: 77, n: "03", title: "Corrigés détaillés", sub: "Étape par étape, pour tout comprendre", shot: "shots/exercice-detail.png" },
];

// 9.22s — « Accède à des exercices, des sujets d'examen et des corrections détaillées
//           pour mieux comprendre chaque matière. »
export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = ITEMS.reduce((acc, it, i) => (frame >= it.t - 3 ? i : acc), 0);

  return (
    <AbsoluteFill name="Features">
      <Backdrop glow={[85, 50]} />

      {/* Colonne gauche */}
      <div style={{ position: "absolute", left: 120, top: 150, width: 640 }}>
        <Eyebrow delay={0}>Tout-en-un</Eyebrow>
        <div style={{ height: 26 }} />
        <Words text="Tout pour réviser." size={96} align="left" delay={2} stagger={4} accentWords={["réviser"]} />
        <div style={{ height: 60 }} />
        {ITEMS.map((it, i) => {
          const p = interpolate(frame, [it.t - 6, it.t + 10], [0, 1], { ...clamp, easing: EASE });
          const active = i === activeIndex;
          return (
            <div
              key={it.n}
              style={{
                display: "flex",
                gap: 28,
                alignItems: "flex-start",
                padding: "24px 0",
                borderTop: `1px solid ${C.line}`,
                opacity: p * (active ? 1 : 0.38),
                translate: `${(1 - p) * -30}px 0px`,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 600,
                  marginTop: 14,
                  color: active ? C.orange : C.muted,
                }}
              >
                {it.n}
              </div>
              <div>
                <div style={{ fontFamily: serif, fontSize: 54, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>
                  {it.title}
                </div>
                <div style={{ fontFamily: sans, fontSize: 28, color: C.muted, marginTop: 6 }}>{it.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fin de phrase : « …pour mieux comprendre chaque matière » */}
      <div style={{ position: "absolute", left: 840, top: 892, width: 980, display: "flex", justifyContent: "center" }}>
        <Words
          text="Pour mieux comprendre chaque matière."
          size={38}
          font={sans}
          weight={500}
          color={C.muted}
          align="center"
          delay={110}
          stagger={3}
          letterSpacing="-0.005em"
        />
      </div>

      {/* Pile de captures à droite */}
      {ITEMS.map((it, i) => {
        const inP = interpolate(frame, [it.t - 6, it.t + 14], [0, 1], { ...clamp, easing: EASE });
        const nextT = ITEMS[i + 1]?.t;
        const outP = nextT ? interpolate(frame, [nextT - 6, nextT + 14], [0, 1], { ...clamp, easing: EASE }) : 0;
        const isLast = i === ITEMS.length - 1;
        return (
          <div
            key={it.shot}
            style={{
              position: "absolute",
              left: 840,
              top: 200,
              opacity: i === 0 ? 1 - outP * 0.0 : inP,
              translate: `${(1 - inP) * 80}px ${-outP * 40}px`,
              scale: String(1 - outP * 0.06),
              filter: `blur(${outP * 3}px) brightness(${1 - outP * 0.08})`,
              zIndex: i,
            }}
          >
            <BrowserFrame
              src={it.shot}
              width={980}
              focus={
                isLast
                  ? { from: 100, to: 164, scale: [1, 1.55], origin: "74% 42%" }
                  : { from: it.t, to: it.t + 60, scale: [1, 1.08], origin: "50% 30%" }
              }
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
