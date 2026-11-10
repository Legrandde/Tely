import { createBrowserRouter } from "react-router-dom";
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
import GestionCorrections from "../pages/GestionCorrections";
import GestionMatieres from "../pages/GestionMatieres";
import GestionNiveaux from "../pages/GestionNiveaux";
import GestionCategories from "../pages/GestionCategories";
import NotFoundPage from "../pages/NotFound";
import { RequireGuest } from "./RequireGuest";
import { RequireAuth } from "./RequireAuth";
import ListeSujets from "../pages/ListeSujets";
import SujetDetailPage from "../pages/SujetsDetailPage";

export const Route = createBrowserRouter([
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
        path: "exercices",
        element: <GestionExercices />,
      },
      {
        path: "sujets",
        element: <GestionSujets />,
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
        element: <GestionEleves />,
      },
      {
        path: "professeurs",
        element: <GestionProfesseurs />,
      },
      {
        path: "Professeurs",
        element: <GestionProfesseurs />,
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
        path: "exercices",
        element: <GestionExercices />,
      },
      {
        path: "sujets",
        element: <GestionSujets />,
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
    path: "dashboard-professeur",
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
        path: "exercices",
        element: <GestionExercices />,
      },
      {
        path: "sujets",
        element: <GestionSujets />,
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
    path: "profile",
    element: (
      <RequireAuth>
        <ProfilePage />
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
    element: <ListeExercices />,
  },
  {
    path: "sujets",
    element: <ListeSujets />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
