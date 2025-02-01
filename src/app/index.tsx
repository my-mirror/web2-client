import "~/app/styles/globals.css";
import '~/shared/libs/buffer';

import { useEffect } from "react";
import { useExpand, useWebApp } from "@vkruglikov/react-telegram-web-app";

import { Providers } from "~/app/providers";
import { AppRouter } from "~/app/router";

export const App = () => {
  const WebApp = useWebApp();
  const [, expand] = useExpand();

  useEffect(() => {
    WebApp.enableClosingConfirmation();
    expand();

    WebApp.setHeaderColor("#1d1d1b");
    WebApp.setBackgroundColor("#1d1d1b");
  }, []);

  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
};
