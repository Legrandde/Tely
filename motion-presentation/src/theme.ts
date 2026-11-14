import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Easing } from "remotion";

// Même police de titres que la plateforme (Playfair Display) + Inter pour le texte
export const serif = loadPlayfair("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
export const serifItalic = loadPlayfair("italic", {
  weights: ["600", "700"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
export const sans = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export const C = {
  cream: "#FFFAEE",
  paper: "#FFFFFF",
  ink: "#111114",
  muted: "#6B6B76",
  amber: "#F59E0B",
  orange: "#EA580C",
  line: "rgba(17,17,20,0.08)",
};

export const gradientText = {
  backgroundImage: `linear-gradient(100deg, ${C.amber} 0%, ${C.orange} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

// Courbes « expo out » façon keynote
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const FPS = 30;
export const W = 1920;
export const H = 1080;
