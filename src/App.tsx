import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { ToastProvider } from "./context/ToastContext";
import { Route } from "./routes/Routes";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={Route} />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
