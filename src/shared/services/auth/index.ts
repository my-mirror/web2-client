import { useRef } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useMutation } from "react-query";
import { request } from "~/shared/libs";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

const sessionStorageKey = "auth_v1_token";
const payloadTTLMS = 1000 * 60 * 20;

export const useAuth = () => {
  const WebApp = useWebApp();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const interval = useRef<ReturnType<typeof setInterval> | undefined>();

  return useMutation(["auth"], async () => {
    clearInterval(interval.current);

    if (!wallet) {
      localStorage.removeItem(sessionStorageKey);

      const refreshPayload = async () => {
        tonConnectUI.setConnectRequestParameters({ state: "loading" });

        const value = await request
            .post<{
              auth_v1_token: string;
            }>("/auth.twa", {
              twa_data: WebApp.initData,
            })
            .catch((error: any) => {
              console.error("Error in authentication request: ", error);
              throw new Error("Failed to authenticate.");
            });
        if (!value) {
          tonConnectUI.setConnectRequestParameters(null);
        } else {
          tonConnectUI.setConnectRequestParameters({
            state: "ready",
            value: {
              tonProof: value?.data?.auth_v1_token,
            },
          });
        }
      };

      void refreshPayload();
      setInterval(refreshPayload, payloadTTLMS);

      return;
    }

    if (
        wallet.connectItems?.tonProof &&
        !("error" in wallet.connectItems.tonProof)
    ) {
      const tonProof = wallet.connectItems.tonProof.proof;

      console.log("DEBUG TON-PROOF", tonProof);

      request
          .post<{
            connected_wallet: null | {
              version: string;
              address: string;
              ton_balance: string;
            };
            auth_v1_token: string;
          }>("/auth.twa", {
            twa_data: WebApp.initData,
            ton_proof: {
              account: wallet.account,
              ton_proof: tonProof,
            },
          })
          .then((res) => {
            if (res?.data?.auth_v1_token) {
              localStorage.setItem(sessionStorageKey, res?.data?.auth_v1_token);
            } else {
              alert("Please try another wallet");
            }
          })
          .catch((error: any) => {
            console.error("Error in authentication request: ", error);
            throw new Error("Failed to authenticate.");
          });
    }
  });
};