import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { ToastProvider } from "./context/ToastContext";
import { SiteProvider } from "./context/SiteContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Route } from "./routes/Routes";
import ErrorBoundary from "./components/site/ErrorBoundary";
import MaintenanceGate from "./components/site/MaintenanceGate";
import CookieConsent from "./components/site/CookieConsent";
import PwaInstallPrompt from "./components/site/PwaInstallPrompt";

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <SiteProvider>
              <MaintenanceGate router={Route}>
                <RouterProvider router={Route} />
              </MaintenanceGate>
              <CookieConsent onNavigate={(to) => void Route.navigate(to)} />
              <PwaInstallPrompt />
            </SiteProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
