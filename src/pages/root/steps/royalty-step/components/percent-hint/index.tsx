import { Button } from "~/shared/ui/button";

export const PercentHint = ({ close }: { close(): void }) => {
  return (
    <div
      className={
        "fixed left-0 top-0 z-30 flex h-full w-full items-center justify-center bg-black/80 px-[15px]"
      }
    >
      <div className={"flex flex-col gap-3"}>
        <div
          className={
            "border-primary border bg-[#1D1D1B] px-[10px] py-[8px] text-sm"
          }
        >
          Сумма роялти должна составлять 100%
        </div>

        <Button onClick={close} label={"Понятно"} />
      </div>
    </div>
  );
};
