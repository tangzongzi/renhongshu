/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZHIPU_API_KEY: string
  readonly VITE_USE_REAL_API: string
  readonly VITE_API_BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
