import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";

type ConfirmModalProps = {
  text: string;
  confirmLabel: string;
  onConfirm(): void;
  onCancel(): void;
};

export const ConfirmModal = ({
  text,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
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
            "border border-white bg-[#1D1D1B] px-[10px] py-[16px] text-center"
          }
        >
          {text}
        </div>

        <div className={"flex w-full  gap-2"}>
          <button
            className={
              "flex flex-1 items-center justify-center gap-3 border border-white bg-[#1D1D1B] py-[16px]"
            }
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="1.44674"
                y1="11.1464"
                x2="11.3462"
                y2="1.24695"
                stroke="#E30613"
              />
              <line
                x1="1.15385"
                y1="1.14645"
                x2="11.0533"
                y2="11.0459"
                stroke="#E30613"
              />
            </svg>

            <span className={"underline"} onClick={() => handleClick(onCancel)}>
              Отменить
            </span>
          </button>

          <button
            className={
              "flex flex-1 items-center justify-center gap-3 border border-white bg-[#1D1D1B] py-[16px]"
            }
          >
            <svg
              width="17"
              height="12"
              viewBox="0 0 17 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1.25 5.22222L6.43182 10.5L16.25 0.5" stroke="#00FFFF" />
            </svg>

            <span
              className={"underline"}
              onClick={() => handleClick(onConfirm)}
            >
              {confirmLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
