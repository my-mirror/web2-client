import { ReactNode } from "react";
import { QueryClientProvider } from "react-query";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { queryClient } from "~/shared/libs";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <WebAppProvider options={{ smoothButtonsTransition: true }}>
      <TonConnectUIProvider
        manifestUrl={
          "https://my-public-node-1.projscale.dev/api/tonconnect-manifest.json"
        }
      >
        <QueryClientProvider client={queryClient}>
          <main className="antialiased">{children}</main>
        </QueryClientProvider>
      </TonConnectUIProvider>
    </WebAppProvider>
  );
};
