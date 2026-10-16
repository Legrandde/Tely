export  interface SujetInterface{
    id: string,
    titre: string
    annee: string      
    session:string
    type: string
    matiere:{nom: string}
    niveau: {libelle:string}
    
    ennonce: string
}
 

export interface SujetExercice {
  id: string;
  ordre: number;
  titre?: string;
  enonce?: string;
  correction?: {
    contenu?: string;
    explication?: string;
  };
}

export interface Sujet {
  id: string;
  titre: string;
  annee: number;
  session: "juin" | "septembre" | "janvier";
  type: "bac" | "brevet" | "composition" | "autre";
  ennonce: string;
  est_actif?: boolean;
  matiere: { id: string; nom: string };
  niveau: { id: string; libelle: string };
  professeur?: {
    user?: {
      nom: string;
      prenom: string;
      avatar?: string;
    };
  };
  exercices: SujetExercice[];
}