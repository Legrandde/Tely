import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, EASE, sans, serif } from "./theme";
import { SITE_URL } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Fond crème + halo ambre qui respire lentement */
export const Backdrop: React.FC<{ glow?: [number, number]; dark?: boolean }> = ({
  glow = [70, 30],
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 4;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? C.ink : C.cream,
        backgroundImage: `radial-gradient(circle at ${glow[0] + drift}% ${glow[1]}%, ${
          dark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.18)"
        } 0%, transparent 45%), radial-gradient(circle at ${100 - glow[0]}% ${
          100 - glow[1] + drift
        }%, rgba(234,88,12,${dark ? 0.12 : 0.08}) 0%, transparent 40%)`,
      }}
    />
  );
};

/* Texte révélé mot par mot : montée + flou → net (style keynote) */
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  font?: string;
  weight?: number;
  color?: string;
  italicWords?: string[];
  accentWords?: string[];
  align?: "center" | "left";
  lineHeight?: number;
  maxWidth?: number;
  letterSpacing?: string;
}> = ({
  text,
  delay = 0,
  stagger = 3,
  size,
  font = serif,
  weight = 700,
  color = C.ink,
  accentWords = [],
  align = "center",
  lineHeight = 1.08,
  maxWidth = 1600,
  letterSpacing = "-0.02em",
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing,
        color,
        textAlign: align,
        maxWidth,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "0.24em",
      }}
    >
      {words.map((w, i) => {
        const start = delay + i * stagger;
        const p = interpolate(frame, [start, start + 18], [0, 1], { ...clamp, easing: EASE });
        const clean = w.replace(/[.,!?]/g, "");
        const accent = accentWords.includes(clean);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              translate: `0px ${(1 - p) * 0.45}em`,
              filter: `blur(${(1 - p) * 10}px)`,
              ...(accent
                ? {
                    backgroundImage: `linear-gradient(100deg, ${C.amber}, ${C.orange})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    fontStyle: "italic",
                    paddingRight: "0.05em",
                  }
                : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* Petite étiquette au-dessus des titres */
export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 15], [0, 1], { ...clamp, easing: EASE });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        fontFamily: sans,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.orange,
        opacity: p,
        translate: `0px ${(1 - p) * 12}px`,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 99,
          background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
        }}
      />
      {children}
    </div>
  );
};

/* Fenêtre de navigateur minimaliste contenant une capture.
   focus anime un zoom/caméra à l'intérieur de la capture. */
export const BrowserFrame: React.FC<{
  src: string;
  width: number;
  url?: string;
  imgAspect?: number; // h/w de la capture
  viewAspect?: number; // h/w de la zone visible
  focus?: { from: number; to: number; scale: [number, number]; origin?: string; panY?: [number, number] };
  shadow?: boolean;
}> = ({
  src,
  width,
  url = SITE_URL,
  imgAspect = 1500 / 2400,
  viewAspect = 1500 / 2400,
  focus,
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const bar = Math.round(width * 0.028);
  const viewH = width * viewAspect;
  const s = focus
    ? interpolate(frame, [focus.from, focus.to], focus.scale, { ...clamp, easing: EASE })
    : 1;
  const py = focus?.panY
    ? interpolate(frame, [focus.from, focus.to], focus.panY, { ...clamp, easing: EASE })
    : 0;
  return (
    <div
      style={{
        width,
        borderRadius: width * 0.014,
        overflow: "hidden",
        background: C.paper,
        boxShadow: shadow
          ? "0 2px 4px rgba(17,17,20,0.04), 0 30px 80px -20px rgba(120,53,15,0.28), 0 0 0 1px rgba(17,17,20,0.06)"
          : "none",
      }}
    >
      <div
        style={{
          height: bar,
          display: "flex",
          alignItems: "center",
          gap: bar * 0.28,
          padding: `0 ${bar * 0.6}px`,
          background: "#F6F5F2",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} style={{ width: bar * 0.3, height: bar * 0.3, borderRadius: 99, background: c }} />
        ))}
        <div
          style={{
            margin: "0 auto",
            height: bar * 0.6,
            width: "38%",
            borderRadius: 99,
            background: "#ECEAE5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sans,
            fontSize: bar * 0.34,
            color: C.muted,
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ width, height: viewH, overflow: "hidden", position: "relative" }}>
        <Img
          src={staticFile(src)}
          style={{
            width,
            height: width * imgAspect,
            display: "block",
            scale: String(s),
            transformOrigin: focus?.origin ?? "50% 0%",
            translate: `0px ${py}px`,
          }}
        />
      </div>
    </div>
  );
};

/* Cadre de smartphone */
export const Phone: React.FC<{ src: string; height: number; scrollTo?: number; scrollFrom?: number; scrollDur?: number }> = ({
  src,
  height,
  scrollTo = 0,
  scrollFrom = 0,
  scrollDur = 60,
}) => {
  const frame = useCurrentFrame();
  const width = height * (390 / 844);
  const y = interpolate(frame, [scrollFrom, scrollFrom + scrollDur], [0, scrollTo], {
    ...clamp,
    easing: EASE,
  });
  return (
    <div
      style={{
        width: width + 28,
        height: height + 28,
        borderRadius: 64,
        background: C.ink,
        padding: 14,
        boxShadow: "0 40px 90px -25px rgba(120,53,15,0.45), inset 0 0 0 2px #2a2a30",
      }}
    >
      <div style={{ width, height, borderRadius: 52, overflow: "hidden", background: C.cream, position: "relative" }}>
        <Img src={staticFile(src)} style={{ width, display: "block", translate: `0px ${-y}px` }} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            translate: "-50% 0",
            width: width * 0.32,
            height: 30,
            borderRadius: 99,
            background: C.ink,
          }}
        />
      </div>
    </div>
  );
};

/* Logotype Tely */
export const Logo: React.FC<{ size: number; color?: string }> = ({ size, color = C.ink }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: size * 0.22,
      fontFamily: serif,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "-0.03em",
      color,
    }}
  >
    <span>
      Tely
      <span
        style={{
          display: "inline-block",
          width: size * 0.16,
          height: size * 0.16,
          marginLeft: size * 0.04,
          borderRadius: 99,
          background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
        }}
      />
    </span>
    <span style={{ fontFamily: sans, fontWeight: 500, fontSize: size * 0.32, letterSpacing: "0.2em", color: C.muted }}>
      E-LEARNING
    </span>
  </div>
);
