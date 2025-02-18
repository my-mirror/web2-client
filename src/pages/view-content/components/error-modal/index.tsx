import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { Button } from "~/shared/ui/button";

type ErrorModalProps = {
  onConfirm(): void;
};

export const ErrorModal = ({
  onConfirm,
}: ErrorModalProps) => {
  const [impactOccurred] = useHapticFeedback();

  const handleClick = (fn: () => void) => {
    impactOccurred("light");
    fn();
  };

  return (
    <div
      className={
        "fixed left-0 top-0 z-30 flex h-full w-full items-center justify-center bg-black/80 px-[15px]"
      }
    >
      <div className={"flex flex-col gap-[30px]"}>
        <div
          className={
            "border border-white bg-[#1D1D1B] px-[10px] py-[16px] text-start flex flex-col gap-12"
          }
        >
            <p className="mt-12">
              <span className="px-1 font-bold">Ошибка запроса транзакции</span>
            </p>
            <p className="">
                Не удалось отправить запрос на выполнение транзакции.
            </p>
            <p className="flex flex-col">
              <span>
                Попробуйте переподключить кошелек и повторить попытку. Если ошибка сохраняется, попробуйте запросить транзакцию еще раз.
              </span>
            </p>
            <p className="flex flex-col">
              Если проблема не исчезает, убедитесь, что ваш кошелек работает корректно, или свяжитесь с поддержкой.
            </p>
            <Button
                className={"mt-[20px]"}
                label={"Ок"}
                includeArrows={false}
                onClick={() => handleClick(onConfirm)}
              />
        </div>
      </div>
    </div>
  );
};
