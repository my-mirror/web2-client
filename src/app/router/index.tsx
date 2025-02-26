import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Routes } from "~/app/router/constants";
import { RootPage } from "~/pages/root";
import { ViewContentPage } from "~/pages/view-content";
import { ProtectedLayout } from "./protected-layout";

const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: Routes.Root, element: <RootPage /> },
      { path: Routes.ViewContent, element: <ViewContentPage /> },
      { 
        path: Routes.SentryCheck, 
        element: (
          <div className="flex h-screen items-center justify-center">
            <button
              type="button"
              className="btn btn-primary border bg-red-900 p-2"
              onClick={() => {
                throw new Error("Sentry Test Error");
              }}
            >
              Sentry Test Error
            </button>
          </div>
        ),
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
