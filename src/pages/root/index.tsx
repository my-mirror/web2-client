import { WelcomeStep } from "./steps/welcome-step";
import { DataStep } from "./steps/data-step";
import { RoyaltyStep } from "./steps/royalty-step";
import { PresubmitStep } from "./steps/presubmit-step";

import { useSteps } from "~/shared/hooks/use-steps";
import { PriceStep } from "~/pages/root/steps/price-step";

export const RootPage = () => {
  const { ActiveSection } = useSteps(({ nextStep, prevStep }) => {
    return [
      <WelcomeStep nextStep={nextStep} />,
      <DataStep prevStep={prevStep} nextStep={nextStep} />,
      // <AuthorsStep prevStep={prevStep} nextStep={nextStep} />,
      <RoyaltyStep prevStep={prevStep} nextStep={nextStep} />,
      <PriceStep prevStep={prevStep} nextStep={nextStep} />,
      <PresubmitStep prevStep={prevStep} />,
    ];
  });

  return ActiveSection;
};