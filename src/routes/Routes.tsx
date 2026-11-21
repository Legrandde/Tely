import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import LogoLoader from "@/components/ui/LogoLoader";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import { AuthLayout } from "../pages/Login";
import { LoginForm } from "../components/form/LoginForm";
import { SignupForm } from "../components/form/SignupForm";
import { GoogleCallback } from "../pages/auth/GoogleCallback";
import { ForgotPasswordForm } from "../components/form/ForgotPasswordForm";
import { ResetPasswordForm } from "../components/form/ResetPasswordForm";
import NotFoundPage from "../pages/NotFound";
import { RequireGuest } from "./RequireGuest";
import { RequireAuth } from "./RequireAuth";
import RootAnalyticsTracker from "./RootAnalyticsTracker";

// ─── Chargement à la demande : chaque espace a son propre fichier JS ──────────
// Le visiteur de la landing ne télécharge ni le back-office ni le page builder.

/* eslint-disable react-refresh/only-export-components */
const DashbordAdmin = lazy(() => import("../pages/DashbordAdmin"));
const DashboardProfesseur = lazy(() => import("../pages/DashboardProfesseur"));
const ProfesseurOverView = lazy(() => import("../pages/professeur/ProfesseurOverView"));
const ProfesseurRessources = lazy(() => import("../pages/professeur/ProfesseurRessources"));
const AdminStatistiques = lazy(() => import("../pages/admin/AdminStatistiques"));
const GestionCandidatures = lazy(() => import("../pages/admin/GestionCandidatures"));
const GestionUtilisateurs = lazy(() => import("../pages/admin/GestionUtilisateurs"));
const JournalActivite = lazy(() => import("../pages/admin/JournalActivite"));
const GestionPages = lazy(() => import("../pages/admin/GestionPages"));
const MediathequePage = lazy(() => import("../pages/admin/MediathequePage"));
const PageBuilderPage = lazy(() => import("../pages/admin/PageBuilderPage"));
const EspaceComptePage = lazy(() => import("../pages/EspaceComptePage"));
const CourseDetailPage = lazy(() => import("../pages/CourseDetailPage"));
const SujetDetailPage = lazy(() => import("../pages/SujetsDetailPage"));
const ListeExercices = lazy(() => import("../pages/Listeexercices"));
const ListeSujets = lazy(() => import("../pages/ListeSujets"));
const PublicPage = lazy(() => import("../pages/PublicPage"));
const OverView = lazy(() => import("../pages/OverView"));
const GestionExercices = lazy(() => import("../pages/GestionExercices"));
const GestionProfesseurs = lazy(() => import("../pages/GestionProfesseurs"));
const GestionEleves = lazy(() => import("../pages/GestionEleves"));
const GestionSujets = lazy(() => import("../pages/GestionSujets"));
const FormSujetPage = lazy(() => import("../pages/FormSujetPage"));
const FormExercicePage = lazy(() => import("../pages/FormExercicePage"));
const GestionCorrections = lazy(() => import("../pages/GestionCorrections"));
const GestionMatieres = lazy(() => import("../pages/GestionMatieres"));
const GestionNiveaux = lazy(() => import("../pages/GestionNiveaux"));
const GestionCategories = lazy(() => import("../pages/GestionCategories"));
const EleveLayout = lazy(() => import("../layout/EleveLayout"));
const EleveDashboard = lazy(() => import("../pages/eleve/EleveDashboard"));
const MesFavoris = lazy(() => import("../pages/eleve/MesFavoris"));
const MonHistorique = lazy(() => import("../pages/eleve/MonHistorique"));
const BlogListe = lazy(() => import("../pages/blog/BlogListe"));
const BlogArticle = lazy(() => import("../pages/blog/BlogArticle"));
const GestionBlog = lazy(() => import("../pages/admin/GestionBlog"));
const BlogEditorPage = lazy(() => import("../pages/admin/BlogEditorPage"));

function Chargement() {
  return <LogoLoader />;
}

function charger(Composant: LazyExoticComponent<ComponentType>): ReactNode {
  return (
    <Suspense fallback={<Chargement />}>
      <Composant />
    </Suspense>
  );
}

function invite(children: ReactNode): ReactNode {
  return <RequireGuest>{children}</RequireGuest>;
}

/** Pages de contenu partagées par les espaces administrateur et professeur. */
const routesContenu = () => [
  { path: "profile", element: charger(EspaceComptePage) },
  { path: "parametres", element: charger(EspaceComptePage) },
  { path: "notifications", element: charger(EspaceComptePage) },
  { path: "exercices", element: charger(GestionExercices) },
  { path: "exercices/nouveau", element: charger(FormExercicePage) },
  { path: "exercices/:id/modifier", element: charger(FormExercicePage) },
  { path: "sujets", element: charger(GestionSujets) },
  { path: "sujets/nouveau", element: charger(FormSujetPage) },
  { path: "sujets/:id/modifier", element: charger(FormSujetPage) },
  { path: "corrections", element: charger(GestionCorrections) },
];

export const Route = createBrowserRouter([
  {
    element: <RootAnalyticsTracker />,
    children: [
      { path: "/", element: <Landing /> },

      // ─── Authentification ───
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { index: true, element: invite(<LoginForm />) },
          { path: "login", element: invite(<LoginForm />) },
          { path: "signup", element: invite(<SignupForm />) },
          { path: "google/callback", element: <GoogleCallback /> },
          { path: "forgot-password", element: <ForgotPasswordForm /> },
          { path: "reset-password", element: <ResetPasswordForm /> },
        ],
      },

      // ─── Back-office administrateur ───
      {
        path: "Dashbord-admin",
        element: <RequireAuth allowedRoles={["administrateur"]}>{charger(DashbordAdmin)}</RequireAuth>,
        children: [
          { index: true, element: charger(OverView) },
          { path: "overview", element: charger(OverView) },
          { path: "statistiques", element: charger(AdminStatistiques) },
          { path: "candidatures", element: charger(GestionCandidatures) },
          { path: "utilisateurs", element: charger(GestionUtilisateurs) },
          { path: "journal", element: charger(JournalActivite) },
          { path: "pages", element: charger(GestionPages) },
          { path: "medias", element: charger(MediathequePage) },
          { path: "blog", element: charger(GestionBlog) },
          ...routesContenu(),
          { path: "eleves", element: charger(GestionEleves) },
          { path: "professeurs", element: charger(GestionProfesseurs) },
          { path: "matieres", element: charger(GestionMatieres) },
          { path: "niveaux", element: charger(GestionNiveaux) },
          { path: "categories", element: charger(GestionCategories) },
        ],
      },
      { path: "dashboard-admin/*", element: <Navigate to="/Dashbord-admin" replace /> },

      // ─── Éditeurs plein écran (hors layout du tableau de bord) ───
      {
        path: "page-builder/:id",
        element: <RequireAuth allowedRoles={["administrateur"]}>{charger(PageBuilderPage)}</RequireAuth>,
      },
      {
        path: "blog-editor/:id",
        element: <RequireAuth allowedRoles={["administrateur"]}>{charger(BlogEditorPage)}</RequireAuth>,
      },

      // ─── Espace professeur ───
      {
        path: "Dashboard-professeur",
        element: (
          <RequireAuth allowedRoles={["professeur", "administrateur"]}>{charger(DashboardProfesseur)}</RequireAuth>
        ),
        children: [
          { index: true, element: charger(ProfesseurOverView) },
          { path: "overview", element: charger(ProfesseurOverView) },
          ...routesContenu(),
          { path: "ressources", element: charger(ProfesseurRessources) },
        ],
      },

      // ─── Espace élève ───
      {
        path: "espace",
        element: <RequireAuth allowedRoles={["eleve"]}>{charger(EleveLayout)}</RequireAuth>,
        children: [
          { index: true, element: charger(EleveDashboard) },
          { path: "favoris", element: charger(MesFavoris) },
          { path: "historique", element: charger(MonHistorique) },
          { path: "compte", element: charger(EspaceComptePage) },
        ],
      },

      // ─── Compte (tous rôles, hors espaces) ───
      { path: "profile", element: <RequireAuth>{charger(EspaceComptePage)}</RequireAuth> },
      { path: "parametres", element: <RequireAuth>{charger(EspaceComptePage)}</RequireAuth> },
      { path: "notifications", element: <RequireAuth>{charger(EspaceComptePage)}</RequireAuth> },

      // ─── Catalogue public ───
      { path: "ennoncer", element: charger(CourseDetailPage) },
      { path: "ennoncer-sujet", element: charger(SujetDetailPage) },
      { path: "exercices", element: charger(ListeExercices) },
      { path: "exercices/:id", element: charger(CourseDetailPage) },
      { path: "exercice/:id", element: charger(CourseDetailPage) },
      { path: "exercice", element: <Navigate to="/exercices" replace /> },
      { path: "sujets", element: charger(ListeSujets) },
      { path: "sujet", element: <Navigate to="/sujets" replace /> },

      // ─── Pages du CMS ───
      { path: "p/:slug", element: charger(PublicPage) },

      // ─── Blog ───
      { path: "blog", element: charger(BlogListe) },
      { path: "blog/categorie/:slug", element: charger(BlogListe) },
      { path: "blog/:slug", element: charger(BlogArticle) },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
