import {
  BackButton as NativeBackButton,
  useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";

type BackButtonProps = {
  onClick?: () => void;
};

export const BackButton = ({ onClick }: BackButtonProps) => {
  const [impactOccurred] = useHapticFeedback();

  const handleClick = () => {
    impactOccurred("light");

    if (onClick) {
      onClick();
    }
  };

  return <NativeBackButton onClick={handleClick} />;
};
