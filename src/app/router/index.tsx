import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Routes } from "~/app/router/constants";
import { RootPage } from "~/pages/root";
import { ViewContentPage } from "~/pages/view-content";

const router = createBrowserRouter([
  { path: Routes.Root, element: <RootPage /> },
  { path: Routes.ViewContent, element: <ViewContentPage /> },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
