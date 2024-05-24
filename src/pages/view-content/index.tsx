import ReactPlayer from "react-player/lazy";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useMemo } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

import { Button } from "~/shared/ui/button";
import { usePurchaseContent, useViewContent } from "~/shared/services/content";
import { fromNanoTON } from "~/shared/utils";

export const ViewContentPage = () => {
  const WebApp = useWebApp();

  const { data: content } = useViewContent(WebApp.initDataUnsafe?.start_param);

  const { mutateAsync: purchaseContent } = usePurchaseContent();

  const [tonConnectUI] = useTonConnectUI();

  const transaction = useMemo(() => {
    const address = content?.data?.encrypted?.cid;

    return {
      validUntil: Math.floor(Date.now() / 1000) + 120,
      messages: [
        { amount: content?.data?.encrypted?.license?.listen?.price, address },
      ],
    };
  }, [content?.data]);

  const handleBuyContent = async () => {
    try {
      if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
      }

      const res = await tonConnectUI.sendTransaction(transaction);

      if (res.boc) {
        await purchaseContent({
          content_address: content?.data?.encrypted?.cid,
          license_type: "listen",
        });

        WebApp.close();

        await tonConnectUI.disconnect();
      } else {
        console.error("Transaction failed:", res);
      }
    } catch (error) {
      await tonConnectUI.disconnect();
      console.error("Error handling Ton Connect subscription:", error);
    }
  };

  return (
    <main className={"flex w-full flex-col gap-[50px] px-4"}>
      {content?.data?.display_options?.metadata?.image && (
        <div className={"mt-[30px] h-[314px] w-full"}>
          <img
            alt={"content_image"}
            className={"h-full w-full object-cover object-center"}
            src={content?.data?.display_options?.metadata?.image}
          />
        </div>
      )}

      <ReactPlayer
        playsinline={true}
        controls={true}
        width={"100%"}
        config={{}}
        url={content?.data?.display_options?.content_url}
      />

      <section className={"flex flex-col"}>
        <h1 className={"text-[20px] font-bold"}>
          {content?.data?.display_options?.metadata?.name}
        </h1>
        {/*<h2>Russian</h2>*/}
        {/*<h2>2022</h2>*/}
        <p className={"mt-2 text-[12px]"}>
          {content?.data?.display_options?.metadata?.description}
        </p>
      </section>

      <Button
        onClick={handleBuyContent}
        className={"mb-4 mt-[30px] h-[48px]"}
        label={`Купить за ${fromNanoTON(content?.data?.encrypted?.license?.listen?.price)} ТОН`}
        includeArrows={true}
      />
    </main>
  );
};
