import ReactPlayer from "react-player/lazy";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

import { Button } from "~/shared/ui/button";
import { usePurchaseContent, useViewContent } from "~/shared/services/content";
import { fromNanoTON } from "~/shared/utils";
import { useCallback } from "react";
import { AudioPlayer } from "~/shared/ui/audio-player";

export const ViewContentPage = () => {
  const WebApp = useWebApp();

  const { data: content } = useViewContent(WebApp.initDataUnsafe?.start_param);

  const { mutateAsync: purchaseContent } = usePurchaseContent();

  const [tonConnectUI] = useTonConnectUI();

  const handleBuyContent = useCallback(async () => {
    try {
      if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
      }

      const contentResponse = await purchaseContent({
        content_address: content?.data?.encrypted?.cid,
        license_type: "resale",
      });

      const transactionResponse = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 120,
        messages: [
          {
            amount: contentResponse.data.amount,
            address: contentResponse.data.address,
            payload: contentResponse.data.payload,
          },
        ],
      });

      if (transactionResponse.boc) {
        WebApp.close();
      } else {
        console.error("Transaction failed:", transactionResponse);
      }
    } catch (error) {
      console.error("Error handling Ton Connect subscription:", error);
    }
  }, [content]);

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

        {content?.data?.content_type.startsWith("audio") ? (
            <AudioPlayer src={content?.data?.display_options?.content_url} />
        ) : (
            <ReactPlayer
                playsinline={true}
                controls={true}
                width="100%"
                config={{ file: { attributes: { playsInline: true } } }}
                url={content?.data?.display_options?.content_url}
            />
        )}

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
            label={`Купить за ${fromNanoTON(content?.data?.encrypted?.license?.resale?.price)} ТОН`}
            includeArrows={true}
        />

        <Button
            onClick={() => {
              WebApp.openTelegramLink(`https://t.me/MY_UploaderRobot`);
            }}
            className={"mb-4 mt-[30px] h-[48px]"}
            label={`Загрузить свой контент`}
        />
      </main>
  );
};
