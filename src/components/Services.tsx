import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ServicesProps {
  image?: string;
  titre: string;
  liens?: string;
  couleur?: string;
  rotation?: number;
}

export default function Service({ image, titre, liens, rotation, couleur }: ServicesProps) {
  return (
    <motion.div animate={{ rotate: rotation }} className={`flex w-72 gap-4 border items-center relative ${couleur ? couleur : "bg-amber-500"} rounded-lg`}>
      <img src={image || "histoire.png"} alt={titre} className="w-42 rounded-lg" />
      <div className="flex p-3 flex-col justify-center items-center text-center gap-2">
        <p className="text-base font-semibold">{titre}</p>
        <a href={liens || "#"} className="bg-black flex items-center gap-1 text-white p-1 px-3 rounded-lg shadow-lg text-sm">
          explorer <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  );
}