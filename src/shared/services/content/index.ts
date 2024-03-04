import { useMutation } from "react-query";

import { request } from "~/shared/libs";
import { Royalty } from "~/shared/stores/root";

type UseCreateNewContentPayload = {
  title: string;
  content: string;
  image: string;
  description: string;
  price: string;
  resaleLicensePrice: string; // nanoTON bignum (default = 0)
  allowResale: boolean;
  authors: string[];
  royaltyParams: Royalty[];
};

export const useCreateNewContent = () => {
  return useMutation(
    ["create-new-content"],
    (payload: UseCreateNewContentPayload) => {
      return request.post<{
        message: string;
      }>("/blockchain.sendNewContentMessage", payload);
    },
  );
};

export const usePurchaseContent = () => {
  return useMutation(
    ["purchase-content"],
    (payload: { content_address: string; price: string }) => {
      return request.post<{
        message: string;
      }>("/blockchain.sendPurchaseContentMessage", payload);
    },
  );
};
