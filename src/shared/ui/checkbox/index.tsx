import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";

type CheckboxProps = {
  onClick(): void;
  checked: boolean;
};

export const Checkbox = ({ onClick, checked }: CheckboxProps) => {
  const [impactOccurred] = useHapticFeedback();

  const handleClick = () => {
    impactOccurred("light");
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={"flex h-8 w-8 items-center justify-center bg-[#2B2B2B] p-2"}
    >
      {checked && <div className={"h-full w-full bg-primary"} />}
    </div>
  );
};
