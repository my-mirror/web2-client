import { useMutation } from "react-query";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

import { request } from "~/shared/libs";

export const useAuth = () => {
  const WebApp = useWebApp();
  console.log("👀👀👀 webapp: ", WebApp);

  return useMutation(["auth"], () => {
    console.log("👀👀👀 in mutation - auth");

    return request.post<{
      connected_wallet: null | {
        version: string;
        address: string;
        ton_balance: string;
      };

      auth_v1_token: string;
    }>("/auth.twa", {
      twa_data: WebApp.initData,
    });
  });
};
