import { ReactNode, useMemo, useState } from "react";

export const useSteps = (
  sections: ({
    nextStep,
    prevStep,
  }: {
    nextStep(): void;
    prevStep(): void;
  }) => ReactNode[],
) => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    return setStep((s) => s + 1);
  };

  const prevStep = () => {
    return setStep((s) => s - 1);
  };

  const ActiveSection = useMemo(() => {
    return sections({ nextStep, prevStep })[step];
  }, [step, sections]);

  return {
    ActiveSection,
    setStep,
    step,
  };
};
