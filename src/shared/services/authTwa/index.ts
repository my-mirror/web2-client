import { useMutation } from "react-query";
import { request } from "~/shared/libs";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

const sessionStorageKey = "auth_v1_token";

export const useAuthTwa = () => {
  const WebApp = useWebApp();

  const makeAuthRequest = async () => {
    const res = await request.post<{
      auth_v1_token: string;
    }>("/auth.twa", {
      twa_data: WebApp.initData,
    });

    if (res?.data?.auth_v1_token) {
      localStorage.setItem(sessionStorageKey, res.data.auth_v1_token);
    } else {
      throw new Error("Failed to get auth token");
    }
    return res;
  };

  return useMutation(["auth"], makeAuthRequest);
};