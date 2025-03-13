import {
  useHapticFeedback,
  useWebApp,
} from "@vkruglikov/react-telegram-web-app";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";

import { Button } from "~/shared/ui/button";
import { useRootStore } from "~/shared/stores/root";
import { FormLabel } from "~/shared/ui/form-label";
import { useUploadFile } from "~/shared/services/file";
import { Progress } from "~/shared/ui/progress";
import { useCreateNewContent } from "~/shared/services/content";
import { BackButton } from "~/shared/ui/back-button";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { ErrorUploadModal } from "./components/error-upload-modal";



type PresubmitStepProps = {
  prevStep(): void;
};

export const PresubmitStep = ({ prevStep }: PresubmitStepProps) => {
  const WebApp = useWebApp();

  const [tonConnectUI] = useTonConnectUI();

  const rootStore = useRootStore();
  const [impactOccurred] = useHapticFeedback();

  const [isCoverExpanded, setCoverExpanded] = useState(false);

  const uploadCover = useUploadFile();
  const uploadFile = useUploadFile();

  const createContent = useCreateNewContent();

  const [isErrorUploadModal, setIsErrorUploadModal] = useState(false);

  const handleErrorUploadModal = () => {
    setIsErrorUploadModal(false);
    uploadFile.resetUploadError();
    uploadCover.resetUploadError();
  };

  useEffect(() => {
    if (uploadFile.uploadError || uploadCover.uploadError) {
      setIsErrorUploadModal(true);
    }
  }, [uploadFile.uploadError, uploadCover.uploadError]);

  const handleSubmit = async () => {
    try {
      let coverUploadResult = { content_id_v1: "" };

      const fileUploadResult = await uploadFile.mutateAsync(
          rootStore.file as File,
      );

      if (rootStore.allowCover && rootStore.cover) {
        coverUploadResult = await uploadCover.mutateAsync(
            rootStore.cover as File,
        );
      }

      const createContentResponse = await createContent.mutateAsync({
        title: rootStore.name,

        // Это для одного автора
        ...(rootStore.author
            ? { authors: [rootStore.author] }
            : { authors: [] }),

        // Откомментировать при условии того что вы принимаете много авторов
        // следует отметить что вы должны еще откомментровать AuthorsStep в RootPage
        // authors: rootStore.authors,

        content: fileUploadResult.content_id_v1,
        image: coverUploadResult.content_id_v1,
        price: String(rootStore.price * 10 ** 9),
        hashtags: rootStore.hashtags,
        royaltyParams: rootStore.royalty.map((member) => ({
          ...member,
          value: member.value * 100,
        })),
        description: "",

        // Если откомментировать поле resaleLicensePrice в price-step то
        // это отработает как надо
        ...(rootStore.allowResale
            ? {
              allowResale: true,
              resaleLicensePrice: String(
                  rootStore.licenseResalePrice * 10 ** 9,
              ),
            }
            : { allowResale: false, resaleLicensePrice: "0" }),
      });

      if (createContentResponse.data) {
        if (createContentResponse.data.address != "free") {
          const transactionResponse = await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 120,
            messages: [
              {
                amount: createContentResponse.data.amount,
                address: createContentResponse.data.address,
                payload: createContentResponse.data.payload,
              },
            ],
          });
          if (transactionResponse.boc) {
            WebApp.close();
          } else {
            console.error("Transaction failed:", transactionResponse);
          }
        }
      }

      WebApp.close();
      // @ts-expect-error Type issues
    } catch (error: never) {


      console.error("An error occurred during the submission process:", error);

      if (error?.status === 400) {
        alert(
            "Введенные данные неверные, проверьте правильность введенных данных.",
        );
      }
    }
  };

  return (
      <section className={"mt-4 px-4 pb-8"}>
        {isErrorUploadModal && (
          <ErrorUploadModal
          onConfirm={() => {
            handleErrorUploadModal()}}
          />)}
        <BackButton onClick={prevStep} />

        <div className={"mb-[30px] flex flex-col text-sm"}>
          <span className={"ml-4"}>/Подтвердите правильность данных</span>
          <div>
            5/<span className={"text-[#7B7B7B]"}>5</span>
          </div>
        </div>

        <section className={"flex flex-col gap-2"}>
          <FormLabel label={"Название"}>
            <div
                className={
                  "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                }
            >
              {rootStore.name}
            </div>
          </FormLabel>

          {rootStore.author && (
              <FormLabel label={"Имя автора/исполнителя"}>
                <div
                    className={
                      "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                    }
                >
                  {rootStore.author}
                </div>
              </FormLabel>
          )}

          {rootStore.author && (
              <FormLabel label={"Теги"}>
                <div
                className="flex flex-wrap gap-1">
                {rootStore.hashtags.map((tag, index) => (
                  <div
                  key={index}
                  className={
                    "bg-[#363636] text-white text-sm inline-flex items-center px-2 py-1 rounded mr-1"
                  }
              >
                {tag}
              </div>
                ))}
                </div>
              </FormLabel>
          )}

          <FormLabel label={"Цена"}>
            <div
                className={
                  "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                }
            >
              {rootStore.price} TON
            </div>
          </FormLabel>

          {rootStore.allowResale && (
              <FormLabel label={"Цена копии"}>
                <div
                    className={
                      "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                    }
                >
                  {rootStore.licenseResalePrice} TON
                </div>
              </FormLabel>
          )}

          <FormLabel label={"Файл"}>
            {rootStore.fileSrc && !uploadFile.isUploading && (
                <div
                    className={
                      "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm"
                    }
                >
                  <ReactPlayer
                      playsinline={true}
                      controls={true}
                      width="100%"
                      config={{ file: { attributes: { playsInline: true } } }}
                      url={rootStore.fileSrc}
                  />
                </div>
            )}

            {uploadFile.isUploading && uploadFile.isLoading && (
                <Progress value={uploadFile.uploadProgress} />
            )}
          </FormLabel>

          {rootStore.allowCover && (
              <FormLabel label={"Обложка"}>
                <div
                    className={
                      "flex w-full items-center border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                    }
                >
                  <div
                      style={{
                        height: isCoverExpanded ? "261px" : "68px",
                      }}
                      className={"bg-bg w-full"}
                  >
                    {rootStore.cover && !uploadCover.isUploading && (
                        <img
                            src={URL.createObjectURL(rootStore.cover)}
                            alt={"cover"}
                            className={"h-full w-full object-cover object-center"}
                        />
                    )}

                    {uploadCover.isUploading && uploadCover.isLoading && (
                        <Progress value={uploadCover.uploadProgress} />
                    )}
                  </div>

                  <button
                      onClick={() => {
                        impactOccurred("light");
                        setCoverExpanded((p) => !p);
                      }}
                      style={{
                        height: isCoverExpanded ? "261px" : "68px",
                      }}
                      className={"flex w-[45px] items-center justify-center"}
                  >
                    {!isCoverExpanded && (
                        <svg
                            width="45"
                            height="14"
                            viewBox="0 0 45 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M31.2963 5.18519H29.2222V3.11111H28.1852V5.18519H26.1111V6.22222H28.1852V8.2963H29.2222V6.22222H31.2963V5.18519Z"
                              fill="white"
                          />
                          <path
                              d="M33.0841 9.33333C33.9396 8.31744 34.4083 7.0318 34.4074 5.7037C34.4074 4.57562 34.0729 3.47287 33.4462 2.5349C32.8194 1.59693 31.9286 0.865871 30.8864 0.434171C29.8442 0.00247134 28.6974 -0.110481 27.591 0.109598C26.4846 0.329676 25.4683 0.872901 24.6706 1.67058C23.8729 2.46826 23.3297 3.48456 23.1096 4.59097C22.8895 5.69738 23.0025 6.8442 23.4342 7.88642C23.8659 8.92863 24.5969 9.81943 25.5349 10.4462C26.4729 11.0729 27.5756 11.4074 28.7037 11.4074C30.0318 11.4083 31.3174 10.9396 32.3333 10.0841L36.2668 14L37 13.2668L33.0841 9.33333ZM28.7037 10.3704C27.7807 10.3704 26.8785 10.0967 26.111 9.5839C25.3436 9.07112 24.7455 8.34228 24.3923 7.48956C24.0391 6.63684 23.9466 5.69853 24.1267 4.79328C24.3068 3.88804 24.7512 3.05652 25.4039 2.40387C26.0565 1.75123 26.888 1.30677 27.7933 1.12671C28.6985 0.946644 29.6368 1.03906 30.4896 1.39227C31.3423 1.74548 32.0711 2.34362 32.5839 3.11104C33.0967 3.87847 33.3704 4.78073 33.3704 5.7037C33.369 6.94096 32.8769 8.12715 32.002 9.00202C31.1271 9.87689 29.941 10.369 28.7037 10.3704Z"
                              fill="white"
                          />
                        </svg>
                    )}

                    {isCoverExpanded && (
                        <svg
                            width="45"
                            height="15"
                            viewBox="0 0 45 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M31.2963 5.68519H26.1111V6.72222L31.2963 6.72222L31.2963 5.68519Z"
                              fill="white"
                          />
                          <path
                              d="M33.0841 9.83333C33.9396 8.81744 34.4083 7.5318 34.4074 6.20371C34.4074 5.07562 34.0729 3.97287 33.4462 3.0349C32.8194 2.09693 31.9286 1.36587 30.8864 0.934171C29.8442 0.502471 28.6974 0.389519 27.591 0.609598C26.4846 0.829676 25.4683 1.3729 24.6706 2.17058C23.8729 2.96826 23.3297 3.98456 23.1096 5.09097C22.8895 6.19738 23.0025 7.3442 23.4342 8.38642C23.8659 9.42863 24.5969 10.3194 25.5349 10.9462C26.4729 11.5729 27.5756 11.9074 28.7037 11.9074C30.0318 11.9083 31.3174 11.4396 32.3333 10.5841L36.2668 14.5L37 13.7668L33.0841 9.83333ZM28.7037 10.8704C27.7807 10.8704 26.8785 10.5967 26.111 10.0839C25.3436 9.57112 24.7455 8.84228 24.3923 7.98956C24.0391 7.13684 23.9466 6.19853 24.1267 5.29328C24.3068 4.38804 24.7512 3.55652 25.4039 2.90387C26.0565 2.25123 26.888 1.80677 27.7933 1.62671C28.6985 1.44664 29.6368 1.53906 30.4896 1.89227C31.3423 2.24548 32.0711 2.84362 32.5839 3.61104C33.0967 4.37847 33.3704 5.28073 33.3704 6.20371C33.369 7.44096 32.8769 8.62715 32.002 9.50202C31.1271 10.3769 29.941 10.869 28.7037 10.8704Z"
                              fill="white"
                          />
                        </svg>
                    )}
                  </button>
                </div>
              </FormLabel>
          )}

          {rootStore.royalty.map((royalty, index) => (
              <div key={index} className={"flex flex-col gap-[20px]"}>
                <div className={"flex w-full items-center gap-1"}>
                  <div className={"w-[83%]"}>
                    <FormLabel
                        labelClassName={"flex"}
                        label={`Роялти_${index + 1}`}
                    >
                      <div
                          className={
                            "break-all border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"
                          }
                      >
                        {royalty.address}
                      </div>
                    </FormLabel>
                  </div>

                  <div className={"h-auto w-[18%]"}>
                    <FormLabel labelClassName={"text-center"} label={"%"}>
                      <div
                          className={
                            "flex items-center justify-center border border-white bg-[#2B2B2B] py-[8px] text-sm font-bold"
                          }
                      >
                        {royalty.value.toString()}
                      </div>
                    </FormLabel>
                  </div>
                </div>
              </div>
          ))}

          {/*{rootStore.authors.map((author, index) => (*/}
          {/*  <FormLabel key={index} label={`Автор_${index + 1}`}>*/}
          {/*    <div*/}
          {/*      className={*/}
          {/*        "break-all border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm font-bold"*/}
          {/*      }*/}
          {/*    >*/}
          {/*      {author}*/}
          {/*    </div>*/}
          {/*  </FormLabel>*/}
          {/*))}*/}
        </section>

        <Button
            isLoading={
                uploadFile.isLoading ||
                uploadCover.isLoading ||
                createContent.isLoading
            }
            onClick={handleSubmit}
            label={"Все верно!"}
            className={"mt-[30px] py-[16px]"}
            includeArrows={true}
        />
      </section>
  );
};
