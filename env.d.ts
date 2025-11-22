/// <reference types="vite/client" />

interface Window {
  CF_CONFIG: {
    API_KEY: string;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
