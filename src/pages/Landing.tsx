import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Service from "../components/Services";
import { GoArrowRight } from "react-icons/go";
import NiveauCard from "../components/NiveauCard";
import Header from "../components/ui/Header";
import { useAuth } from "../context/authContext";


// ── Variants ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col w-full  bg-amber-50 gap-4">

        <Header />

        {/* ── Hero text block ──────────────────────────────────────────────── */}
        <motion.div
          className="flex self-center flex-col w-96 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="text-3xl font-bold text-center"
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            Trouver vos Exercices, Facilement et rapidement
          </motion.h1>

          <motion.p
            className="text-base text-center"
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            Accédez à une vaste bibliothèque d'exercices, d'anciens sujets et de corrigés conçus pour vous aider à réussir. Révisez efficacement, entraînez-vous à votre rythme et améliorez vos performances grâce à des ressources fiables et accessibles à tout moment.
          </motion.p>

          {/* ── CTA buttons ──────────────────────────────────────────────── */}
          <motion.div
            className="flex gap-7 justify-center"
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <motion.button
              onClick={()=> navigate('/exercices')}
              whileHover={{ scale: 1.06, backgroundColor: "#fbbf24" }}
              whileTap={{ scale: 0.96 }}
              className="bg-amber-500 cursor-pointer p-1 rounded-lg flex justify-center items-center gap-4 transition-colors duration-200"
            >
              Explorer <ArrowRight size={20} />
            </motion.button>

            {!isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/auth/login"
                  className="cursor-pointer flex items-center gap-4 border-t border-b border-gray-100 hover:bg-black hover:text-white hover:rounded-lg justify-center shadow p-1 transition-all duration-200"
                >
                  <img
                    src="banniere.png"
                    alt=""
                    className="w-4 h-4 object-cover font-semibold bg-amber-500 rounded-full"
                  />
                  Se connecter
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* ── Banner image ─────────────────────────────────────────────────── */}
        <motion.img
          src="banner3.png"
          alt=""
          className="h-96 object-cover self-center"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
        />
      </div>



      {/* Services sections ------------------------------------------------------------------ */}
        <div className="flex flex-col p-3">
          <motion.div transition={{ duration: 0.55, ease: "easeOut" }} variants={fadeUp}   className="flex md:flex-row gap-2 items-center j flex-col justify-center">
            <Service titre="Exercices" rotation={-2}/>
            <Service titre="Sujets Exams" couleur="bg-white" image="banniere.png" />
            <Service titre="Corrigés" image="banner3.png" couleur="bg-amber-200" rotation={2}/>
            
          </motion.div >
          <div className="flex bg-amber-50 p-3 items-center gap-7 mt-7 justify-center flex-col">
            <h2 className="font-semibold text-2xl">Commencez dés maintenant a vous exercer!</h2>
            <p className="text-center w-96 self-center">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Modi unde quam iusto, perferendis harum nostrum inventore libero neque illo aspernatur aperiam praesentium temporibus</p>
            <button className="p-1 shadow-xl  bg-black rounded-lg flex items-center gap-4 text-white">Commencer la pratique <GoArrowRight /> </button>
          </div>
        </div>

        {/* Section des niveaux */}
        <div className="flex flex-col p-3 items-center justify-center">
            <NiveauCard />
        </div>
      </div>
  );
}