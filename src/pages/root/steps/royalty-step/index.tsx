import { useEffect, useMemo, useState } from "react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { Address } from '@ton/core';

import { Input } from "~/shared/ui/input";
import { FormLabel } from "~/shared/ui/form-label";
import { XMark } from "~/shared/ui/icons/x-mark.tsx";
import { Button } from "~/shared/ui/button";
import { PercentHint } from "~/pages/root/steps/royalty-step/components/percent-hint";
import { cn } from "~/shared/utils";
import { Spread } from "~/shared/ui/icons/spread.tsx";
import { ConfirmModal } from "~/pages/root/steps/royalty-step/components/confirm-modal";
import { useRootStore } from "~/shared/stores/root";
import { BackButton } from "~/shared/ui/back-button";
import { useTonConnectUI } from "@tonconnect/ui-react";

type RoyaltyStepProps = {
  prevStep(): void;
  nextStep(): void;
};

export const RoyaltyStep = ({ nextStep, prevStep }: RoyaltyStepProps) => {
  const [impactOccurred] = useHapticFeedback();

  const [isDeleteAllOpen, setDeleteAllOpen] = useState(false);
  const [isSpreadOpen, setSpreadOpen] = useState(false);

  const { royalty, setRoyalty, isPercentHintOpen, setPercentHintOpen } =
    useRootStore();

  const handleAdd = () => {
    impactOccurred("light");
    setRoyalty([...royalty, { address: "", value: 0 }]);
  };

  const handleRemove = (index: number) => {
    if (royalty.length === 1) return;

    impactOccurred("light");

    const newRoyalty = royalty.filter((_, i) => i !== index);
    setRoyalty(newRoyalty);
  };

  const handleWalletChange = (index: number, address: string) => {
    const newRoyalty = royalty.map((member, i) =>
      i === index ? { ...member, address } : member,
    );
    setRoyalty(newRoyalty);
  };

  const handlePercentChange = (index: number, value: string) => {
    const percentNumber = parseInt(value, 10) || 0;
    const newRoyalty = royalty.map((royalty, i) =>
      i === index ? { ...royalty, value: percentNumber } : royalty,
    );
    setRoyalty(newRoyalty);
  };

  const spreadPercentageEqually = () => {
    const equalPercent = 100 / royalty.length;
    const updatedRoyalty = royalty.map((member) => ({
      ...member,
      value: equalPercent,
    }));
    setRoyalty(updatedRoyalty);
  };

  const isValid = useMemo(() => {
    return (
      royalty.every((member) => member.address && member.value >= 0) &&
      royalty.reduce((acc, curr) => acc + curr.value, 0) === 100
    );
  }, [royalty]);

  const [tonConnectUI] = useTonConnectUI();

  // Устанавливаем адрес из tonConnectUI.account при загрузке страницы
  useEffect(() => {
    console.log('tonconnectUI', tonConnectUI)
    if (tonConnectUI.account) {
      setRoyalty([{ address: tonConnectUI.account.address
      }), value: 100 }]);
    }
  }, [tonConnectUI.account, setRoyalty]);

  return (
    <section className={"mt-4 px-4 pb-8"}>
      {isPercentHintOpen && (
        <PercentHint close={() => setPercentHintOpen(false)} />
      )}

      {isDeleteAllOpen && (
        <ConfirmModal
          text={"Удалить всю информацию об авторах?"}
          confirmLabel={"Удалить"}
          onConfirm={() => {
            setRoyalty([{ address: "", value: 100 }]);
            setDeleteAllOpen(false);
          }}
          onCancel={() => {
            setDeleteAllOpen(false);
          }}
        />
      )}

      {isSpreadOpen && (
        <ConfirmModal
          text={"Распределить роялти на всех авторов равномерно?"}
          confirmLabel={"Распределить"}
          onConfirm={() => {
            spreadPercentageEqually();
            setSpreadOpen(false);
          }}
          onCancel={() => {
            setSpreadOpen(false);
          }}
        />
      )}

      <BackButton onClick={prevStep} />

      <div className={"mb-[30px] flex flex-col text-sm"}>
        <span className={"ml-4"}>/Заполните информацию об роялти</span>
        <div>
          3/<span className={"text-[#7B7B7B]"}>5</span>
        </div>
      </div>

      <section className={"flex flex-col gap-1.5"}>
        {royalty.map((member, index) => (
          <div key={index} className={"flex flex-col gap-[20px]"}>
            <div className={"flex w-full items-center gap-1"}>
              <div className={"w-[83%]"}>
                <FormLabel
                  labelClassName={"flex"}
                  formLabelAddon={
                    index > 0 && (
                      <button onClick={() => handleRemove(index)}>
                        <XMark />
                      </button>
                    )
                  }
                  label={`Роялти_${index + 1}`}
                >
                  <Input
                    value={member.address}
                    onChange={(e) => handleWalletChange(index, e.target.value)}
                    placeholder={"[ Введите адрес криптокошелька TON ]"}
                  />
                </FormLabel>
              </div>

              <div className={"w-[18%]"}>
                <FormLabel labelClassName={"text-center"} label={"%"}>
                  <Input
                    value={member.value.toString()}
                    onChange={(e) => handlePercentChange(index, e.target.value)}
                    placeholder={"[ % ]"}
                    className={cn({
                      "pointer-events-none z-50 border-primary":
                        isPercentHintOpen,
                    })}
                  />
                </FormLabel>
              </div>
            </div>
          </div>
        ))}
      </section>

      <button
        onClick={handleAdd}
        className={
          "mt-[30px] flex w-full items-center justify-center border border-white py-[8px] text-sm"
        }
      >
        Добавить_роялти
      </button>

      {royalty.length > 1 && (
        <div className={"mt-[30px] flex items-center gap-2"}>
          <button
            onClick={() => {
              impactOccurred("light");
              setDeleteAllOpen(true);
            }}
            className={
              "flex w-full items-center justify-center gap-3 border border-white py-[8px] text-sm"
            }
          >
            Удалить все
            <XMark />
          </button>

          <button
            onClick={() => {
              impactOccurred("light");
              setSpreadOpen(true);
            }}
            className={
              "flex w-full items-center justify-center gap-3 border border-white py-[8px] text-sm"
            }
          >
            Распределить <Spread />
          </button>
        </div>
      )}

      <Button
        label={"Готово"}
        className={"mt-[30px]"}
        includeArrows={true}
        onClick={nextStep}
        disabled={!isValid}
      />
    </section>
  );
};
