import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, Logo, Words } from "../components";
import { C, EASE } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const WALL = [
  "shots/prof-overview.png",
  "shots/exercices.png",
  "shots/exercice-detail.png",
  "shots/sujets.png",
  "shots/landing-hero.png",
  "shots/prof-exercices.png",
  "shots/prof-nouvel-exercice.png",
  "shots/prof-ressources.png",
  "shots/login.png",
];

// 20.02s — « Tely-Learning, ta réussite commence ici. »
export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Brand" style={{ overflow: "hidden" }}>
      <Backdrop dark glow={[50, 50]} />

      {/* Mur de captures qui défile lentement */}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 20], [0, 0.22], clamp),
          rotate: "-10deg",
          scale: "1.35",
          translate: `${interpolate(frame, [0, 89], [0, -120])}px ${interpolate(frame, [0, 89], [40, -60])}px`,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 760px)", gap: 36, margin: "-120px 0 0 -180px" }}>
          {WALL.map((s, i) => (
            <Img
              key={s + i}
              src={staticFile(s)}
              style={{ width: 760, height: 475, objectFit: "cover", objectPosition: "top", borderRadius: 14 }}
            />
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at 50% 50%, rgba(17,17,20,0.55) 0%, ${C.ink} 75%)` }}
      />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50 }}>
        <div
          style={{
            opacity: interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: EASE }),
            scale: String(interpolate(frame, [0, 30], [0.9, 1], { ...clamp, easing: EASE })),
            filter: `blur(${interpolate(frame, [0, 14], [12, 0], clamp)}px)`,
          }}
        >
          <Logo size={150} color={C.cream} />
        </div>
        <Words
          text="Ta réussite commence ici."
          size={92}
          color={C.cream}
          delay={34}
          stagger={11}
          accentWords={["réussite"]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
