import { useMutation } from "react-query";
import { useState } from "react";
import { request } from "~/shared/libs";

const STORAGE_API_URL = import.meta.env.VITE_API_BASE_STORAGE_URL;
const MAX_CHUNK_SIZE = 80 * 1024 * 1024; // 80 MB

export const useUploadFile = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const mutation = useMutation(["upload-file"], async (file: File) => {
    console.log(`Начинаем загрузку файла: ${file.name} (${file.size} байт)`);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null); // Сбрасываем ошибку перед началом новой загрузки

    try {
      // Для маленьких файлов используем обычную загрузку, но с теми же заголовками
      if (file.size <= MAX_CHUNK_SIZE) {
        console.log("Используем обычную загрузку (файл <= MAX_CHUNK_SIZE)");
        
        // Подготавливаем заголовки - такие же, как для чанковой загрузки
        const headers: Record<string, string> = {
          "X-File-Name": btoa(unescape(encodeURIComponent(file.name))), // Имя файла в base64
          "X-Chunk-Start": "0", // Начинаем с позиции 0
          "Content-Type": file.type || "application/octet-stream",
          "X-Last-Chunk": "1" // Это единственный и последний чанк
        };
        
        // Добавляем заголовок авторизации
        const authToken = localStorage.getItem('auth_v1_token');
        if (authToken) {
          headers["Authorization"] = authToken;
        }
        
        console.log("Заголовки запроса:", headers);
        
        try {
          const response = await request.post<{
            upload_id?: string;
            content_sha256?: string;
            content_id?: string;
            content_id_v1?: string;
            content_url?: string;
          }>("", file, { // Отправляем файл напрямую вместо FormData
            baseURL: STORAGE_API_URL,
            headers,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent?.total as number || file.size)
              );
              setUploadProgress(Math.min(99, percentCompleted));
            },
          });
          
          console.log("Ответ на обычную загрузку:", response.data);
          setUploadProgress(100);
          
          return {
            content_sha256: response.data.content_sha256 || "",
            content_id_v1: response.data.content_id_v1 || response.data.content_id || "",
            content_url: response.data.content_url || ""
          };
        } catch (error) {
          console.error("Ошибка при обычной загрузке:", error);
          setUploadError(error instanceof Error ? error : new Error('Ошибка при загрузке файла'));
          throw error;
        }
      }
      
      // Для больших файлов используем чанковую загрузку
      console.log("Используем чанкированную загрузку (файл > MAX_CHUNK_SIZE)");
      
      let offset = 0;
      let uploadId: string | null = null;
      let chunkNumber = 0;
      
      // Загружаем файл по чанкам
      while (offset < file.size) {
        chunkNumber++;
        const chunkEnd = Math.min(offset + MAX_CHUNK_SIZE, file.size);
        const chunk = file.slice(offset, chunkEnd);
        console.log(`Загрузка чанка #${chunkNumber} начиная с байта ${offset}`);
        
        // Определяем, является ли текущий чанк последним
        const isLastChunk = chunkEnd === file.size;
        
        // Подготавливаем заголовки
        const headers: Record<string, string> = {
          "X-File-Name": btoa(unescape(encodeURIComponent(file.name))), // Имя файла в base64
          "X-Chunk-Start": offset.toString(),
          "Content-Type": file.type || "application/octet-stream"
        };
        
        // Добавляем маркер последнего чанка, если это последний чанк
        if (isLastChunk) {
          headers["X-Last-Chunk"] = "1";
        }
        
        // Добавляем заголовок авторизации
        const authToken = localStorage.getItem('auth_v1_token');
        if (authToken) {
          headers["Authorization"] = authToken;
        }
        
        // Если есть uploadId, добавляем его в заголовки
        if (uploadId) {
          headers["X-Upload-ID"] = uploadId;
        }
        
        console.log("Заголовки запроса:", headers);
        
        try {
          const response = await request.post<{
            upload_id?: string;
            current_size?: number;
            content_id?: string;
            content_sha256?: string;
            content_id_v1?: string;
            content_url?: string;
          }>("", chunk, {
            baseURL: STORAGE_API_URL,
            headers,
            onUploadProgress: (progressEvent) => {
              // Прогресс загрузки текущего чанка
              const overallProgress = offset + progressEvent.loaded;
              const percentCompleted = Math.round((overallProgress / file.size) * 100);
              setUploadProgress(Math.min(99, percentCompleted));
            },
          });
          
          console.log(`Ответ на чанк #${chunkNumber}:`, response.data);
          
          // Сохраняем uploadId из первого ответа, если не установлен
          if (!uploadId && response.data.upload_id) {
            uploadId = response.data.upload_id;
            console.log("Получен upload_id:", uploadId);
          }
          
          // Проверка на наличие content_id
          if (response.data.content_id) {
            console.log("Загрузка завершена. ID файла:", response.data.content_id);
            setUploadProgress(100);
            
            return {
              content_sha256: response.data.content_sha256 || "",
              content_id_v1: response.data.content_id_v1 || response.data.content_id || "",
              content_url: response.data.content_url || ""
            };
          }
          
          // Обновляем смещение на основе ответа сервера
          if (response.data.current_size !== undefined) {
            offset = response.data.current_size;
            console.log(`Сервер сообщает current_size: ${offset}`);
          } else {
            console.warn("Неожиданный ответ от сервера, отсутствует current_size");
            const error = new Error("Missing current_size in response");
            setUploadError(error);
            throw error;
          }
        } catch (error: any) {
          console.error(`Ошибка при загрузке чанка #${chunkNumber}:`, error);
          if (error.response) {
            console.error("Ответ сервера:", error.response.status, error.response.data);
          }
          setUploadError(error instanceof Error ? error : new Error(`Ошибка при загрузке чанка #${chunkNumber}`));
          throw error;
        }
      }
      
      const error = new Error("Ошибка загрузки файла: все чанки загружены, но content_id не получен");
      console.error(error.message);
      setUploadError(error);
      throw error;
    } catch (error: any) {
      console.error("Ошибка при загрузке:", error);
      if (error.response) {
        console.error("Ответ сервера:", error.response.status, error.response.data);
      }
      setUploadError(error instanceof Error ? error : new Error("Неизвестная ошибка при загрузке"));
      setIsUploading(false);
      throw error;
    } finally {
      setIsUploading(false);
    }
  });

  // Сбросить ошибку
  const resetUploadError = () => setUploadError(null);

  return { 
    ...mutation, 
    uploadProgress, 
    isUploading, 
    uploadError,
    resetUploadError
  };
};