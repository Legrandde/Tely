import { Search, GraduationCap, BookOpen, User, Play } from "lucide-react";
import type {  ComponentType } from "react";

const photos = [
  { src: "https://i.pinimg.com/736x/72/cc/c8/72ccc8be66cd4f62fe8fcd20bdab023f.jpg", bg: "bg-pink-200", radius: "rounded-tl-[48px] rounded-br-[64px]" },
  { src: "https://i.pinimg.com/736x/7b/02/71/7b027145c4e8a04d2b67f67f723358a6.jpg", bg: "bg-purple-500", radius: "rounded-tr-[48px] rounded-bl-[64px]" },
  { src: "https://i.pinimg.com/1200x/92/2f/f4/922ff45c5904b38fef895f39bf799739.jpg", bg: "bg-purple-500", radius: "rounded-bl-[48px] rounded-tr-[64px]" },
  { src: "https://i.pinimg.com/1200x/6f/e2/7f/6fe27fc037dd1eb2755f925fde7727be.jpg", bg: "bg-pink-200", radius: "rounded-br-[48px] rounded-tl-[64px]" },
];


const benefits = [
  {
    icon: GraduationCap,
    iconBg: "bg-yellow-400",
    title: "Diplômes en ligne",
    text: "Obtenez des diplômes accrédités depuis chez vous, ouvrant la porte à un monde de possibilités.",
  },
  {
    icon: BookOpen,
    iconBg: "bg-amber-500",
    title: "Cours courts",
    text: "Améliorez vos compétences avec nos cours courts et ciblés, conçus pour un apprentissage rapide et efficace.",
  },
  {
    icon: User,
    iconBg: "bg-gray-600",
    title: "Formation par des experts",
    text: "Plongez dans le savoir accompagné d'experts du secteur qui vous guident à travers une expérience pratique.",
  },
  {
    icon: Play,
    iconBg: "bg-red-500",
    title: "1,5k+ cours vidéo",
    text: "Découvrez une immense bibliothèque de plus de 1,5k cours vidéo couvrant tous les sujets imaginables.",
  },
];


interface CartePhotoProps {
  src: string;
  bg: string;
  radius: string;
}

interface BenefitItemProps {
  icon: ComponentType<{ className?: string; size?: number }>;
  iconBg: string;
  title: string;
  text: string;
}

// carte photo
function CartePhoto({ src, bg, radius }: CartePhotoProps) {
  return (
    <div className={`${bg} ${radius} overflow-hidden`}>
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

// ligne benefice
function BenefitItem({ icon: Icon, iconBg, title, text }: BenefitItemProps) {
  return (
    <div className="flex gap-4">
      <div className={`${iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-full`}>
        <Icon className="text-white" size={22} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default function RechercheCours() {
  return (
    <section className="bg-amber-50 px-6 py-20">
      {/* barre de recherche */}
      <h2 className="text-center text-3xl font-extrabold text-slate-900">Rechercher des Cours</h2>
      <div className="mx-auto mt-6 flex max-w-2xl gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm">
          <Search className="text-purple-500" size={20} />
          <input
            type="text"
            placeholder="Rechercher des cours"
            className="w-full bg-transparent text-sm text-slate-500 outline-none"
          />
        </div>
        <button className="rounded-full bg-linear-to-r from-yellow-600 to-gray-500 px-8 py-3 font-semibold text-white">
          Rechercher
        </button>
      </div>

      {/* contenu */}
      <div className="mx-auto mt-16 grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        {/* collage photos */}
        <div className="mx-auto w-full max-w-md rounded-[48px] border-2 border-dashed border-amber-300 p-3">
          <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2">
            {photos.map((photo, i) => (
              <CartePhoto key={i} {...photo} />
            ))}
          </div>
        </div>

        {/* liste benefices */}
        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-900">
            <span className="text-yellow-600">Avantages</span> De Notre Formation En Ligne
          </h2>
          <div className="mt-8 flex flex-col gap-7">
            {benefits.map((benefit, i) => (
              <BenefitItem key={i} {...benefit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}