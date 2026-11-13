import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/authContext";
import { resolveImageUrl } from "../../utils/imageUrl";
import ConfirmModal from "./ConfirmModal";

const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 },
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
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, isAuthenticated, logoutLocal } = useAuth();
  const navigate = useNavigate();

  const getDashboardInfo = () => {
    if (user?.role === "administrateur") {
      return { path: "/Dashbord-admin", label: "Tableau de bord Admin" };
    }
    if (user?.role === "professeur") {
      return { path: "/Dashboard-professeur", label: "Espace Enseignant" };
    }
    return { path: "/exercices", label: "Mon Espace" };
  };

  const dashboardInfo = getDashboardInfo();
  const userAvatar = resolveImageUrl(user?.avatar_url || user?.avatar);

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
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
          onClick={() => navigate("/")}
        >
          Tely Elearning
        </motion.h1>

        {/* Desktop nav */}
        <motion.div
          className="hidden md:flex items-center justify-center gap-4 mr-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Exercices", to: "/exercices" },
            { label: "Sujets", to: "/sujets" },
          ].map((item) => (
            <motion.span key={item.label} variants={navItemVariant} className="cursor-pointer">
              <Link to={item.to}>{item.label}</Link>
            </motion.span>
          ))}

          {isAuthenticated ? (
            <motion.div variants={navItemVariant} className="flex items-center gap-3">
              {/* Accès à son espace selon son rôle */}
              <Link
                to={dashboardInfo.path}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>{dashboardInfo.label}</span>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmLogoutOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-black hover:text-white text-xs transition-colors duration-200"
              >
                <LogOut size={14} />
                Déconnexion
              </motion.button>

              <Link
                to={
                  user?.role === "administrateur"
                    ? "/Dashbord-admin/profile"
                    : user?.role === "professeur"
                    ? "/Dashboard-professeur/profile"
                    : "/profile"
                }
                className="cursor-pointer hover:opacity-85 transition-opacity"
                title="Mon Profil"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={user?.nom || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
                    {user?.prenom?.charAt(0).toUpperCase() || user?.nom?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </Link>
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
          onClick={() => setMenuOpen((v) => !v)}
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
            {[
              { label: "Exercices", to: "/exercices" },
              { label: "Anciens Sujets", to: "/sujets" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer p-1 hover:text-amber-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardInfo.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg my-1 shadow-xs"
                >
                  <LayoutDashboard size={16} />
                  <span>Accéder à {dashboardInfo.label}</span>
                </Link>

                <button
                  onClick={() => setConfirmLogoutOpen(true)}
                  className="flex items-center gap-1.5 p-2 rounded-lg cursor-pointer hover:bg-black hover:text-white transition-colors duration-200 text-left text-xs"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
                <div className="flex items-center gap-2 p-1">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.nom || "Avatar"}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.prenom?.charAt(0).toUpperCase() || user?.nom?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700">
                    {user?.prenom} {user?.nom}
                  </span>
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

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter de votre session ?"
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </motion.header>
  );
}
