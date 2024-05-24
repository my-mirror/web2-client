import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const bufferToFile = (buffer: ArrayBuffer, filename: string) => {
  const blob = new Blob([buffer], { type: "image/*" });
  return new File([blob], filename);
};

export const processFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return bufferToFile(buffer, file.name);
};

export const getIndexArray = (len: number) =>
  new Array(len).fill("").map((_, i) => i);

export const fromNanoTON = (amount: string) => Number(amount) / 10 ** 9;
