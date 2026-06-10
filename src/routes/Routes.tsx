import { createBrowserRouter } from "react-router-dom";
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import DashbordAdmin from '../pages/DashbordAdmin'
export const Route = createBrowserRouter([
    {
        path:'/',
        element: <Landing />
    },
    {
        path:'login',
        element: <Login />
    },
    {
        path: 'Dashbord-admin',
        element: <DashbordAdmin />
    }
])