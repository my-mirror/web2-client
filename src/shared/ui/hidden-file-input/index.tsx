import { ChangeEvent } from "react";

import { processFile } from "~/shared/utils";

type HiddenFileInputProps = {
  id: string;
  onChange(file: File): void;
  accept?: string;
  shouldProcess?: boolean;
};

export const HiddenFileInput = ({
  id,
  onChange,
  accept,
  shouldProcess = true,
}: HiddenFileInputProps) => {
  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];

    if (file) {
      if (shouldProcess) {
        onChange(await processFile(file));
      } else {
        onChange(file);
      }
    }
  };

  return (
    <input
      onChange={handleInputChange}
      accept={accept}
      type={"file"}
      id={id}
      hidden
    />
  );
};
