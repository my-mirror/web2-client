import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { Replace } from "~/shared/ui/icons/replace";

type CoverButtonProps = {
  src: string;
  onClick(): void;
};

export const CoverButton = ({ src, onClick }: CoverButtonProps) => {
  const [impactOccurred] = useHapticFeedback();

  const handleClick = () => {
    impactOccurred("light");
    onClick();
  };

  return (
    <div
      className={
        "flex w-full items-center gap-2 border border-white px-[10px] py-[8px]"
      }
    >
      <div className={"bg-primary h-[50px] w-[50px] shrink-0 overflow-hidden"}>
        <img
          src={src}
          className={"h-full w-full object-cover object-center"}
          alt={"cover-image"}
        />
      </div>

      <button
        onClick={handleClick}
        className={
          "flex w-full items-center justify-between gap-1 border border-white px-[10px] py-[8px]"
        }
      >
        <div />
        <div className={"flex gap-2 text-sm"}>Изменить</div>
        <Replace />
      </button>
    </div>
  );
};
