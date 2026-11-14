import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Words } from "../components";
import { C } from "../theme";

// 0.0s — « Les examens approchent ? »
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Hook">
      <Backdrop dark glow={[50, 50]} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: String(
            interpolate(frame, [0, 40], [1.06, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          ),
        }}
      >
        <Words
          text="Les examens approchent ?"
          size={150}
          color={C.cream}
          delay={1}
          stagger={5}
          accentWords={["examens"]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
