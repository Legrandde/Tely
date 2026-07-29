import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/authContext";

const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  show:   { opacity: 1, y: 0  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const navItemVariant: Variants = {
  hidden: { opacity: 0, y: -10 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logoutLocal } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      logoutLocal();
      setMenuOpen(false);
      navigate("/");
    }
  }

  return (
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
          className="text-amber-600 cursor-pointer italic font-bold"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={()=> navigate("/")}
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
            <motion.span key={item} variants={navItemVariant} className="cursor-pointer">
               <Link to={`/${item}`}>{item}</Link>
            </motion.span>
          ))}

          {isAuthenticated ? (
            <motion.div variants={navItemVariant} className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="flex items-center gap-1 p-1 rounded-lg cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
              >
                <LogOut size={16} />
                Déconnexion
              </motion.button>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nom}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
                  {user?.nom?.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div variants={navItemVariant}>
                <Link
                  to="/auth/login"
                  className="cursor-pointer hover:bg-black hover:text-white p-1 rounded-lg transition-colors duration-200"
                >
                  Connexion
                </Link>
              </motion.div>
              <motion.div variants={navItemVariant}>
                <Link
                  to="/auth/signup"
                  className="p-1 bg-amber-500 rounded-lg cursor-pointer inline-block"
                >
                  Inscription
                </Link>
              </motion.div>
            </>
          )}
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

            {isAuthenticated ? (
              <>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 p-1 rounded-lg cursor-pointer hover:bg-black hover:text-white transition-colors duration-200 text-left"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
                <div className="flex items-center gap-2 p-1">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nom}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.nom?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer hover:bg-black hover:text-white p-1 rounded-lg transition-colors duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="p-1 bg-amber-500 rounded-lg cursor-pointer text-left inline-block"
                >
                  Inscription
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}