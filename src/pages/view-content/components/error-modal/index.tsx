import { useHapticFeedback, useWebApp } from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";
import { Button } from "~/shared/ui/button";

type ErrorModalProps = {
  onConfirm(): void;
};

export const ErrorModal = ({
  onConfirm,
}: ErrorModalProps) => {
  const [impactOccurred] = useHapticFeedback();
  const WebApp = useWebApp();

  const handleClick = (fn: () => void) => {
    impactOccurred("light");
    fn();
  };

  useEffect(() => {
    // Отключаем вертикальные свайпы при монтировании компонента
    if (WebApp && WebApp.disableVerticalSwipes) {
      WebApp.disableVerticalSwipes();
    }
  
    // Включаем вертикальные свайпы обратно при размонтировании
    return () => {
      if (WebApp && WebApp.enableVerticalSwipes) {
        WebApp.enableVerticalSwipes();
      }
    };
  }, []);
  return (
    <div
    className={
      "fixed left-0 top-0 z-30 flex h-full w-full items-center justify-center bg-black/80 px-[15px]"
    }
  >
  <div className={"flex flex-col max-h-[80vh] w-[85vw] max-w-md"}>
    <div
      className={
        "border border-white bg-[#1D1D1B] px-[15px] py-[16px] text-start flex flex-col gap-6 h-full overflow-y-auto"
      }
    >
            <p className="mt-4">
              <span className="font-bold">Ошибка запроса транзакции</span>
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
        </div>
        <Button
          className={"mt-[20px]"}
          label={"Ок"}
          includeArrows={false}
          onClick={() => handleClick(onConfirm)}
        />
      </div>
    </div>
  );
};
