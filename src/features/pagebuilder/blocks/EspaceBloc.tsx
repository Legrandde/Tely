import type { BlocRenduProps } from "../types";
import { choix } from "../utils/props";

const HAUTEURS = { petit: "h-8", moyen: "h-16 @3xl:h-20", grand: "h-24 @3xl:h-36" } as const;

export default function EspaceBloc({ props }: BlocRenduProps<"espace">) {
  const h = choix(props.hauteur, ["petit", "moyen", "grand"] as const, "moyen");
  return <div aria-hidden="true" className={`bg-white ${HAUTEURS[h]}`} />;
}
