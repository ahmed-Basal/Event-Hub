import { createBrowserRouter, Navigate } from "react-router";
import App from "../Layout/App";
import HomePage from "../../Feature/Home/HomePage";
import ActivityDashboard from "../../Feature/activites/Dashboard/ActivityDashboard";
import ActivityForm from "../../Feature/activites/Form/ActivityForm";
import ActivityDetailspages from "../../Feature/activites/Details/ActivityDetailsPage";
import TestErrors from "../../Feature/Error/TestErrors";
import NotFound from "../../Feature/Error/NotFound";
import ServerError from "../../Feature/Error/ServerError";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ServerError />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'activities', element: <ActivityDashboard /> },
            { path: 'activities/:id', element: <ActivityDetailspages /> },
            { path: 'activities/:id/:slug', element: <ActivityDetailspages /> },
            { path: 'createActivity', element: <ActivityForm key='createActivity' /> },
            { path: 'manage/:id', element: <ActivityForm key='manage' /> },
            { path: 'errors', element: <TestErrors /> },
            { path: 'not-found', element: <NotFound /> },
            { path: 'server-error', element: <ServerError /> },
            { path: '*', element: <Navigate replace to='/not-found' /> },
        ],
    },
]);