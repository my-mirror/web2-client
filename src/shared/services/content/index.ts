import { useMutation, useQuery } from "react-query";

import { request } from "~/shared/libs";
import { Royalty } from "~/shared/stores/root";

type UseCreateNewContentPayload = {
  title: string;
  content: string;
  image: string;
  description: string;
  hashtags: string[];
  price: string;
  resaleLicensePrice: string; // nanoTON bignum (default = 0)
  allowResale: boolean;
  authors: string[];
  royaltyParams: Royalty[];
  downloadable: boolean;
};

export const useCreateNewContent = () => {
  return useMutation(
      ["create-new-content"],
      (payload: UseCreateNewContentPayload) => {
        return request.post<{
          address: string;
          amount: string;
          payload: string;
        }>("/blockchain.sendNewContentMessage", payload, {
            headers: {
                Authorization: localStorage.getItem('auth_v1_token') ?? ""
            }
        });
      },
  );
};

// export const usePurchaseContent = () => {
//   return useMutation(
//     ["purchase-content"],
//     (payload: { content_address: string; price: string }) => {
//       return request.post<{
//         message: string;
//       }>("/blockchain.sendPurchaseContentMessage", payload);
//     },
//   );
// };

export const useViewContent = (contentId: string) => {
  return useQuery(["view", "content", contentId], () => {
    return request.get(`/content.view/${contentId}`, {
        headers: {
            Authorization: localStorage.getItem('auth_v1_token') ?? ""
        }
    });
  });
};

export const usePurchaseContent = () => {
  return useMutation(
      ["purchase", "content"],
      ({
         content_address,
         license_type,
       }: {
        content_address: string;
        license_type: "listen" | "resale";
      }) => {
        return request.post<{
          address: string;
          amount: string;
          payload: string;
        }>("/blockchain.sendPurchaseContentMessage", {
          content_address,
          license_type,
        }, {
            headers: {
                Authorization: localStorage.getItem('auth_v1_token') ?? ""
            }
        });
      },
  );
};
