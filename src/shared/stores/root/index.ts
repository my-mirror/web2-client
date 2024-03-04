import { create } from "zustand";

export type Royalty = {
  address: string;
  value: number;
};

type RootStore = {
  name: string;
  setName: (name: string) => void;

  author: string;
  setAuthor: (author: string) => void;

  file: File | null;
  setFile: (file: File) => void;

  fileSrc: string;
  setFileSrc: (fileSrc: string) => void;

  allowCover: boolean;
  setAllowCover: (allowCover: boolean) => void;

  cover: File | null;
  setCover: (cover: File | null) => void;

  isPercentHintOpen: boolean;
  setPercentHintOpen: (isPercentHintOpen: boolean) => void;

  authors: string[];
  setAuthors: (authors: string[]) => void;

  royalty: Royalty[];
  setRoyalty: (authors: Royalty[]) => void;

  price: number;
  setPrice: (price: number) => void;

  allowResale: boolean;
  setAllowResale: (allowResale: boolean) => void;

  licenseResalePrice: number;
  setLicenseResalePrice: (licenseResalePrice: number) => void;
};

export const useRootStore = create<RootStore>((set) => ({
  name: "",
  setName: (name) => set({ name }),

  author: "",
  setAuthor: (author) => set({ author }),

  file: null,
  setFile: (file) => set({ file }),

  fileSrc: "",
  setFileSrc: (fileSrc) => set({ fileSrc }),

  allowCover: false,
  setAllowCover: (allowCover) => set({ allowCover }),

  cover: null,
  setCover: (cover) => set({ cover }),

  isPercentHintOpen: true,
  setPercentHintOpen: (isPercentHintOpen) => set({ isPercentHintOpen }),

  authors: [],
  setAuthors: (authors) => set({ authors }),

  royalty: [{ address: "", value: 100 }],
  setRoyalty: (royalty) => set({ royalty }),

  price: 0,
  setPrice: (price: number) => set({ price }),

  allowResale: false,
  setAllowResale: (allowResale) => set({ allowResale }),

  licenseResalePrice: 0,
  setLicenseResalePrice: (licenseResalePrice) => set({ licenseResalePrice }),
}));
