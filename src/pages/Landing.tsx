import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ── Variants ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0  },
};

const fadeDown = {
  hidden: { opacity: 0, y: -20 },
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

const navItemVariant = {
  hidden: { opacity: 0, y: -10 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col w-full bg-amber-50 p-3 gap-4">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.header
        className="justify-between flex flex-col p-1"
        variants={fadeDown}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo + nav row */}
        <div className="flex items-center justify-between">
          <motion.h1
            className="text-amber-600 italic font-bold"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Tely Elearning
          </motion.h1>

          {/* Desktop nav — identique à l'original */}
          <motion.div
            className="hidden md:flex items-center justify-center gap-4 mr-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {["Exercices", "Anciens Sujets", "Corrections"].map((item) => (
              <motion.span key={item} variants={navItemVariant} className="cursor-default">
                {item}
              </motion.span>
            ))}
            <motion.div variants={navItemVariant}>
              <Link
                to="login"
                className="cursor-pointer hover:bg-black hover:text-white p-1 rounded-lg transition-colors duration-200"
              >
                Connexion
              </Link>
            </motion.div>
            <motion.button
              variants={navItemVariant}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="p-1 bg-amber-500 rounded-lg cursor-pointer"
            >
              Inscription
            </motion.button>
          </motion.div>

          {/* Hamburger — mobile only */}
          <motion.button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(v => !v)}
            whileTap={{ scale: 0.93 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden flex flex-col gap-1 pt-2"
            >
              {["Exercices", "Anciens Sujets", "Corrections"].map((item) => (
                <span key={item} className="cursor-default p-1">{item}</span>
              ))}
              <Link
                to="login"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer hover:bg-black hover:text-white p-1 rounded-lg transition-colors duration-200"
              >
                Connexion
              </Link>
              <button className="p-1 bg-amber-500 rounded-lg cursor-pointer text-left">
                Inscription
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti
          adipisci asperiores distinctio repellat nostrum quod praesentium totam
          non odio
        </motion.p>

        {/* ── CTA buttons ──────────────────────────────────────────────── */}
        <motion.div
          className="flex gap-7 justify-center"
          variants={fadeUp}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <motion.button
            whileHover={{ scale: 1.06, backgroundColor: "#fbbf24" }}
            whileTap={{ scale: 0.96 }}
            className="bg-amber-500 cursor-pointer p-1 rounded-lg flex justify-center items-center gap-4 transition-colors duration-200"
          >
            Explorer <ArrowRight size={20} />
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="login"
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
  );
}