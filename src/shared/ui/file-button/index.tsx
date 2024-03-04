type FileButtonProps = {
  htmlFor: string;
};

export const FileButton = ({ htmlFor }: FileButtonProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={
        "flex w-full items-center justify-center border border-white py-[8px] text-sm"
      }
    >
      <span className={"underline"}>Загрузить_файл</span>
    </label>
  );
};
