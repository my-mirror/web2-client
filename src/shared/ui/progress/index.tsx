import { cn, getIndexArray } from "~/shared/utils";

type ProgressProps = {
  value: number; // from 0 to 100
};

export const Progress = ({ value }: ProgressProps) => {
  const activeBars = Math.round((value / 100) * 25);

  return (
    <div className="flex items-center gap-[5px] border border-white px-[10px] py-[8px]">
      {getIndexArray(25).map((idx) => (
        <div
          key={idx}
          className={cn("h-[14px] w-full", {
            "bg-primary": idx < activeBars,
            "bg-[#2B2B2B]": idx >= activeBars,
          })}
        />
      ))}

      <div className="ml-2 text-sm">{value}%</div>
    </div>
  );
};
