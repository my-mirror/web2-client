import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";

import { cn } from "~/shared/utils";

type ButtonProps = {
  label: string;
  onClick?(): void;
  includeArrows?: boolean;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
};

export const Button = ({
  includeArrows,
  label,
  className,
  disabled,
  onClick,
  isLoading,
}: ButtonProps) => {
  const [impactOccurred] = useHapticFeedback();

  const handleClick = () => {
    impactOccurred("light");
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center border border-white bg-primary py-[8px] text-sm",
        {
          "pointer-events-none bg-[#7B7B7B80]": disabled,
          "pointer-events-none animate-pulse": isLoading,
        },
        className,
      )}
    >
      {includeArrows && <span className={"mr-3"}>{">>>"}</span>}
      {label}
      {includeArrows && <span className={"ml-3"}>{"<<<"}</span>}
    </button>
  );
};
