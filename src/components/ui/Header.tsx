import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/authContext";
import { useSite, useSiteNom } from "../../context/SiteContext";
import { resolveImageUrl } from "../../utils/imageUrl";
import ConfirmModal from "./ConfirmModal";
import AnnonceBanner from "../site/AnnonceBanner";

type Role = "eleve" | "professeur" | "administrateur";

const ESPACES: Record<Role, { path: string; profil: string; label: string }> = {
  eleve: { path: "/espace", profil: "/espace/compte", label: "Mon espace" },
  professeur: { path: "/Dashboard-professeur", profil: "/Dashboard-professeur/profile", label: "Mon espace" },
  administrateur: { path: "/Dashbord-admin", profil: "/Dashbord-admin/profile", label: "Administration" },
};

const FOCUSABLES = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function lienNavClasse({ isActive }: { isActive: boolean }) {
  return `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
    isActive ? "text-gray-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-amber-500" : "text-gray-600 hover:text-gray-900"
  }`;
}

function Logo({ nom }: { nom: string }) {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
      aria-label={`${nom} — accueil`}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-lg font-black text-gray-950 shadow-md shadow-amber-500/25"
        aria-hidden="true"
      >
        {nom.charAt(0).toUpperCase()}
      </span>
      <span className="text-lg font-extrabold tracking-tight text-gray-900">
        {nom}
        <span className="text-amber-500">.</span>
      </span>
    </Link>
  );
}

/** Header du site public : sticky, navigation CMS, CTA de conversion, menu mobile accessible. */
export default function Header() {
  const { user, isAuthenticated, logoutLocal } = useAuth();
  const { parametres, navigation } = useSite();
  const siteNom = useSiteNom();
  const navigate = useNavigate();
  const location = useLocation();

  // Le menu est « ouvert pour un chemin » : il se ferme tout seul au changement de page.
  const [menuOuvertSur, setMenuOuvertSur] = useState<string | null>(null);
  const menuOuvert = menuOuvertSur === location.pathname;
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [defile, setDefile] = useState(() => typeof window !== "undefined" && window.scrollY > 8);

  const burgerRef = useRef<HTMLButtonElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);
  const compteRef = useRef<HTMLDivElement>(null);
  const drawerTitreId = useId();
  const compteMenuId = useId();

  const inscriptionsOuvertes = parametres?.inscriptions_ouvertes !== "0";
  const role = (user?.role ?? "eleve") as Role;
  const espace = ESPACES[role] ?? ESPACES.eleve;
  const avatar = resolveImageUrl(user?.avatar_url || user?.avatar);
  const initiale = (user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "U").toUpperCase();

  const liens = [
    { label: "Exercices", to: "/exercices" },
    { label: "Sujets d'examen", to: "/sujets" },
    { label: "Blog", to: "/blog" },
    ...navigation.menu.slice(0, 3).map((p) => ({ label: p.titre, to: `/p/${p.slug}` })),
  ];

  // Ombre + flou au défilement
  useEffect(() => {
    function onScroll() {
      setDefile(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile : verrouillage du scroll, Échap, piège de focus, restitution du focus
  useEffect(() => {
    if (!menuOuvert) return;
    const burger = burgerRef.current;
    const ancienOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const premier = panneauRef.current?.querySelector<HTMLElement>(FOCUSABLES);
    premier?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOuvertSur(null);
        return;
      }
      if (e.key !== "Tab" || !panneauRef.current) return;
      const elements = Array.from(panneauRef.current.querySelectorAll<HTMLElement>(FOCUSABLES));
      if (elements.length === 0) return;
      const debut = elements[0];
      const fin = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === debut) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        debut.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = ancienOverflow;
      burger?.focus();
    };
  }, [menuOuvert]);

  // Menu compte : clic extérieur + Échap
  useEffect(() => {
    if (!compteOuvert) return;
    function onDown(e: MouseEvent) {
      if (compteRef.current && !compteRef.current.contains(e.target as Node)) setCompteOuvert(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCompteOuvert(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [compteOuvert]);

  async function confirmerDeconnexion() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      setCompteOuvert(false);
      setMenuOuvertSur(null);
      logoutLocal();
      navigate("/");
    }
  }

  const fermerMenu = () => setMenuOuvertSur(null);

  const avatarRond = (taille = "h-8 w-8") =>
    avatar ? (
      <img
        src={avatar}
        alt=""
        width={32}
        height={32}
        referrerPolicy="no-referrer"
        className={`${taille} rounded-full object-cover ring-2 ring-amber-400/60`}
      />
    ) : (
      <span
        className={`${taille} flex items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-gray-900`}
        aria-hidden="true"
      >
        {initiale}
      </span>
    );

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>

      <AnnonceBanner />

      <header
        className={`sticky top-0 z-40 w-full transition-[background-color,box-shadow,border-color] duration-300 ${
          defile
            ? "border-b border-black/5 bg-amber-50/80 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo nom={siteNom} />

          {/* Navigation desktop */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
            {liens.map((l) => (
              <NavLink key={l.to} to={l.to} className={lienNavClasse}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={espace.path}
                  className="hidden items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:inline-flex"
                >
                  <LayoutDashboard size={15} aria-hidden="true" />
                  {espace.label}
                </Link>

                <div ref={compteRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setCompteOuvert((v) => !v)}
                    aria-expanded={compteOuvert}
                    aria-controls={compteMenuId}
                    aria-label="Menu du compte"
                    className="flex items-center gap-1 rounded-full p-0.5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    {avatarRond()}
                    <ChevronDown size={14} className="text-gray-500" aria-hidden="true" />
                  </button>
                  {compteOuvert && (
                    <div
                      id={compteMenuId}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
                    >
                      <div className="border-b border-gray-100 px-4 py-2.5">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to={espace.profil}
                        onClick={() => setCompteOuvert(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                      >
                        <User size={15} aria-hidden="true" /> Mon profil
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setCompteOuvert(false);
                          setConfirmLogoutOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50"
                      >
                        <LogOut size={15} aria-hidden="true" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-amber-500 sm:inline-flex"
                >
                  Connexion
                </Link>
                <Link
                  to={inscriptionsOuvertes ? "/auth/signup" : "/exercices"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm shadow-amber-500/30 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 sm:px-4"
                >
                  <span className="sm:hidden">{inscriptionsOuvertes ? "S'inscrire" : "Explorer"}</span>
                  <span className="hidden sm:inline">
                    {inscriptionsOuvertes ? "Inscription gratuite" : "Explorer les exercices"}
                  </span>
                  <ArrowRight size={15} className="hidden sm:block" aria-hidden="true" />
                </Link>
              </>
            )}

            <button
              ref={burgerRef}
              type="button"
              onClick={() => setMenuOuvertSur(location.pathname)}
              aria-expanded={menuOuvert}
              aria-label="Ouvrir le menu"
              className="rounded-lg p-2 text-gray-900 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-amber-500 lg:hidden"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile (drawer) */}
      <AnimatePresence>
        {menuOuvert && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={fermerMenu}
              aria-hidden="true"
            />
            <motion.div
              ref={panneauRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={drawerTitreId}
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-amber-50 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex h-16 items-center justify-between border-b border-black/5 px-4">
                <h2 id={drawerTitreId} className="text-base font-bold text-gray-900">
                  Menu
                </h2>
                <button
                  type="button"
                  onClick={fermerMenu}
                  aria-label="Fermer le menu"
                  className="rounded-lg p-2 text-gray-900 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-amber-500"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="flex flex-col gap-1">
                  {liens.map((l) => (
                    <li key={l.to}>
                      <NavLink
                        to={l.to}
                        onClick={fermerMenu}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-3 text-base font-medium ${
                            isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:bg-white/70"
                          }`
                        }
                      >
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-black/5 p-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="mb-1 flex items-center gap-3">
                      {avatarRond("h-10 w-10")}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link to={espace.path} onClick={fermerMenu} className="tely-btn w-full">
                      <LayoutDashboard size={16} aria-hidden="true" />
                      {espace.label}
                    </Link>
                    <Link to={espace.profil} onClick={fermerMenu} className="tely-btn-outline w-full">
                      <User size={16} aria-hidden="true" />
                      Mon profil
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        fermerMenu();
                        setConfirmLogoutOpen(true);
                      }}
                      className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={inscriptionsOuvertes ? "/auth/signup" : "/exercices"}
                      onClick={fermerMenu}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-amber-500 px-5 py-3.5 text-sm font-semibold text-gray-900 hover:bg-amber-400"
                    >
                      {inscriptionsOuvertes ? "Inscription gratuite" : "Explorer les exercices"}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <Link to="/auth/login" onClick={fermerMenu} className="tely-btn-outline w-full">
                      J'ai déjà un compte
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter de votre session ?"
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmerDeconnexion}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </MotionConfig>
  );
}
