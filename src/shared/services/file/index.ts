import { useMutation } from "react-query";
import { useState } from "react";

import { request } from "~/shared/libs";

export const useUploadFile = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation(["upload-file"], (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    return request
      .post<{
        content_sha256: string;
        content_id_v1: string;
        content_url: string;
      }>("/storage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem('auth_v1_token') || ""
        },

        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent?.total as number) ||
              0,
          );
          setUploadProgress(percentCompleted);
        },
      })
      .then((response) => {
        setIsUploading(false);
        return response.data;
      })
      .catch((error) => {
        setIsUploading(false);
        throw error;
      });
  });

  return { ...mutation, uploadProgress, isUploading };
};
