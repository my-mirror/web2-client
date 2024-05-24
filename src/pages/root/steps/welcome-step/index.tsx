import { useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";

import { Button } from "~/shared/ui/button";
import { useAuth } from "~/shared/services/auth";

type WelcomeStepProps = {
  nextStep(): void;
};

export const WelcomeStep = ({ nextStep }: WelcomeStepProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const [isLoaded, setLoaded] = useState(false);

  const auth = useAuth();

  const handleNextClick = async () => {
    if (tonConnectUI.connected) {
      nextStep();
    } else {
      await tonConnectUI.openModal();

      const res = await auth.mutateAsync();
      sessionStorage.setItem("auth_v1_token", res.data.auth_v1_token);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 4000);
  }, []);

  useEffect(() => {
    if (tonConnectUI.connected) {
      nextStep();
    }
  }, [nextStep, tonConnectUI.connected]);

  if (!isLoaded) {
    return (
      <section
        className={"relative flex h-[100vh] items-center justify-center"}
      >
        <img alt={"splash"} className={"mb-20 h-[300px]"} src={"/splash.gif"} />
      </section>
    );
  }

  return (
    <section className={"mt-4 flex flex-col px-4"}>
      <div className={"flex items-center justify-center"}>
        <img
          alt={"splash"}
          className={" w-full shrink-0"}
          src={"/splash.gif"}
        />
      </div>

      <div className={"flex gap-2 text-sm"}>
        <span>/ Добро пожаловать в MY</span>

        <div className={"flex items-center gap-0"}>
          <span>[</span>
          <div className={"mb-0.5 h-3 w-3 rounded-full bg-primary"} />
          <span>]:</span>
        </div>
      </div>

      <div className={"mt-2"}>
        <p className={"text-sm"}>
          децентрализованную систему монетизации контента. для продолжения
          необходимо подключить криптокошелек TON
        </p>
      </div>

      <Button
        className={"mt-[30px]"}
        label={"Подключить криптокошелёк TON"}
        includeArrows={true}
        isLoading={auth.isLoading}
        onClick={handleNextClick}
      />
    </section>
  );
};
