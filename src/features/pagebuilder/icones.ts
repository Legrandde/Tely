/**
 * Liste fermée d'icônes utilisables dans les blocs (prop `icone`),
 * mappées vers lucide-react. Une icône inconnue retombe sur « etoile ».
 */
import {
  Award,
  BookOpen,
  Brain,
  Calculator,
  ChartColumn,
  CircleCheckBig,
  Clock,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  MessageCircle,
  PenLine,
  Puzzle,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONES: Record<string, { libelle: string; icone: LucideIcon }> = {
  livre: { libelle: "Livre", icone: BookOpen },
  diplome: { libelle: "Diplôme", icone: GraduationCap },
  trophee: { libelle: "Trophée", icone: Trophy },
  cible: { libelle: "Cible", icone: Target },
  etincelles: { libelle: "Étincelles", icone: Sparkles },
  eclair: { libelle: "Éclair", icone: Zap },
  bouclier: { libelle: "Bouclier", icone: ShieldCheck },
  horloge: { libelle: "Horloge", icone: Clock },
  utilisateurs: { libelle: "Utilisateurs", icone: Users },
  message: { libelle: "Message", icone: MessageCircle },
  ampoule: { libelle: "Ampoule", icone: Lightbulb },
  fusee: { libelle: "Fusée", icone: Rocket },
  etoile: { libelle: "Étoile", icone: Star },
  coeur: { libelle: "Cœur", icone: Heart },
  medaille: { libelle: "Médaille", icone: Award },
  cerveau: { libelle: "Cerveau", icone: Brain },
  calculatrice: { libelle: "Calculatrice", icone: Calculator },
  globe: { libelle: "Globe", icone: Globe },
  mobile: { libelle: "Mobile", icone: Smartphone },
  telechargement: { libelle: "Téléchargement", icone: Download },
  document: { libelle: "Document", icone: FileText },
  valide: { libelle: "Validé", icone: CircleCheckBig },
  crayon: { libelle: "Crayon", icone: PenLine },
  puzzle: { libelle: "Puzzle", icone: Puzzle },
  graphique: { libelle: "Graphique", icone: ChartColumn },
  couches: { libelle: "Couches", icone: Layers },
};

export const NOMS_ICONES = Object.keys(ICONES);

export function iconePour(nom: unknown): LucideIcon {
  return (typeof nom === "string" && ICONES[nom]?.icone) || Star;
}
