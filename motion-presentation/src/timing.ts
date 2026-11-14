// Découpage calé sur la voix off (transcription Whisper, 30 fps)
// Chaque coupe tombe sur le début d'une phrase.
export const SCENES = {
  hook: 40, // 0.00s  « Les examens approchent ? »
  question: 93, // 1.33s  « Tu veux réussir mais… comment bien te préparer ? »
  reveal: 144, // 4.43s  « Découvre Tely-Learning, ta plateforme pour apprendre… »
  features: 164, // 9.22s  « Accède à des exercices, des sujets d'examen… »
  levels: 160, // 14.68s « De l'entrée en 7e au BEPC, jusqu'au bac… »
  brand: 89, // 20.02s « Tely-Learning, ta réussite commence ici. »
  cta: 150, // 22.98s « Rendez-vous dès maintenant sur … »
};

export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);

// URL prononcée à la fin de la voix off
export const SITE_URL = "tely-sendy.vercel.app";
