import { Component, type ReactNode } from "react";
import type { Bloc } from "./types";
import { COMPOSANTS_BLOCS } from "./blocks";

/** Isole un bloc défaillant : une donnée corrompue ne casse pas toute la page. */
export class BlocBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };

  static getDerivedStateFromError() {
    return { erreur: true };
  }

  render() {
    return this.state.erreur ? (this.props.fallback ?? null) : this.props.children;
  }
}

/** Rendu d'un seul bloc (utilisé par le rendu public et par le canevas de l'éditeur). */
export function BlocRendu({ bloc }: { bloc: Bloc }) {
  const Composant = COMPOSANTS_BLOCS[bloc.type];
  if (!Composant) return null;
  const props = bloc.props && typeof bloc.props === "object" && !Array.isArray(bloc.props) ? bloc.props : {};
  return (
    <BlocBoundary>
      <Composant props={props} />
    </BlocBoundary>
  );
}

/** Rendu public complet des blocs d'une page (sans header ni footer). */
export default function PageRenderer({ blocs }: { blocs: Bloc[] }) {
  const visibles = (Array.isArray(blocs) ? blocs : []).filter((b) => b && !b.masque);
  return (
    <div className="@container w-full overflow-x-hidden bg-white font-sans text-gray-900">
      {visibles.map((b, i) => (
        <BlocRendu key={b.id || i} bloc={b} />
      ))}
    </div>
  );
}
