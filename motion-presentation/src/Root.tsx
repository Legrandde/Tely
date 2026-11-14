import { Composition, Folder } from "remotion";
import { TelyPromo } from "./TelyPromo";
import { Hook } from "./scenes/Hook";
import { Question } from "./scenes/Question";
import { Reveal } from "./scenes/Reveal";
import { Features } from "./scenes/Features";
import { Levels } from "./scenes/Levels";
import { Brand } from "./scenes/Brand";
import { Cta } from "./scenes/Cta";
import { FPS, H, W } from "./theme";
import { SCENES, TOTAL } from "./timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TelyPromo-Scenes">
        <Composition id="Hook" component={Hook} width={W} height={H} fps={FPS} durationInFrames={SCENES.hook} />
        <Composition id="Question" component={Question} width={W} height={H} fps={FPS} durationInFrames={SCENES.question} />
        <Composition id="Reveal" component={Reveal} width={W} height={H} fps={FPS} durationInFrames={SCENES.reveal} />
        <Composition id="Features" component={Features} width={W} height={H} fps={FPS} durationInFrames={SCENES.features} />
        <Composition id="Levels" component={Levels} width={W} height={H} fps={FPS} durationInFrames={SCENES.levels} />
        <Composition id="Brand" component={Brand} width={W} height={H} fps={FPS} durationInFrames={SCENES.brand} />
        <Composition id="CTA" component={Cta} width={W} height={H} fps={FPS} durationInFrames={SCENES.cta} />
      </Folder>
      <Composition id="TelyPromo" component={TelyPromo} width={W} height={H} fps={FPS} durationInFrames={TOTAL} />
    </>
  );
};
