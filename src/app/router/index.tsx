import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Routes } from "~/app/router/constants";
import { RootPage } from "~/pages/root";

const router = createBrowserRouter([
  { path: Routes.Root, element: <RootPage /> },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
