import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Awa Diallo",
    role: "Élève en Terminale S",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&h=300&q=80",
    text: "Utiliser cette plateforme a tout changé pour moi. Les exercices et les anciens sujets rendent les révisions tellement plus simples !",
  },
  {
    name: "Mamadou Sow",
    role: "Étudiant en prépa scientifique",
    avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=300&h=300&q=80",
    text: "Des ressources exceptionnelles ! Les corrigés détaillés et la liberté de m'entraîner à mon rythme ont été essentiels dans ma progression.",
  },
  {
    name: "Fatou Ndiaye",
    role: "Élève en 1ère L",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&h=300&q=80",
    text: "Je recommande vivement ! Les solutions pas à pas et l'immense bibliothèque d'exercices ont vraiment renforcé ma compréhension.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

// carte temoignage
function TestimonialCard({ name, role, avatar, text }: { name: string; role: string; avatar: string; text: string }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="h-12 w-12 rounded-full border-2 border-amber-500 object-cover"
        />
        <div>
          <h3 className="font-bold text-black">{name}</h3>
          <p className="text-xs text-black/50">{role}</p>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className="fill-amber-500 text-amber-500" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-black/70">{text}</p>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-amber-50 px-6 py-16">
      <h2 className="text-center text-3xl font-bold text-black">Témoignages de nos élèves</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-base text-black/70">
        Voici ce que nos élèves pensent de leur expérience : des histoires vraies, de vrais progrès.
        Découvrez l'impact de notre plateforme sur leur réussite.
      </p>

      <motion.div
        className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </motion.div>
    </section>
  );
}
