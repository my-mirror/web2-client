import { ReactNode } from "react";
import { QueryClientProvider } from "react-query";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";

import { queryClient } from "~/shared/libs";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <WebAppProvider options={{ smoothButtonsTransition: true }}>
      <QueryClientProvider client={queryClient}>
        <main className="antialiased">{children}</main>
      </QueryClientProvider>
    </WebAppProvider>
  );
};
