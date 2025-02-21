import ReactPlayer from "react-player/lazy";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";

import { Button } from "~/shared/ui/button";
import { usePurchaseContent, useViewContent } from "~/shared/services/content";
import { fromNanoTON } from "~/shared/utils";
import {useCallback, useEffect, useMemo, useState} from "react";
import { AudioPlayer } from "~/shared/ui/audio-player";
import {useAuth} from "~/shared/services/auth";
import { CongratsModal } from "./components/congrats-modal";
import { ErrorModal } from "./components/error-modal";

export const ViewContentPage = () => {
  const WebApp = useWebApp();

  const { data: content, refetch: refetchContent } = useViewContent(WebApp.initDataUnsafe?.start_param);

  const { mutateAsync: purchaseContent } = usePurchaseContent();

  const [tonConnectUI] = useTonConnectUI();

  const auth = useAuth();

  const [isCongratsModal, setIsCongratsModal] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);
  const handleBuyContent = useCallback(async () => {
    try {
      if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        await auth.mutateAsync();
        return
      } else {
        await auth.mutateAsync()
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
        void refetchContent()
        setIsCongratsModal(true);
        console.log(transactionResponse.boc, "PURCHASED")
      } else {
        setIsErrorModal(true);
        console.error("Transaction failed:", transactionResponse);
      }
    } catch (error) {
      setIsErrorModal(true);
      console.error("Error handling Ton Connect subscription:", error);
    }
  }, [content, tonConnectUI.connected]);

  const haveLicense = useMemo(() => {
    return content?.data?.have_licenses?.includes("listen") || content?.data?.have_licenses?.includes("resale")
  }, [content])

  useEffect(() => {
    const interval = setInterval(() => {
      void refetchContent()
    }, 5000)

    return () => clearInterval(interval)
  }, []);

  const handleConfirmCongrats = () => {
    setIsCongratsModal(!isCongratsModal);
  };

  const handleErrorModal = () => {
    setIsErrorModal(!isErrorModal);
  }
  return (
      <main className={"min-h-screen flex w-full flex-col gap-[50px] px-4 "}>
        {isCongratsModal && <CongratsModal
                  onConfirm={handleConfirmCongrats}/>}
        {isErrorModal && <ErrorModal
        onConfirm={handleErrorModal}/>}
        {content?.data?.content_type.startsWith("audio") && content?.data?.display_options?.metadata?.image && (
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
                config={{ file: { attributes: {
                  playsInline: true, autoplay: true,
                  poster: content?.data?.display_options?.metadata?.image || undefined,
                } }, }}
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

        <div className="mt-auto pb-2">
        {!haveLicense && <Button
              onClick={handleBuyContent}
              className={"mb-4 h-[48px]"}
              label={`Купить за ${fromNanoTON(content?.data?.encrypted?.license?.resale?.price)} ТОН`}
              includeArrows={true}
          />
          }

          {tonConnectUI.connected && (
            <>
              <Button
                onClick={() => {
                  WebApp.openTelegramLink(`https://t.me/MY_UploaderRobot`);
                }}
                className={"h-[48px] bg-darkred"}
                label={`Загрузить свой контент`}
              />
              <Button
                  onClick={() => {
                    tonConnectUI.disconnect();
                  }}
                  className={"h-[48px] bg-darkred mt-4"}
                  label={`Отключить кошелек`}
              />
            </>
          )}
       </div>
      </main>
  );
};
