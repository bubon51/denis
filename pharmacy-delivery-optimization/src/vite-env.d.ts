/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Ajouter d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
