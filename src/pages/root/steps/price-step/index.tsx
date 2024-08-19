import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo } from "react";

import { FormLabel } from "~/shared/ui/form-label";
import { Input } from "~/shared/ui/input";
import { Button } from "~/shared/ui/button";
import { useRootStore } from "~/shared/stores/root";
import { BackButton } from "~/shared/ui/back-button";

const MIN_PRICE = 0.07;
const MIN_RESALE_PRICE = 0.07;

const RECOMMENDED_PRICE = 0.15;
// const RECOMMENDED_RESALE_PRICE = 0.15;

type PriceStepProps = {
  prevStep(): void;
  nextStep(): void;
};

export const PriceStep = ({ nextStep, prevStep }: PriceStepProps) => {
  const rootStore = useRootStore();

  const formSchema = useMemo(() => {
    if (rootStore.allowResale) {
      return z.object({
        price: z.preprocess(
          (value) => {
            const parsed = parseFloat(value as string);

            return isNaN(parsed) ? undefined : parsed;
          },
          z
            .number()
            .min(MIN_PRICE, `Цена должна быть минимум ${MIN_PRICE} TON.`),
        ),

        resaleLicensePrice: z
          .preprocess(
            (value) => {
              if (value === undefined || value === "" || value === 0)
                return undefined;

              const parsed = parseFloat(value as string);
              return isNaN(parsed) ? undefined : parsed;
            },

            z
              .number()
              .min(
                MIN_RESALE_PRICE,
                `Цена копии должна быть минимум ${MIN_RESALE_PRICE} TON.`,
              ),
          )
          .optional(),
      });
    }

    return z.object({
      price: z.preprocess(
        (value) => {
          const parsed = parseFloat(value as string);

          return isNaN(parsed) ? undefined : parsed;
        },
        z.number().min(MIN_PRICE, `Цена должна быть минимум ${MIN_PRICE} TON.`),
      ),
    });
  }, [rootStore.allowResale]);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",

    defaultValues: {
      price: rootStore.price,

      //@ts-expect-error Fix typings
      resaleLicensePrice: rootStore?.licenseResalePrice,
    },
  });

  useEffect(() => {
    void form.trigger();
  }, [rootStore.allowResale, form]);

  const handleSubmit = () => {
    form.handleSubmit(async (values: FormValues) => {
      try {
        rootStore.setPrice(values.price);

        //@ts-expect-error Fix typings
        if (values?.resaleLicensePrice) {
          //@ts-expect-error Fix typings
          rootStore.setLicenseResalePrice(values?.resaleLicensePrice);
        }

        nextStep();
      } catch (error) {
        console.error("Error: ", error);
      }
    })();
  };

  return (
    <section className={"mt-4 px-4 pb-8"}>
      <BackButton onClick={prevStep} />

      <div className={"mb-[30px] flex flex-col text-sm"}>
        <span className={"ml-4"}>/Укажите цену</span>
        <div>
          4/<span className={"text-[#7B7B7B]"}>5</span>
        </div>
      </div>

      <div className={"flex flex-col gap-[20px]"}>
        <FormLabel label={"Цена продажи TON"}>
          <div className={"my-2 flex flex-col gap-1.5"}>
            <p className={"text-xs"}>Минимальная стоимость {MIN_PRICE} TON.</p>
            <p className={"text-xs"}>
              Рекомендуемая стоимость {RECOMMENDED_PRICE} TON.
            </p>
          </div>

          <Input
            error={form.formState.errors?.price}
            placeholder={"[ Введите цену ]"}
            {...form.register("price")}
          />
        </FormLabel>

        {/*<div className={"flex flex-col gap-2"}>*/}
        {/*  <FormLabel*/}
        {/*    labelClassName={"flex"}*/}
        {/*    label={"Разрешить копии"}*/}
        {/*    formLabelAddon={*/}
        {/*      <Checkbox*/}
        {/*        checked={rootStore.allowResale}*/}
        {/*        onClick={() => {*/}
        {/*          rootStore.setAllowResale(!rootStore.allowResale);*/}
        {/*        }}*/}
        {/*      />*/}
        {/*    }*/}
        {/*  />*/}

        {/*  {rootStore.allowResale && (*/}
        {/*    <FormLabel label={"Цена копии TON"}>*/}
        {/*      <div className={"my-2 flex flex-col gap-1.5"}>*/}
        {/*        <p className={"text-xs"}>*/}
        {/*          Это цена, по которой пользователи будут покупать и*/}
        {/*          перепродавать ваш контент.*/}
        {/*        </p>*/}

        {/*        <p className={"text-xs"}>*/}
        {/*          Минимальная стоимость {MIN_RESALE_PRICE} TON.*/}
        {/*        </p>*/}
        {/*        <p className={"text-xs"}>*/}
        {/*          Рекомендуемая стоимость {RECOMMENDED_RESALE_PRICE} TON.*/}
        {/*        </p>*/}
        {/*      </div>*/}

        {/*      <Input*/}
        {/*        //@ts-expect-error Fix typings*/}
        {/*        error={form.formState.errors?.resaleLicensePrice}*/}
        {/*        placeholder={"[ Введите цену копии ]"}*/}
        {/*        //@ts-expect-error Fix typings*/}
        {/*        {...form.register("resaleLicensePrice")}*/}
        {/*      />*/}
        {/*    </FormLabel>*/}
        {/*  )}*/}
        {/*</div>*/}
      </div>

      <Button
        className={"mt-[30px]"}
        onClick={handleSubmit}
        includeArrows={true}
        label={"Далее"}
        disabled={!form.formState.isValid}
      />
    </section>
  );
};
