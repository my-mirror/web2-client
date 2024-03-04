import { useMemo } from "react";
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
import { BackButton } from "~/shared/ui/back-button";

type DataStepProps = {
  prevStep(): void;
  nextStep(): void;
};

export const DataStep = ({ nextStep, prevStep }: DataStepProps) => {
  const rootStore = useRootStore();

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1),
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

  return (
    <section className={"mt-4 px-4 pb-8"}>
      <BackButton onClick={prevStep} />

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
            {...form.register("name")}
          />
        </FormLabel>

        <FormLabel label={"Имя автора/исполнителя"}>
          <Input
            placeholder={"[ введите имя автора/исполнителя ]"}
            {...form.register("author")}
          />
        </FormLabel>

        <FormLabel label={"Файл"}>
          <HiddenFileInput
            id={"file"}
            shouldProcess={false}
            accept={"video/mp4,video/x-m4v,video/*,audio/mp3,audio/*"}
            onChange={(file) => {
              rootStore.setFile(file);
              rootStore.setFileSrc(URL.createObjectURL(file));
            }}
          />

          {!rootStore.fileSrc && <FileButton htmlFor={"file"} />}

          {rootStore.fileSrc && (
            <div
              className={
                "w-full border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm"
              }
            >
              <ReactPlayer
                playsinline={true}
                controls={true}
                width={"100%"}
                url={rootStore.fileSrc}
              />
            </div>
          )}
        </FormLabel>

        <div className={"flex flex-col gap-2"}>
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
              <HiddenFileInput
                id={"cover"}
                accept={"image/*"}
                onChange={(cover) => {
                  rootStore.setCover(cover);
                }}
              />

              {rootStore.cover ? (
                <CoverButton
                  src={URL.createObjectURL(rootStore.cover)}
                  onClick={() => {
                    rootStore.setCover(null);
                  }}
                />
              ) : (
                <FileButton htmlFor={"cover"} />
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
