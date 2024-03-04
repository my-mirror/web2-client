import { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

import { cn } from "~/shared/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: FieldError;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <div className={"flex w-full flex-col gap-1.5"}>
      <input
        ref={ref}
        {...props}
        className={cn(
          "border border-white bg-[#2B2B2B] px-[10px] py-[8px] text-sm outline-none",
          props?.className,
        )}
      />

      {props.error && (
        <span className={"text-xs text-red-500"}>{props.error.message}</span>
      )}
    </div>
  );
});
