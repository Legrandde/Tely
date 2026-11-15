import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { ToastProvider } from "./context/ToastContext";
import { SiteProvider } from "./context/SiteContext";
import { Route } from "./routes/Routes";
import ErrorBoundary from "./components/site/ErrorBoundary";
import MaintenanceGate from "./components/site/MaintenanceGate";
import CookieConsent from "./components/site/CookieConsent";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SiteProvider>
            <MaintenanceGate router={Route}>
              <RouterProvider router={Route} />
            </MaintenanceGate>
            <CookieConsent onNavigate={(to) => void Route.navigate(to)} />
          </SiteProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
