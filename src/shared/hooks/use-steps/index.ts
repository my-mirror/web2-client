import { useTonConnectUI } from "@tonconnect/ui-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

const CHECK_INTERVAL = 20000;


export const useSteps = (
  sections: ({
    nextStep,
    prevStep,
  }: {
    nextStep(): void;
    prevStep(): void;
  }) => ReactNode[],
) => {

  const [tonConnectUI] = useTonConnectUI();
  
  const [step, setStep] = useState(0);
  
  // If connection is lost, reset the step
  useEffect(() => {
    const interval = setInterval(() => {
      if (!tonConnectUI.connected && step !== 0) {
        setStep(0);
      }
    }, CHECK_INTERVAL);
  
    return () => clearInterval(interval);
  }, []);
  
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const ActiveSection = useMemo(() => {
    return sections({ nextStep, prevStep })[step];
  }, [step, sections]);

  return {
    ActiveSection,
    setStep,
    step,
  };
};