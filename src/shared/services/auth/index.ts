import { useMutation } from "react-query";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

import { request } from "~/shared/libs";

export const useAuth = () => {
  const WebApp = useWebApp();
  console.log("👀👀👀 webapp: ", WebApp);

  return useMutation(["auth"], async () => {
    console.log("👀👀👀 in mutation - auth");

    const authV1Token = sessionStorage.getItem("auth_v1_token");

    let tonProof;
    if (authV1Token) {
      tonProof = await WebApp.initDataUnsafe.signData({
        data: authV1Token,
      });
      console.log("👀👀👀 tonProof: ", tonProof);
    }

    return request.post<{
      connected_wallet: null | {
        version: string;
        address: string;
        ton_balance: string;
      };

      auth_v1_token: string;
    }>("/auth.twa", {
      twa_data: WebApp.initData,
      ton_proof: tonProof ? {
        account: {
          address: tonProof.address, 
          // O.: add more as needed
        },
        ton_proof: {
          signature: tonProof.signature,
          payload: tonProof.payload,
          // O.: add more as needed
        }
      } : undefined
    });
  });
};
