import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/mainLayout';
import Signup from '../components/Signup';
import Signin from '../components/Signin';
import SignupCustomization from "../components/SignupCustomization";

const routes: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />
    },
    {
        path: '/signup',
        element: <Signup />
    },
    {
        path: "/signin",
        element: <Signin />
    },
    {
        path: "/signup-customization",
        element: <SignupCustomization />
    }
];
const router = createBrowserRouter(routes);
export default router;