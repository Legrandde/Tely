import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import { AuthLayout } from "../pages/Login";
import DashbordAdmin from "../pages/DashbordAdmin";
import DashboardProfesseur from "../pages/DashboardProfesseur";
import ProfesseurOverView from "../pages/professeur/ProfesseurOverView";
import ProfesseurRessources from "../pages/professeur/ProfesseurRessources";
import AdminStatistiques from "../pages/admin/AdminStatistiques";
import GestionCandidatures from "../pages/admin/GestionCandidatures";
import ProfilePage from "../pages/ProfilePage";

import CourseDetailPage from "../pages/CourseDetailPage";

import { LoginForm } from "../components/form/LoginForm";
import { SignupForm } from "../components/form/SignupForm";
import { GoogleCallback } from "../pages/auth/GoogleCallback";
import { ForgotPasswordForm } from "../components/form/ForgotPasswordForm";
import { ResetPasswordForm } from "../components/form/ResetPasswordForm";
import ListeExercices from "../pages/Listeexercices";
import OverView from "../pages/OverView";
import GestionExercices from "../pages/GestionExercices";
import GestionProfesseurs from "../pages/GestionProfesseurs";
import GestionEleves from "../pages/GestionEleves";
import GestionSujets from "../pages/GestionSujets";
import FormSujetPage from "../pages/FormSujetPage";
import FormExercicePage from "../pages/FormExercicePage";
import NotificationsPage from "../pages/NotificationsPage";
import GestionCorrections from "../pages/GestionCorrections";
import GestionMatieres from "../pages/GestionMatieres";
import GestionNiveaux from "../pages/GestionNiveaux";
import GestionCategories from "../pages/GestionCategories";
import ParametresPage from "../pages/ParametresPage";
import NotFoundPage from "../pages/NotFound";
import { RequireGuest } from "./RequireGuest";
import { RequireAuth } from "./RequireAuth";
import ListeSujets from "../pages/ListeSujets";
import SujetDetailPage from "../pages/SujetsDetailPage";

import RootAnalyticsTracker from "./RootAnalyticsTracker";

export const Route = createBrowserRouter([
  {
    element: <RootAnalyticsTracker />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <RequireGuest>
            <LoginForm />
          </RequireGuest>
        ),
      },
      {
        path: "login",
        element: (
          <RequireGuest>
            <LoginForm />
          </RequireGuest>
        ),
      },
      {
        path: "signup",
        element: (
          <RequireGuest>
            <SignupForm />
          </RequireGuest>
        ),
      },
      {
        path: "google/callback",
        element: <GoogleCallback />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordForm />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordForm />,
      },
    ],
  },
  {
    path: "Dashbord-admin",
    element: (
      <RequireAuth allowedRoles={["administrateur"]}>
        <DashbordAdmin />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        index: true,
        element: <OverView />,
      },
      {
        path: "overview",
        element: <OverView />,
      },
      {
        path: "statistiques",
        element: <AdminStatistiques />,
      },
      {
        path: "candidatures",
        element: <GestionCandidatures />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "parametres",
        element: <ParametresPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "exercices",
        element: <GestionExercices />,
      },
      {
        path: "exercices/nouveau",
        element: <FormExercicePage />,
      },
      {
        path: "exercices/:id/modifier",
        element: <FormExercicePage />,
      },
      {
        path: "sujets",
        element: <GestionSujets />,
      },
      {
        path: "sujets/nouveau",
        element: <FormSujetPage />,
      },
      {
        path: "sujets/:id/modifier",
        element: <FormSujetPage />,
      },
      {
        path: "corrections",
        element: <GestionCorrections />,
      },
      {
        path: "eleves",
        element: <GestionEleves />,
      },
      {
        path: "Eleves",
        element: <Navigate to="/Dashbord-admin/eleves" replace />,
      },
      {
        path: "professeurs",
        element: <GestionProfesseurs />,
      },
      {
        path: "Professeurs",
        element: <Navigate to="/Dashbord-admin/professeurs" replace />,
      },
      {
        path: "matieres",
        element: <GestionMatieres />,
      },
      {
        path: "niveaux",
        element: <GestionNiveaux />,
      },
      {
        path: "categories",
        element: <GestionCategories />,
      },
    ],
  },
  {
    path: "Dashboard-professeur",
    element: (
      <RequireAuth allowedRoles={["professeur", "administrateur"]}>
        <DashboardProfesseur />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        index: true,
        element: <ProfesseurOverView />,
      },
      {
        path: "overview",
        element: <ProfesseurOverView />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "parametres",
        element: <ParametresPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "exercices",
        element: <GestionExercices />,
      },
      {
        path: "exercices/nouveau",
        element: <FormExercicePage />,
      },
      {
        path: "exercices/:id/modifier",
        element: <FormExercicePage />,
      },
      {
        path: "sujets",
        element: <GestionSujets />,
      },
      {
        path: "sujets/nouveau",
        element: <FormSujetPage />,
      },
      {
        path: "sujets/:id/modifier",
        element: <FormSujetPage />,
      },
      {
        path: "corrections",
        element: <GestionCorrections />,
      },
      {
        path: "ressources",
        element: <ProfesseurRessources />,
      },
    ],
  },
  {
    path: "dashboard-professeur/*",
    element: <Navigate to="/Dashboard-professeur" replace />,
  },
  {
    path: "dashboard-admin/*",
    element: <Navigate to="/Dashbord-admin" replace />,
  },
  {
    path: "Dashboard-admin/*",
    element: <Navigate to="/Dashbord-admin" replace />,
  },
  {
    path: "profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: "notifications",
    element: (
      <RequireAuth>
        <NotificationsPage />
      </RequireAuth>
    ),
  },
  {
    path: "ennoncer",
    element: <CourseDetailPage />,
  },
  {
    path: "ennoncer-sujet",
    element: <SujetDetailPage />,
  },
  {
    path: "Exercices",
    element: <Navigate to="/exercices" replace />,
  },
  {
    path: "exercices",
    element: <ListeExercices />,
  },
  {
    path: "Sujets",
    element: <Navigate to="/sujets" replace />,
  },
  {
    path: "sujets",
    element: <ListeSujets />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
    ],
  },
]);
