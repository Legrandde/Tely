/**
 * Registre des blocs : libellé, icône, description, catégorie, props par défaut
 * et schéma des champs de l'inspecteur.
 */
import {
  ChartColumn,
  CircleQuestionMark,
  Columns2,
  CreditCard,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Library,
  ListOrdered,
  Megaphone,
  MoveVertical,
  Quote,
  Type,
  Video,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import type { Bloc, BlocPropsMap, TypeBloc } from "./types";
import { cloner, nouvelId, txt } from "./utils/props";

// ─── Schéma des champs ────────────────────────────────────────────────────

interface ChampBase {
  cle: string;
  libelle: string;
  aide?: string;
  /** Affiche le champ seulement si la condition est vraie (props du bloc ou de l'élément). */
  visibleSi?: (valeurs: Record<string, unknown>) => boolean;
}

export type Champ =
  | (ChampBase & { type: "text"; placeholder?: string; max?: number })
  | (ChampBase & { type: "textarea"; placeholder?: string; lignes?: number; markdown?: boolean })
  | (ChampBase & { type: "link"; placeholder?: string })
  | (ChampBase & { type: "image" })
  | (ChampBase & { type: "number"; min: number; max: number })
  | (ChampBase & { type: "boolean" })
  | (ChampBase & { type: "select"; options: { valeur: string | number; libelle: string }[] })
  | (ChampBase & { type: "icon" })
  | (ChampBase & { type: "matiere" | "niveau" })
  | (ChampBase & { type: "texts"; placeholder?: string; libelleAjout: string })
  | (ChampBase & {
      type: "list";
      champs: Champ[];
      nouvelElement: () => Record<string, unknown>;
      libelleElement: string;
      titreElement?: (el: Record<string, unknown>) => string;
    });

export type Categorie = "En-tête" | "Contenu" | "Conversion" | "Médias" | "Dynamique" | "Mise en page";

export const CATEGORIES: Categorie[] = ["En-tête", "Contenu", "Conversion", "Médias", "Dynamique", "Mise en page"];

export interface DefinitionBloc<K extends TypeBloc = TypeBloc> {
  type: K;
  libelle: string;
  description: string;
  icone: LucideIcon;
  categorie: Categorie;
  defaut: () => BlocPropsMap[K];
  champs: Champ[];
  /** Le bloc n'affiche rien en l'état (placeholder dans l'éditeur). */
  estVide: (props: Record<string, unknown>) => boolean;
}

// ─── Champs réutilisables ─────────────────────────────────────────────────

const FONDS = [
  { valeur: "creme", libelle: "Crème" },
  { valeur: "blanc", libelle: "Blanc" },
  { valeur: "sombre", libelle: "Sombre" },
  { valeur: "ambre", libelle: "Ambre" },
];

const aucunTexte = (props: Record<string, unknown>, cles: string[]) => cles.every((c) => !txt(props[c]));
const listeVide = (v: unknown) => !Array.isArray(v) || v.length === 0;

const MARKDOWN_AIDE = "Mise en forme : **gras**, *italique*, [lien](/adresse), listes avec « - ». Ligne vide = nouveau paragraphe.";

// ─── Définitions ──────────────────────────────────────────────────────────

const DEFINITIONS: { [K in TypeBloc]: DefinitionBloc<K> } = {
  hero: {
    type: "hero",
    libelle: "Bannière principale",
    description: "Grand titre, accroche et boutons d'action en haut de page.",
    icone: LayoutTemplate,
    categorie: "En-tête",
    defaut: () => ({
      titre: "Réussissez vos examens avec des exercices corrigés",
      sous_titre:
        "Des milliers d'exercices, d'anciens sujets et de corrigés détaillés, classés par matière et par niveau. Révisez à votre rythme, où que vous soyez.",
      bouton_texte: "Explorer les exercices",
      bouton_lien: "/exercices",
      bouton2_texte: "Créer un compte gratuit",
      bouton2_lien: "/auth/signup",
      image: "",
      alignement: "centre",
      fond: "creme",
    }),
    champs: [
      { cle: "titre", libelle: "Titre (H1)", type: "text", aide: "Seul titre principal de la page." },
      { cle: "sous_titre", libelle: "Sous-titre", type: "textarea", lignes: 3 },
      { cle: "bouton_texte", libelle: "Bouton principal — texte", type: "text" },
      { cle: "bouton_lien", libelle: "Bouton principal — lien", type: "link" },
      { cle: "bouton2_texte", libelle: "Bouton secondaire — texte", type: "text" },
      { cle: "bouton2_lien", libelle: "Bouton secondaire — lien", type: "link" },
      { cle: "image", libelle: "Illustration", type: "image" },
      {
        cle: "alignement",
        libelle: "Alignement",
        type: "select",
        options: [
          { valeur: "centre", libelle: "Centré" },
          { valeur: "gauche", libelle: "À gauche (image à droite)" },
        ],
      },
      { cle: "fond", libelle: "Fond", type: "select", options: FONDS },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "sous_titre", "bouton_texte", "bouton2_texte", "image"]),
  },

  texte: {
    type: "texte",
    libelle: "Texte",
    description: "Un titre et un ou plusieurs paragraphes mis en forme.",
    icone: Type,
    categorie: "Contenu",
    defaut: () => ({
      titre: "Notre mission",
      contenu:
        "Tely rend l'entraînement scolaire **accessible à tous les élèves**. Nous rassemblons des exercices de qualité, rédigés et corrigés par des enseignants, pour que chacun puisse progresser à son rythme.\n\nQue vous prépariez le brevet, le baccalauréat ou un simple contrôle, vous trouverez des ressources adaptées à votre niveau.",
      alignement: "gauche",
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "contenu", libelle: "Contenu", type: "textarea", lignes: 8, markdown: true, aide: MARKDOWN_AIDE },
      {
        cle: "alignement",
        libelle: "Alignement",
        type: "select",
        options: [
          { valeur: "gauche", libelle: "À gauche" },
          { valeur: "centre", libelle: "Centré" },
        ],
      },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "contenu"]),
  },

  image: {
    type: "image",
    libelle: "Image",
    description: "Une image avec texte alternatif et légende.",
    icone: ImageIcon,
    categorie: "Médias",
    defaut: () => ({ image: "", alt: "", legende: "", largeur: "normale" }),
    champs: [
      { cle: "image", libelle: "Image", type: "image" },
      { cle: "alt", libelle: "Texte alternatif", type: "text", aide: "Décrit l'image pour les lecteurs d'écran et le référencement." },
      { cle: "legende", libelle: "Légende", type: "text" },
      {
        cle: "largeur",
        libelle: "Largeur",
        type: "select",
        options: [
          { valeur: "normale", libelle: "Normale" },
          { valeur: "pleine", libelle: "Pleine largeur" },
        ],
      },
    ],
    estVide: (p) => !txt(p.image),
  },

  texte_image: {
    type: "texte_image",
    libelle: "Texte + image",
    description: "Texte et image côte à côte, avec bouton optionnel.",
    icone: Columns2,
    categorie: "Contenu",
    defaut: () => ({
      titre: "Des corrigés pensés pour comprendre",
      contenu:
        "Chaque corrigé détaille la démarche pas à pas : vous ne vous contentez pas du résultat, vous comprenez **comment** y arriver.\n\n- Méthodes expliquées\n- Erreurs fréquentes signalées\n- Exercices similaires proposés",
      image: "",
      alt: "",
      position_image: "droite",
      bouton_texte: "Voir un exemple",
      bouton_lien: "/exercices",
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "contenu", libelle: "Contenu", type: "textarea", lignes: 7, markdown: true, aide: MARKDOWN_AIDE },
      { cle: "image", libelle: "Image", type: "image" },
      { cle: "alt", libelle: "Texte alternatif de l'image", type: "text" },
      {
        cle: "position_image",
        libelle: "Position de l'image",
        type: "select",
        options: [
          { valeur: "droite", libelle: "À droite" },
          { valeur: "gauche", libelle: "À gauche" },
        ],
      },
      { cle: "bouton_texte", libelle: "Bouton — texte", type: "text" },
      { cle: "bouton_lien", libelle: "Bouton — lien", type: "link" },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "contenu", "image", "bouton_texte"]),
  },

  fonctionnalites: {
    type: "fonctionnalites",
    libelle: "Fonctionnalités",
    description: "Grille d'atouts avec icônes.",
    icone: LayoutGrid,
    categorie: "Contenu",
    defaut: () => ({
      titre: "Tout pour réviser efficacement",
      sous_titre: "Une plateforme pensée avec des enseignants pour accompagner chaque élève.",
      colonnes: 3,
      elements: [
        { icone: "livre", titre: "Exercices par chapitre", texte: "Retrouvez rapidement des exercices classés par matière, niveau et notion." },
        { icone: "valide", titre: "Corrigés détaillés", texte: "Des solutions rédigées étape par étape pour comprendre la méthode." },
        { icone: "diplome", titre: "Sujets d'examen", texte: "Entraînez-vous sur les anciens sujets du brevet et du baccalauréat." },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "sous_titre", libelle: "Sous-titre", type: "textarea", lignes: 2 },
      {
        cle: "colonnes",
        libelle: "Colonnes (grand écran)",
        type: "select",
        options: [
          { valeur: 2, libelle: "2 colonnes" },
          { valeur: 3, libelle: "3 colonnes" },
          { valeur: 4, libelle: "4 colonnes" },
        ],
      },
      {
        cle: "elements",
        libelle: "Atouts",
        type: "list",
        libelleElement: "Atout",
        nouvelElement: () => ({ icone: "etoile", titre: "Nouvel atout", texte: "Décrivez ce bénéfice en une phrase." }),
        titreElement: (el) => txt(el.titre),
        champs: [
          { cle: "icone", libelle: "Icône", type: "icon" },
          { cle: "titre", libelle: "Titre", type: "text" },
          { cle: "texte", libelle: "Texte", type: "textarea", lignes: 3 },
        ],
      },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "sous_titre"]) && listeVide(p.elements),
  },

  statistiques: {
    type: "statistiques",
    libelle: "Statistiques",
    description: "Chiffres clés, automatiques ou saisis à la main.",
    icone: ChartColumn,
    categorie: "Dynamique",
    defaut: () => ({
      titre: "Tely en chiffres",
      source: "auto",
      elements: [
        { valeur: "5 000+", libelle: "Exercices corrigés" },
        { valeur: "98 %", libelle: "D'élèves satisfaits" },
        { valeur: "24 h/24", libelle: "Accès aux ressources" },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      {
        cle: "source",
        libelle: "Source des chiffres",
        type: "select",
        options: [
          { valeur: "auto", libelle: "Automatique (données réelles du site)" },
          { valeur: "manuel", libelle: "Saisie manuelle" },
        ],
      },
      {
        cle: "elements",
        libelle: "Chiffres",
        type: "list",
        libelleElement: "Chiffre",
        visibleSi: (p) => p.source === "manuel",
        nouvelElement: () => ({ valeur: "100+", libelle: "Nouveau chiffre" }),
        titreElement: (el) => [txt(el.valeur), txt(el.libelle)].filter(Boolean).join(" — "),
        champs: [
          { cle: "valeur", libelle: "Valeur", type: "text", placeholder: "Ex. 10 000+" },
          { cle: "libelle", libelle: "Libellé", type: "text" },
        ],
      },
    ],
    estVide: (p) => p.source === "manuel" && !txt(p.titre) && listeVide(p.elements),
  },

  etapes: {
    type: "etapes",
    libelle: "Étapes",
    description: "Processus numéroté « comment ça marche ».",
    icone: ListOrdered,
    categorie: "Contenu",
    defaut: () => ({
      titre: "Comment ça marche ?",
      sous_titre: "Trois étapes pour commencer à réviser dès aujourd'hui.",
      elements: [
        { titre: "Créez votre compte", texte: "Inscription gratuite en moins d'une minute." },
        { titre: "Choisissez votre niveau", texte: "Sélectionnez votre classe et vos matières préférées." },
        { titre: "Entraînez-vous", texte: "Faites les exercices puis consultez les corrigés détaillés." },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "sous_titre", libelle: "Sous-titre", type: "textarea", lignes: 2 },
      {
        cle: "elements",
        libelle: "Étapes",
        type: "list",
        libelleElement: "Étape",
        nouvelElement: () => ({ titre: "Nouvelle étape", texte: "" }),
        titreElement: (el) => txt(el.titre),
        champs: [
          { cle: "titre", libelle: "Titre", type: "text" },
          { cle: "texte", libelle: "Texte", type: "textarea", lignes: 3 },
        ],
      },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "sous_titre"]) && listeVide(p.elements),
  },

  cta: {
    type: "cta",
    libelle: "Appel à l'action",
    description: "Encadré incitatif avec un bouton.",
    icone: Megaphone,
    categorie: "Conversion",
    defaut: () => ({
      titre: "Prêt à progresser ?",
      texte: "Rejoignez des milliers d'élèves qui révisent chaque jour avec Tely.",
      bouton_texte: "Commencer gratuitement",
      bouton_lien: "/auth/signup",
      fond: "sombre",
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "texte", libelle: "Texte", type: "textarea", lignes: 3 },
      { cle: "bouton_texte", libelle: "Bouton — texte", type: "text" },
      { cle: "bouton_lien", libelle: "Bouton — lien", type: "link" },
      {
        cle: "fond",
        libelle: "Fond",
        type: "select",
        options: [
          { valeur: "sombre", libelle: "Sombre" },
          { valeur: "ambre", libelle: "Ambre" },
          { valeur: "creme", libelle: "Crème" },
        ],
      },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "texte", "bouton_texte"]),
  },

  faq: {
    type: "faq",
    libelle: "FAQ",
    description: "Questions fréquentes en accordéon.",
    icone: CircleQuestionMark,
    categorie: "Conversion",
    defaut: () => ({
      titre: "Questions fréquentes",
      elements: [
        { question: "Tely est-il gratuit ?", reponse: "Oui, l'inscription et l'accès à la majorité des exercices sont gratuits." },
        { question: "Les corrigés sont-ils rédigés par des enseignants ?", reponse: "Tous les contenus sont proposés et vérifiés par des professeurs inscrits sur la plateforme." },
        { question: "Puis-je utiliser Tely sur mon téléphone ?", reponse: "Bien sûr : le site s'adapte à tous les écrans, du smartphone à l'ordinateur." },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      {
        cle: "elements",
        libelle: "Questions",
        type: "list",
        libelleElement: "Question",
        nouvelElement: () => ({ question: "Nouvelle question ?", reponse: "" }),
        titreElement: (el) => txt(el.question),
        champs: [
          { cle: "question", libelle: "Question", type: "text" },
          { cle: "reponse", libelle: "Réponse", type: "textarea", lignes: 4, markdown: true, aide: MARKDOWN_AIDE },
        ],
      },
    ],
    estVide: (p) => !txt(p.titre) && listeVide(p.elements),
  },

  temoignages: {
    type: "temoignages",
    libelle: "Témoignages",
    description: "Avis d'élèves, de parents ou d'enseignants.",
    icone: Quote,
    categorie: "Conversion",
    defaut: () => ({
      titre: "Ils révisent avec Tely",
      elements: [
        { nom: "Awa Diallo", role: "Élève de Terminale S", texte: "Les corrigés détaillés m'ont vraiment aidée à comprendre mes erreurs en mathématiques.", avatar: "" },
        { nom: "Moussa Ndiaye", role: "Parent d'élève", texte: "Mon fils s'entraîne seul le soir et ses notes ont nettement progressé ce trimestre.", avatar: "" },
        { nom: "Mme Sow", role: "Professeure de physique", texte: "Une plateforme simple pour partager mes exercices avec mes élèves.", avatar: "" },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      {
        cle: "elements",
        libelle: "Témoignages",
        type: "list",
        libelleElement: "Témoignage",
        nouvelElement: () => ({ nom: "Prénom Nom", role: "", texte: "Votre témoignage ici.", avatar: "" }),
        titreElement: (el) => txt(el.nom),
        champs: [
          { cle: "nom", libelle: "Nom", type: "text" },
          { cle: "role", libelle: "Rôle", type: "text", placeholder: "Ex. Élève de 3e" },
          { cle: "texte", libelle: "Témoignage", type: "textarea", lignes: 4 },
          { cle: "avatar", libelle: "Photo", type: "image" },
        ],
      },
    ],
    estVide: (p) => !txt(p.titre) && listeVide(p.elements),
  },

  tarifs: {
    type: "tarifs",
    libelle: "Tarifs",
    description: "Comparatif d'offres avec liste d'avantages.",
    icone: CreditCard,
    categorie: "Conversion",
    defaut: () => ({
      titre: "Des offres adaptées à chacun",
      sous_titre: "Commencez gratuitement, passez à la vitesse supérieure quand vous le souhaitez.",
      elements: [
        {
          nom: "Découverte",
          prix: "0 FCFA",
          periode: "/ mois",
          description: "Pour découvrir la plateforme.",
          points: ["Exercices en accès libre", "Anciens sujets d'examen", "Accès sur mobile"],
          bouton_texte: "Créer un compte",
          bouton_lien: "/auth/signup",
          mis_en_avant: false,
        },
        {
          nom: "Réussite",
          prix: "2 500 FCFA",
          periode: "/ mois",
          description: "Pour réviser sérieusement toute l'année.",
          points: ["Tous les corrigés détaillés", "Suivi de progression", "Favoris illimités", "Support prioritaire"],
          bouton_texte: "Choisir Réussite",
          bouton_lien: "/auth/signup",
          mis_en_avant: true,
        },
        {
          nom: "Établissement",
          prix: "Sur devis",
          periode: "",
          description: "Pour les écoles et centres de soutien.",
          points: ["Comptes enseignants", "Tableau de bord de classe", "Accompagnement dédié"],
          bouton_texte: "Nous contacter",
          bouton_lien: "/p/contact",
          mis_en_avant: false,
        },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "sous_titre", libelle: "Sous-titre", type: "textarea", lignes: 2 },
      {
        cle: "elements",
        libelle: "Offres",
        type: "list",
        libelleElement: "Offre",
        nouvelElement: () => ({
          nom: "Nouvelle offre",
          prix: "",
          periode: "/ mois",
          description: "",
          points: [],
          bouton_texte: "Choisir",
          bouton_lien: "/auth/signup",
          mis_en_avant: false,
        }),
        titreElement: (el) => txt(el.nom),
        champs: [
          { cle: "nom", libelle: "Nom de l'offre", type: "text" },
          { cle: "prix", libelle: "Prix", type: "text", placeholder: "Ex. 2 500 FCFA" },
          { cle: "periode", libelle: "Période", type: "text", placeholder: "Ex. / mois" },
          { cle: "description", libelle: "Description", type: "textarea", lignes: 2 },
          { cle: "points", libelle: "Avantages", type: "texts", libelleAjout: "Ajouter un avantage", placeholder: "Avantage inclus" },
          { cle: "bouton_texte", libelle: "Bouton — texte", type: "text" },
          { cle: "bouton_lien", libelle: "Bouton — lien", type: "link" },
          { cle: "mis_en_avant", libelle: "Mettre en avant (recommandé)", type: "boolean" },
        ],
      },
    ],
    estVide: (p) => aucunTexte(p, ["titre", "sous_titre"]) && listeVide(p.elements),
  },

  exercices_recents: {
    type: "exercices_recents",
    libelle: "Exercices récents",
    description: "Derniers exercices publiés, filtrables par matière et niveau.",
    icone: Library,
    categorie: "Dynamique",
    defaut: () => ({
      titre: "Les derniers exercices publiés",
      nombre: 6,
      matiere_id: null,
      niveau_id: null,
      bouton_texte: "Voir tous les exercices",
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      { cle: "nombre", libelle: "Nombre d'exercices", type: "number", min: 1, max: 12 },
      { cle: "matiere_id", libelle: "Matière", type: "matiere", aide: "Laisser vide pour toutes les matières." },
      { cle: "niveau_id", libelle: "Niveau", type: "niveau", aide: "Laisser vide pour tous les niveaux." },
      { cle: "bouton_texte", libelle: "Bouton « voir tout » — texte", type: "text", aide: "Mène vers la liste des exercices. Vide = pas de bouton." },
    ],
    estVide: () => false,
  },

  logos: {
    type: "logos",
    libelle: "Logos partenaires",
    description: "Bandeau de logos (partenaires, établissements, presse).",
    icone: BadgeCheck,
    categorie: "Médias",
    defaut: () => ({
      titre: "Ils nous font confiance",
      elements: [
        { nom: "Lycée Blaise Diagne", image: "", lien: "" },
        { nom: "Collège Sainte-Marie", image: "", lien: "" },
        { nom: "Académie de Dakar", image: "", lien: "" },
        { nom: "Cours Sainte-Jeanne", image: "", lien: "" },
      ],
    }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      {
        cle: "elements",
        libelle: "Logos",
        type: "list",
        libelleElement: "Logo",
        nouvelElement: () => ({ nom: "Partenaire", image: "", lien: "" }),
        titreElement: (el) => txt(el.nom),
        champs: [
          { cle: "nom", libelle: "Nom", type: "text", aide: "Sert de texte alternatif ; affiché si aucune image." },
          { cle: "image", libelle: "Logo", type: "image" },
          { cle: "lien", libelle: "Lien", type: "link" },
        ],
      },
    ],
    estVide: (p) => !txt(p.titre) && listeVide(p.elements),
  },

  video: {
    type: "video",
    libelle: "Vidéo",
    description: "Vidéo YouTube ou Vimeo intégrée.",
    icone: Video,
    categorie: "Médias",
    defaut: () => ({ titre: "Découvrez Tely en vidéo", url: "" }),
    champs: [
      { cle: "titre", libelle: "Titre", type: "text" },
      {
        cle: "url",
        libelle: "Adresse de la vidéo",
        type: "link",
        placeholder: "https://www.youtube.com/watch?v=…",
        aide: "YouTube ou Vimeo uniquement (lecture sans cookies publicitaires).",
      },
    ],
    estVide: () => false,
  },

  espace: {
    type: "espace",
    libelle: "Espacement",
    description: "Espace vertical entre deux sections.",
    icone: MoveVertical,
    categorie: "Mise en page",
    defaut: () => ({ hauteur: "moyen" }),
    champs: [
      {
        cle: "hauteur",
        libelle: "Hauteur",
        type: "select",
        options: [
          { valeur: "petit", libelle: "Petit" },
          { valeur: "moyen", libelle: "Moyen" },
          { valeur: "grand", libelle: "Grand" },
        ],
      },
    ],
    estVide: () => false,
  },
};

export const REGISTRE = DEFINITIONS as unknown as Record<TypeBloc, DefinitionBloc>;

export const TYPES_BLOCS = Object.keys(DEFINITIONS) as TypeBloc[];

export function definition(type: TypeBloc): DefinitionBloc | undefined {
  return REGISTRE[type];
}

/** Crée un nouveau bloc avec ses props par défaut. */
export function creerBloc<K extends TypeBloc>(type: K, props?: Partial<BlocPropsMap[K]>): Bloc {
  const def = REGISTRE[type];
  return {
    id: nouvelId(),
    type,
    props: { ...cloner(def.defaut() as unknown as Record<string, unknown>), ...(props ?? {}) },
    masque: false,
  };
}

/** Duplique un bloc existant (nouvel identifiant, contenu copié). */
export function dupliquerBloc(bloc: Bloc): Bloc {
  return { id: nouvelId(), type: bloc.type, props: cloner(bloc.props), masque: !!bloc.masque };
}
