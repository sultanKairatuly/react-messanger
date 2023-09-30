import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/mainLayout';
import Signup from '../components/Signup';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />
    },
    {
        path: '/signup',
        element: <Signup />
    }
];
const router = createBrowserRouter(routes);
export default router;