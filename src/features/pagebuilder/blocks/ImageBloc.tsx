import type { BlocRenduProps } from "../types";
import { choix, lien, txt } from "../utils/props";
import { ImageSure, Reveal } from "./shared";

export default function ImageBloc({ props }: BlocRenduProps<"image">) {
  const image = lien(props.image);
  const legende = txt(props.legende);
  const pleine = choix(props.largeur, ["normale", "pleine"] as const, "normale") === "pleine";
  if (!image) return null;

  return (
    <section className={`bg-white ${pleine ? "py-0" : "px-4 py-10 @3xl:px-8 @3xl:py-14"}`}>
      <Reveal as="div" className={pleine ? "" : "mx-auto max-w-5xl"}>
        <figure>
          <ImageSure
            src={image}
            alt={txt(props.alt)}
            className={`w-full object-cover ${pleine ? "max-h-[640px]" : "rounded-2xl shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5"}`}
          />
          {legende && (
            <figcaption className={`mt-3 text-center text-sm text-gray-500 ${pleine ? "px-4 pb-6" : ""}`}>
              {legende}
            </figcaption>
          )}
        </figure>
      </Reveal>
    </section>
  );
}
