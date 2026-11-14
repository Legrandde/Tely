import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, BrowserFrame, Eyebrow, Logo } from "../components";
import { C, EASE, EASE_IN_OUT, sans } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const VERBS = [
  { t: 74, w: "Apprendre" },
  { t: 97, w: "S'entraîner" },
  { t: 122, w: "Progresser" },
];

// 4.43s — « Découvre Tely-Learning, ta plateforme pour apprendre, t'entraîner et progresser. »
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Reveal">
      <Backdrop glow={[50, 15]} />

      {/* Logo : apparaît au centre puis remonte */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 0,
          justifyContent: "center",
          translate: `0px ${interpolate(frame, [36, 60], [0, -425], { ...clamp, easing: EASE_IN_OUT })}px`,
          scale: String(interpolate(frame, [36, 60], [1, 0.62], { ...clamp, easing: EASE_IN_OUT })),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <div style={{ opacity: interpolate(frame, [36, 46], [1, 0], clamp) }}>
            <Eyebrow delay={0}>Découvre</Eyebrow>
          </div>
          <div
            style={{
              opacity: interpolate(frame, [12, 26], [0, 1], { ...clamp, easing: EASE }),
              scale: String(interpolate(frame, [12, 34], [0.86, 1], { ...clamp, easing: EASE })),
              filter: `blur(${interpolate(frame, [12, 26], [14, 0], clamp)}px)`,
            }}
          >
            <Logo size={190} />
          </div>
        </div>
      </AbsoluteFill>

      {/* Les trois verbes, synchronisés avec la voix */}
      <div
        style={{
          position: "absolute",
          top: 250,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {VERBS.map((v, i) => {
          const p = interpolate(frame, [v.t - 4, v.t + 10], [0, 1], { ...clamp, easing: EASE });
          const next = VERBS[i + 1]?.t ?? 999;
          const active = frame >= v.t - 4 && frame < next - 4;
          return (
            <div
              key={v.w}
              style={{
                opacity: p,
                translate: `0px ${(1 - p) * 20}px`,
                padding: "16px 34px",
                borderRadius: 99,
                fontFamily: sans,
                fontSize: 36,
                fontWeight: 600,
                color: active ? "#fff" : C.ink,
                background: active ? `linear-gradient(100deg, ${C.amber}, ${C.orange})` : C.paper,
                boxShadow: active
                  ? "0 14px 30px -10px rgba(234,88,12,0.55)"
                  : "0 0 0 1px rgba(17,17,20,0.08)",
              }}
            >
              {v.w}
            </div>
          );
        })}
      </div>

      {/* Capture de la landing qui monte en perspective */}
      <AbsoluteFill style={{ alignItems: "center", perspective: 2200 }}>
        <div
          style={{
            position: "absolute",
            top: 370,
            translate: `0px ${interpolate(frame, [40, 78], [760, 0], { ...clamp, easing: EASE })}px`,
            rotate: `x ${interpolate(frame, [40, 110], [28, 6], { ...clamp, easing: EASE })}deg`,
            transformOrigin: "50% 0%",
          }}
        >
          <BrowserFrame
            src="shots/landing-hero.png"
            width={1440}
            focus={{ from: 80, to: 144, scale: [1, 1.04], origin: "50% 40%" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
