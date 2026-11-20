import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import { logout } from "@/services/authService";
import { useAuth } from "@/context/authContext";
import { useSite, useSiteNom } from "@/context/SiteContext";
import { resolveImageUrl } from "@/utils/imageUrl";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AnnonceBanner from "@/components/site/AnnonceBanner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

type Role = "eleve" | "professeur" | "administrateur";

const ESPACES: Record<Role, { path: string; profil: string; label: string }> = {
  eleve: { path: "/espace", profil: "/espace/compte", label: "Mon espace" },
  professeur: { path: "/Dashboard-professeur", profil: "/Dashboard-professeur/profile", label: "Mon espace" },
  administrateur: { path: "/Dashbord-admin", profil: "/Dashbord-admin/profile", label: "Administration" },
};

function Logo({ nom }: { nom: string }) {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${nom} — accueil`}
    >
      <span
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-2xs"
        aria-hidden="true"
      >
        {nom.charAt(0).toUpperCase()}
      </span>
      <span className="tely-title text-lg tracking-tight">
        {nom}
        <span className="text-amber-500">.</span>
      </span>
    </Link>
  );
}

/** Header du site public : sticky glassmorphic, navigation CMS, CTA de conversion, Sheet mobile accessible. */
export default function Header() {
  const { user, isAuthenticated, logoutLocal } = useAuth();
  const { parametres, navigation } = useSite();
  const siteNom = useSiteNom();
  const navigate = useNavigate();
  const location = useLocation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function confirmerDeconnexion() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      setSheetOpen(false);
      logoutLocal();
      navigate("/");
    }
  }

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Aller au contenu
      </a>

      <AnnonceBanner />

      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo nom={siteNom} />

          {/* Navigation desktop */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
            {liens.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link to={espace.path}>
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    {espace.label}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Menu du compte"
                      className="hidden sm:flex items-center gap-1.5 rounded-full p-0.5 transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <Avatar className="size-8">
                        {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
                        <AvatarFallback>{initiale}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate(espace.path)}>
                      <LayoutDashboard className="size-4" />
                      {espace.label}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate(espace.profil)}>
                      <User className="size-4" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setConfirmLogoutOpen(true)}
                    >
                      <LogOut className="size-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/auth/login">Connexion</Link>
                </Button>
                <Button asChild variant="brand" size="sm">
                  <Link to={inscriptionsOuvertes ? "/auth/signup" : "/exercices"}>
                    <span className="sm:hidden">{inscriptionsOuvertes ? "S'inscrire" : "Explorer"}</span>
                    <span className="hidden sm:inline">
                      {inscriptionsOuvertes ? "Inscription gratuite" : "Explorer les exercices"}
                    </span>
                    <ArrowRight className="hidden size-4 sm:block" aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}

            {/* Menu mobile (shadcn Sheet) */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col p-0">
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                  <SheetTitle>{siteNom}</SheetTitle>
                </SheetHeader>

                <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-3 py-4">
                  <ul className="flex flex-col gap-1">
                    {liens.map((l) => {
                      const active = location.pathname === l.to;
                      return (
                        <li key={l.to}>
                          <Link
                            to={l.to}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                              "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              active
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            )}
                          >
                            {l.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <Separator />

                <div className="p-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <div className="mb-2 flex items-center gap-3 px-1">
                        <Avatar className="size-9">
                          {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
                          <AvatarFallback>{initiale}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {user?.prenom} {user?.nom}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Button asChild className="w-full" onClick={() => setSheetOpen(false)}>
                        <Link to={espace.path}>
                          <LayoutDashboard className="size-4" />
                          {espace.label}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" onClick={() => setSheetOpen(false)}>
                        <Link to={espace.profil}>
                          <User className="size-4" />
                          Mon profil
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => {
                          setSheetOpen(false);
                          setConfirmLogoutOpen(true);
                        }}
                      >
                        <LogOut className="size-4" />
                        Déconnexion
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="brand" className="w-full" onClick={() => setSheetOpen(false)}>
                        <Link to={inscriptionsOuvertes ? "/auth/signup" : "/exercices"}>
                          {inscriptionsOuvertes ? "Inscription gratuite" : "Explorer les exercices"}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" onClick={() => setSheetOpen(false)}>
                        <Link to="/auth/login">J'ai déjà un compte</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

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
    </>
  );
}
