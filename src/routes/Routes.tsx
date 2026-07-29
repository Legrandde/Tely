import { createBrowserRouter } from "react-router-dom";
import Landing from '../pages/Landing';
import { AuthLayout } from '../pages/Login';
import DashbordAdmin from '../pages/DashbordAdmin';

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
import NotFoundPage from "../pages/NotFound";
import { RequireGuest } from "./RequireGuest";
import { RequireAuth } from "./RequireAuth";

export const Route = createBrowserRouter([
    {
        path: '/',
        element: <Landing />
    },
    {
        path: 'auth',
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
                path: 'login',
                element: (
                    <RequireGuest>
                        <LoginForm />
                    </RequireGuest>
                ),
            },
            {
                path: 'signup',
                element: (
                    <RequireGuest>
                        <SignupForm />
                    </RequireGuest>
                ),
            },
            {
                path: 'google/callback',
                element: <GoogleCallback />,
            },
            {
                path: 'forgot-password',
                element: <ForgotPasswordForm />,
            },
            {
                path: 'reset-password',
                element: <ResetPasswordForm />,
            },
        ],
    },
    {
        path: 'Dashbord-admin',
        element: (
            <RequireAuth allowedRoles={["administrateur"]}>
                <DashbordAdmin />
            </RequireAuth>
        ),
        children: [
            {
                path: "",
                index: true,
                element: <OverView />
            },
            {
                path: "overview",
                element: <OverView />
            },
            {
                path: "exercices",
                element: <GestionExercices />
            },
            {
                path: "Eleves",
                element: <GestionEleves />
            },
            {
                path: "Professeurs",
                element: <GestionProfesseurs />
            },
            {
                path: "sujets",
                element: <div className="p-6 text-sm text-gray-500">Gestion des sujets d'examen (À venir)</div>
            },
        ]
    },
    {
        path: "ennoncer",
        element: <CourseDetailPage />
    },
    {
        path: "Exercices",
        element: <ListeExercices />
    },
    {
        path: "*",
        element: <NotFoundPage />
    }
]);