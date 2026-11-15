export interface QuestionFaq {
  question: string;
  reponse: string;
  /** Affichée seulement si les candidatures enseignants sont ouvertes. */
  enseignant?: boolean;
}

export const FAQ: QuestionFaq[] = [
  {
    question: "Tely est-il vraiment gratuit ?",
    reponse:
      "Oui. La création d'un compte élève est gratuite et donne accès aux énoncés complets, aux anciens sujets d'examen et aux corrigés détaillés.",
  },
  {
    question: "Quels niveaux et quelles matières sont couverts ?",
    reponse:
      "Du collège au lycée : mathématiques, sciences, français, histoire-géographie, langues et plus encore. Les contenus sont classés par matière, niveau et série, et la bibliothèque s'enrichit régulièrement.",
  },
  {
    question: "Qui rédige les exercices et les corrigés ?",
    reponse:
      "Des enseignants dont la candidature a été examinée et validée par notre équipe. Chaque exercice est accompagné d'un corrigé expliqué étape par étape.",
  },
  {
    question: "Puis-je utiliser Tely sur mon téléphone ?",
    reponse:
      "Oui, le site est conçu pour fonctionner sur téléphone, tablette et ordinateur. Vous pouvez aussi imprimer un exercice ou l'enregistrer en PDF.",
  },
  {
    question: "Comment retrouver les exercices déjà consultés ?",
    reponse:
      "Votre espace élève garde l'historique des exercices consultés et la liste de vos favoris, pour reprendre vos révisions là où vous les avez laissées.",
  },
  {
    question: "Je suis enseignant : comment publier mes exercices ?",
    reponse:
      "Envoyez votre candidature depuis la section « Espace enseignants » de cette page. Après validation, vous recevez vos accès pour publier exercices, sujets et corrigés.",
    enseignant: true,
  },
];
