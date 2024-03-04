import { Button } from "~/shared/ui/button";
import { useAuth } from "~/shared/services/auth";

type WelcomeStepProps = {
  nextStep(): void;
};

export const WelcomeStep = ({ nextStep }: WelcomeStepProps) => {
  const auth = useAuth();

  const handleNextClick = async () => {
    const res = await auth.mutateAsync();
    sessionStorage.setItem("auth_v1_token", res.data.auth_v1_token);
    nextStep();
  };

  return (
    <section className={"mt-4 px-4"}>
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
        label={"Подключить криптокошелёк TON"}
        className={"mt-[30px]"}
        includeArrows={true}
        isLoading={auth.isLoading}
        onClick={handleNextClick}
      />
    </section>
  );
};
