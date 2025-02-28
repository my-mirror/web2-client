/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_BASE_STORAGE_URL: string
  readonly MODE: 'development' | 'production'
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
