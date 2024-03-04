import { ReactNode } from "react";

import { cn } from "~/shared/utils";

type FormLabelProps = {
  label: string;
  children?: ReactNode;
  labelClassName?: string;
  formLabelAddon?: ReactNode;
};

export const FormLabel = ({
  label,
  children,
  labelClassName,
  formLabelAddon,
}: FormLabelProps) => {
  return (
    <div className={"flex flex-col gap-1"}>
      <div
        className={cn(
          "w-full items-center justify-between text-sm",
          labelClassName,
        )}
      >
        {label} {formLabelAddon}
      </div>
      {children}
    </div>
  );
};
