import { useRef } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useMutation } from "react-query";
import { request } from "~/shared/libs";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

const localStorageKey = "auth_v1_token";
const payloadTTLMS = 1000 * 60 * 20;

export const useAuth = () => {
  const WebApp = useWebApp();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const interval = useRef<ReturnType<typeof setInterval> | undefined>();

  return useMutation(["auth"], async () => {
    clearInterval(interval.current);

    // Проверяем токен в localStorage
    const storedToken = localStorage.getItem(localStorageKey);

    // Если нет кошелька, удаляем токен и запрашиваем новый
    if (!wallet) {
      localStorage.removeItem(localStorageKey);

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
          // Сохраняем токен в localStorage
          localStorage.setItem(localStorageKey, value.data.auth_v1_token);
          tonConnectUI.setConnectRequestParameters({
            state: "ready",
            value: {
              tonProof: value?.data?.auth_v1_token,
            },
          });
        }
      };

      // Обновляем токен каждые 20 минут
      void refreshPayload();
      interval.current = setInterval(refreshPayload, payloadTTLMS);

      return;
    }

    // Если токен уже сохранён в localStorage, пропускаем повторную авторизацию
    if (storedToken) {
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: {
          tonProof: storedToken,
        },
      });
      return;
    }

    // Логика для случая, когда есть кошелек и требуется тонProof
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
              // Сохраняем токен в localStorage
              localStorage.setItem(localStorageKey, res?.data?.auth_v1_token);
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