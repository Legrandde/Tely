import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Words } from "../components";
import { C, sans, serifItalic } from "../theme";

// 1.33s — « Tu veux réussir mais tu ne sais pas toujours comment bien te préparer ? »
export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Question">
      <Backdrop glow={[80, 20]} />
      {/* Grand point d'interrogation en filigrane */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: -120,
          fontFamily: serifItalic,
          fontWeight: 700,
          fontSize: 1100,
          lineHeight: 1,
          color: C.amber,
          opacity: interpolate(frame, [0, 30], [0, 0.09], { extrapolateRight: "clamp" }),
          rotate: `${interpolate(frame, [0, 93], [8, 0])}deg`,
        }}
      >
        ?
      </div>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160, gap: 36 }}>
        <Words text="Tu veux réussir." size={136} align="left" delay={0} stagger={4} accentWords={["réussir"]} />
        <Words
          text="Mais comment bien te préparer ?"
          size={64}
          font={sans}
          weight={500}
          color={C.muted}
          align="left"
          delay={26}
          stagger={8}
          letterSpacing="-0.01em"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
