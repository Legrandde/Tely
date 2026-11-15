/**
 * Modèles de pages prêts à l'emploi (les identifiants des blocs sont générés à chaque utilisation).
 */
import { FileText, Info, LayoutTemplate, MessageCircleQuestion, Tag, type LucideIcon } from "lucide-react";
import type { Bloc } from "./types";
import { creerBloc } from "./registry";

export interface ModelePage {
  id: string;
  nom: string;
  description: string;
  icone: LucideIcon;
  titreSuggere: string;
  metaSuggeree: string;
  blocs: () => Bloc[];
}

export const MODELES: ModelePage[] = [
  {
    id: "landing",
    nom: "Landing marketing",
    description: "Bannière, atouts, chiffres, étapes, témoignages, FAQ et appel à l'action.",
    icone: LayoutTemplate,
    titreSuggere: "Réviser avec Tely",
    metaSuggeree: "Exercices corrigés, anciens sujets d'examen et corrigés détaillés pour réviser efficacement du collège au lycée.",
    blocs: () => [
      creerBloc("hero", { alignement: "centre", fond: "creme" }),
      creerBloc("logos"),
      creerBloc("fonctionnalites"),
      creerBloc("statistiques"),
      creerBloc("texte_image"),
      creerBloc("etapes"),
      creerBloc("exercices_recents"),
      creerBloc("temoignages"),
      creerBloc("faq"),
      creerBloc("cta"),
    ],
  },
  {
    id: "a-propos",
    nom: "À propos",
    description: "Présentez la mission, l'équipe et les valeurs de Tely.",
    icone: Info,
    titreSuggere: "À propos de Tely",
    metaSuggeree: "Découvrez la mission de Tely : rendre l'entraînement scolaire accessible à tous les élèves grâce à des exercices corrigés.",
    blocs: () => [
      creerBloc("hero", {
        titre: "Apprendre mieux, ensemble",
        sous_titre: "Tely est né d'une conviction simple : chaque élève mérite des ressources de qualité pour réussir, où qu'il soit.",
        bouton_texte: "",
        bouton2_texte: "",
        fond: "blanc",
      }),
      creerBloc("texte_image", {
        titre: "Notre histoire",
        contenu:
          "Tout a commencé avec un groupe d'enseignants qui partageaient leurs exercices entre collègues. Aujourd'hui, Tely rassemble une communauté de professeurs et d'élèves autour d'une même ambition : **la réussite scolaire pour tous**.",
        bouton_texte: "",
      }),
      creerBloc("statistiques"),
      creerBloc("fonctionnalites", {
        titre: "Nos valeurs",
        sous_titre: "",
        elements: [
          { icone: "coeur", titre: "Bienveillance", texte: "Chaque erreur est une occasion d'apprendre." },
          { icone: "bouclier", titre: "Exigence", texte: "Des contenus vérifiés par des enseignants." },
          { icone: "globe", titre: "Accessibilité", texte: "Des ressources disponibles partout, sur tous les écrans." },
        ],
      }),
      creerBloc("cta", { titre: "Envie de nous rejoindre ?", texte: "Enseignants, partagez vos exercices avec des milliers d'élèves.", bouton_texte: "Devenir contributeur", bouton_lien: "/auth/signup", fond: "ambre" }),
    ],
  },
  {
    id: "legale",
    nom: "Page légale",
    description: "Structure sobre pour mentions légales, CGU ou politique de confidentialité.",
    icone: FileText,
    titreSuggere: "Mentions légales",
    metaSuggeree: "Mentions légales du site Tely : éditeur, hébergement, propriété intellectuelle et contact.",
    blocs: () => [
      creerBloc("hero", {
        titre: "Mentions légales",
        sous_titre: "Dernière mise à jour : à compléter.",
        bouton_texte: "",
        bouton2_texte: "",
        fond: "creme",
      }),
      creerBloc("texte", {
        titre: "Éditeur du site",
        contenu: "Le site Tely est édité par **[raison sociale]**, [forme juridique] au capital de [montant], dont le siège est situé [adresse].\n\nDirecteur de la publication : [nom].\nContact : [contact@exemple.com](mailto:contact@exemple.com)",
      }),
      creerBloc("texte", {
        titre: "Hébergement",
        contenu: "Le site est hébergé par [hébergeur], [adresse de l'hébergeur].",
      }),
      creerBloc("texte", {
        titre: "Propriété intellectuelle",
        contenu: "L'ensemble des contenus présents sur le site (textes, exercices, corrigés, images) est protégé. Toute reproduction sans autorisation préalable est interdite.",
      }),
      creerBloc("texte", {
        titre: "Données personnelles",
        contenu: "Pour en savoir plus sur la gestion de vos données, consultez notre [politique de confidentialité](/p/confidentialite).",
      }),
    ],
  },
  {
    id: "contact",
    nom: "Contact / FAQ",
    description: "Coordonnées, questions fréquentes et appel à l'action.",
    icone: MessageCircleQuestion,
    titreSuggere: "Contact",
    metaSuggeree: "Une question sur Tely ? Consultez la FAQ ou contactez notre équipe par e-mail ou téléphone.",
    blocs: () => [
      creerBloc("hero", {
        titre: "Une question ? Parlons-en",
        sous_titre: "Notre équipe vous répond du lundi au vendredi, de 9 h à 18 h.",
        bouton_texte: "Nous écrire",
        bouton_lien: "mailto:contact@tely.com",
        bouton2_texte: "Nous appeler",
        bouton2_lien: "tel:+221771234567",
        fond: "creme",
      }),
      creerBloc("fonctionnalites", {
        titre: "Comment nous joindre",
        sous_titre: "",
        colonnes: 3,
        elements: [
          { icone: "message", titre: "Par e-mail", texte: "contact@tely.com\nRéponse sous 48 h ouvrées." },
          { icone: "mobile", titre: "Par téléphone", texte: "+221 77 123 45 67\nDu lundi au vendredi." },
          { icone: "globe", titre: "Sur les réseaux", texte: "Suivez-nous pour ne rien manquer des nouveautés." },
        ],
      }),
      creerBloc("faq"),
      creerBloc("cta", { titre: "Pas encore inscrit ?", texte: "Créez votre compte gratuitement et commencez à réviser.", fond: "sombre" }),
    ],
  },
  {
    id: "tarifs",
    nom: "Tarifs",
    description: "Offres comparées, garanties et FAQ sur la facturation.",
    icone: Tag,
    titreSuggere: "Tarifs",
    metaSuggeree: "Découvrez les offres Tely : accès gratuit, abonnement Réussite et formules pour les établissements.",
    blocs: () => [
      creerBloc("hero", {
        titre: "Un tarif simple et transparent",
        sous_titre: "Sans engagement. Changez d'offre ou résiliez à tout moment.",
        bouton_texte: "",
        bouton2_texte: "",
        fond: "blanc",
      }),
      creerBloc("tarifs", { titre: "", sous_titre: "" }),
      creerBloc("fonctionnalites", {
        titre: "Inclus dans toutes les offres",
        sous_titre: "",
        colonnes: 4,
        elements: [
          { icone: "bouclier", titre: "Paiement sécurisé", texte: "Vos transactions sont protégées." },
          { icone: "mobile", titre: "Accès mobile", texte: "Révisez depuis votre téléphone." },
          { icone: "horloge", titre: "Sans engagement", texte: "Résiliez quand vous voulez." },
          { icone: "message", titre: "Support réactif", texte: "Une équipe à votre écoute." },
        ],
      }),
      creerBloc("faq", {
        titre: "Questions sur la facturation",
        elements: [
          { question: "Quels moyens de paiement acceptez-vous ?", reponse: "Mobile money et carte bancaire." },
          { question: "Puis-je annuler mon abonnement ?", reponse: "Oui, à tout moment depuis votre espace, sans frais." },
        ],
      }),
      creerBloc("cta", { titre: "Une question avant de vous lancer ?", texte: "", bouton_texte: "Contactez-nous", bouton_lien: "/p/contact", fond: "creme" }),
    ],
  },
];
