import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Routes } from "~/app/router/constants";
import { RootPage } from "~/pages/root";
import { ViewContentPage } from "~/pages/view-content";

const router = createBrowserRouter([
  { path: Routes.Root, element: <RootPage /> },
  { path: Routes.ViewContent, element: <ViewContentPage /> },
  { path: Routes.SentryCheck, element: <div className="flex justify-center items-center h-screen">
    <button
    type="button"
    className="btn btn-primary p-2 border bg-red-900"
    onClick={() => {
      throw new Error("Sentry Test Error");
    }}
  >
    Sentry Test Error
  </button>
  </div> },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
