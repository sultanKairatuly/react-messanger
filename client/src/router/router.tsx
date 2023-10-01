import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/mainLayout';
import Signup from '../components/Signup';
import Signin from '../components/Signin';

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
    }
];
const router = createBrowserRouter(routes);
export default router;