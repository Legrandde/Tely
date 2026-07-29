import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { Route } from "./routes/Routes";


function App() {
  return (
    <AuthProvider>
      <RouterProvider router={Route} />
    </AuthProvider>
  );
}

export default App;