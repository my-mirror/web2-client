import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactPlayer from "react-player/lazy";

import { FormLabel } from "~/shared/ui/form-label";
import { Input } from "~/shared/ui/input";
import { FileButton } from "~/shared/ui/file-button";
import { Button } from "~/shared/ui/button";
import { CoverButton } from "~/pages/root/steps/data-step/components/cover-button";
import { HiddenFileInput } from "~/shared/ui/hidden-file-input";
import { useRootStore } from "~/shared/stores/root";
import { Checkbox } from "~/shared/ui/checkbox";
import { AudioPlayer } from "~/shared/ui/audio-player";
import { HashtagInput } from "~/shared/ui/hashtag-input";
import { Replace } from "~/shared/ui/icons/replace";
import { DisclaimerModal } from "./components/disclaimer-modal";

type DataStepProps = {
  nextStep(): void;
};

export const DataStep = ({ nextStep }: DataStepProps) => {
  const rootStore = useRootStore();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);


  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, "Обязательное поле"),
      author: z.string().optional(),
    });
  }, []);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",

    defaultValues: {
      name: rootStore.name,
      author: rootStore?.author,
    },
  });

  const handleSubmit = () => {
    form.handleSubmit(async (values: FormValues) => {
      try {
        rootStore.setName(values.name);

        if (values.author) {
          rootStore.setAuthor(values.author);
        }

        nextStep();
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  };

  const handleFileReset = () => {
    rootStore.setFile(null);
    rootStore.setFileSrc('');
    rootStore.setFileType('');
  }


  useEffect(() => {
    const storedValue = localStorage.getItem('disclaimerAccepted');
    if (storedValue === 'true') {
      setDisclaimerAccepted(true);
    }
  }, []);
  
  const handleConfirmDisclaimer = () => {
    setDisclaimerAccepted(true);
    localStorage.setItem('disclaimerAccepted', 'true');
  };

  return (
    <section className={"mt-4 px-4 pb-8"}>

      {(rootStore.fileSrc && !disclaimerAccepted) &&
       (<DisclaimerModal
          onConfirm={() => {
            handleConfirmDisclaimer()}}
          />)}

      <div className={"mb-[30px] flex flex-col text-sm"}>
        <span className={"ml-4"}>/Заполните информацию о контенте</span>
        <div>
          1/<span className={"text-[#7B7B7B]"}>5</span>
        </div>
      </div>

      <div className={"flex flex-col gap-[20px]"}>
        <FormLabel label={"Название"}>
          <Input
            placeholder={"[ Введите название ]"}
            error={form.formState.errors?.name}
            {...form.register("name")}
          />
        </FormLabel>

        <FormLabel label={"Имя автора/исполнителя"}>
          <Input
            placeholder={"[ введите имя автора/исполнителя ]"}
            error={form.formState.errors?.author}
            {...form.register("author")}
          />
        </FormLabel>

        <FormLabel label={"Хэштеги"}>
          <HashtagInput />
        </FormLabel>

        <FormLabel label={"Файл"}>
          {!rootStore.fileSrc && <>
            <HiddenFileInput
              id={"file"}
              shouldProcess={false}
              accept={"video/mp4,video/x-m4v,video/*,audio/mp3,audio/*"}
              onChange={(file) => {
                rootStore.setFile(file);
                rootStore.setFileSrc(URL.createObjectURL(file));
                rootStore.setFileType(file.type); // Save the file type for conditional rendering
              }}
            />

            <FileButton htmlFor={"file"} />
          </>}

          {rootStore.fileSrc && (
            <div
              className={
                "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm"
              }
            >
              {rootStore.fileType?.startsWith("audio") ? (
                <AudioPlayer src={rootStore.fileSrc} />
              ) : (
                <ReactPlayer
                  playsinline={true}
                  controls={true}
                  width="100%"
                  config={{ file: { attributes: { playsInline: true } } }}
                  url={rootStore.fileSrc}
                />
              )}
              <button
                onClick={handleFileReset}
                className={
                  "flex w-full items-center justify-between gap-1 border border-white px-[10px] py-[8px]"
                }
              >
                <div />
                <div className={"flex gap-2 text-sm"}>Изменить выбор</div>
                <Replace />
              </button>
            </div>
          )}
        </FormLabel>

        <div className={"flex flex-col gap-2"}>
        <FormLabel
            label={"Разрешить скачивание"}
            labelClassName={"flex"}
            formLabelAddon={
              <Checkbox
                onClick={() => rootStore.setAllowDwnld(!rootStore.allowDwnld)}
                checked={rootStore.allowDwnld}
              />
            }
          />
          <FormLabel
            label={"Разрешить обложку"}
            labelClassName={"flex"}
            formLabelAddon={
              <Checkbox
                onClick={() => rootStore.setAllowCover(!rootStore.allowCover)}
                checked={rootStore.allowCover}
              />
            }
          />

          {rootStore.allowCover && (
            <FormLabel label={"Обложка"}>


              {rootStore.cover ? (
                <CoverButton
                  src={URL.createObjectURL(rootStore.cover)}
                  onClick={() => {
                    rootStore.setCover(null);
                  }}
                />
              ) : (
                <>
                  <HiddenFileInput
                    id={"cover"}
                    accept={"image/*"}
                    onChange={(cover) => {
                      rootStore.setCover(cover);
                    }}
                  />
                  <FileButton htmlFor={"cover"} />
                </>
              )}
            </FormLabel>
          )}
        </div>
      </div>

      <Button
        className={"mt-[30px]"}
        onClick={handleSubmit}
        includeArrows={true}
        label={"Готово"}
        disabled={
          !form.formState.isValid ||
          !rootStore.file ||
          (rootStore.allowCover && !rootStore.cover)
        }
      />
    </section>
  );
};
