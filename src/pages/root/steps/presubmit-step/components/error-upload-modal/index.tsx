import { useHapticFeedback, useWebApp } from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";
import { Button } from "~/shared/ui/button";

type ErrorUploadProps = {
  onConfirm(): void;
};

export const ErrorUploadModal = ({
  onConfirm,
}: ErrorUploadProps) => {
  const [impactOccurred] = useHapticFeedback();
  const WebApp = useWebApp();
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
      <div className={"flex flex-col max-h-[80vh] w-[85vw] max-w-md"}>
        <div
          className={
            "border border-white bg-[#1D1D1B] px-[15px] py-[16px] text-start flex flex-col gap-12 h-full overflow-y-auto"
          }
        >
            <div className="flex flex-col gap-6">
              <p className="mt-2">
                Внимание!
              </p>
              <p>
                Произошла ошибка при загрузке видео.
              </p>
              <p className="flex flex-col">
                <span className="tracking-[.25em] w-full">
                    Загрузка не завершена
                </span>
                из-за технических проблем или превышения допустимых ограничений. Вы можете попробовать загрузить файл ещё раз или выбрать другой файл.
              </p>
              <p className="flex flex-col">
                <span className="tracking-[.25em] w-full">
                    Если проблема повторяется
                </span>
                обратитесь в техническую поддержку сервиса MY, предоставив подробную информацию о загружаемом файле и возникшей ошибке.
              </p>
            </div>
        </div>
        <Button
          className={"mt-[20px] sticky bottom-0"}
          label={"Понятно"}
          includeArrows={false}
          onClick={() => handleClick(onConfirm)}
        />
      </div>
    </div>
  );
};