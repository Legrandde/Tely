import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Hook } from "./scenes/Hook";
import { Question } from "./scenes/Question";
import { Reveal } from "./scenes/Reveal";
import { Features } from "./scenes/Features";
import { Levels } from "./scenes/Levels";
import { Brand } from "./scenes/Brand";
import { Cta } from "./scenes/Cta";

// Coupes franches calées sur chaque phrase de la voix off (voir timing.ts)
export const TelyPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFAEE" }}>
      <Series>
        <Series.Sequence name="Hook" durationInFrames={40}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence name="Question" durationInFrames={93}>
          <Question />
        </Series.Sequence>
        <Series.Sequence name="Reveal" durationInFrames={144}>
          <Reveal />
        </Series.Sequence>
        <Series.Sequence name="Features" durationInFrames={164}>
          <Features />
        </Series.Sequence>
        <Series.Sequence name="Levels" durationInFrames={160}>
          <Levels />
        </Series.Sequence>
        <Series.Sequence name="Brand" durationInFrames={89}>
          <Brand />
        </Series.Sequence>
        <Series.Sequence name="CTA" durationInFrames={150}>
          <Cta />
        </Series.Sequence>
      </Series>
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
