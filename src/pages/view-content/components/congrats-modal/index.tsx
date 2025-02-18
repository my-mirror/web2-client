import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { Button } from "~/shared/ui/button";

type CongratsModalProps = {
  onConfirm(): void;
};

export const CongratsModal = ({
  onConfirm,
}: CongratsModalProps) => {
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
              <span className="text-xl">🎉</span>
              <span className="px-1 font-bold">Поздравляем с покупкой!</span>
              <span className="text-xl">🎉</span>
            </p>
            <p className="">
              Ваш контент уже в пути! В ближайшее время в чат-боте <strong>MY Player</strong> вам придёт сообщение с доступом к купленному материалу. В этом чат-боте будет храниться весь ваш приобретённый контент.
            </p>
            <p className="flex flex-col">
             <strong className="w-full">Теперь вы можете самостоятельно осуществить продажу купленного контента.</strong>
             <span>
                  Перешлите сообщение из чата My-Player друзьям или опубликуйте в своём Telegram-канале. Каждый, кто купит контент по вашей ссылке, принесёт вам доход, а автору — заслуженное вознаграждение.
             </span>
            </p>
            <p className="flex flex-col">
                  Спасибо, что выбираете MY!
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
