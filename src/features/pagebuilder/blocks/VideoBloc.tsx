import type { BlocRenduProps } from "../types";
import { txt } from "../utils/props";
import { urlEmbedVideo } from "../utils/video";
import { EnteteSection, Reveal, Section } from "./shared";

export default function VideoBloc({ props }: BlocRenduProps<"video">) {
  const titre = txt(props.titre);
  const embed = urlEmbedVideo(txt(props.url));
  if (!embed) return null;

  return (
    <Section fond="blanc">
      <EnteteSection titre={titre} />
      <Reveal className="mx-auto max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-gray-900/20 ring-1 ring-gray-900/10">
          <iframe
            src={embed}
            title={titre || "Vidéo"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </Reveal>
    </Section>
  );
}
