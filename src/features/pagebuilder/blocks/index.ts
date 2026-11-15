import type { ComponentType } from "react";
import type { TypeBloc } from "../types";
import HeroBloc from "./HeroBloc";
import TexteBloc from "./TexteBloc";
import ImageBloc from "./ImageBloc";
import TexteImageBloc from "./TexteImageBloc";
import FonctionnalitesBloc from "./FonctionnalitesBloc";
import StatistiquesBloc from "./StatistiquesBloc";
import EtapesBloc from "./EtapesBloc";
import CtaBloc from "./CtaBloc";
import FaqBloc from "./FaqBloc";
import TemoignagesBloc from "./TemoignagesBloc";
import TarifsBloc from "./TarifsBloc";
import ExercicesRecentsBloc from "./ExercicesRecentsBloc";
import LogosBloc from "./LogosBloc";
import VideoBloc from "./VideoBloc";
import EspaceBloc from "./EspaceBloc";

/** Composant de rendu par type (props génériques : chaque bloc lit ses props défensivement). */
export const COMPOSANTS_BLOCS = {
  hero: HeroBloc,
  texte: TexteBloc,
  image: ImageBloc,
  texte_image: TexteImageBloc,
  fonctionnalites: FonctionnalitesBloc,
  statistiques: StatistiquesBloc,
  etapes: EtapesBloc,
  cta: CtaBloc,
  faq: FaqBloc,
  temoignages: TemoignagesBloc,
  tarifs: TarifsBloc,
  exercices_recents: ExercicesRecentsBloc,
  logos: LogosBloc,
  video: VideoBloc,
  espace: EspaceBloc,
} as unknown as Record<TypeBloc, ComponentType<{ props: Record<string, unknown> }>>;
