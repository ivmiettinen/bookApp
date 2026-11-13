/// <reference types="vite/client" />

// vite/client also declares CSS modules and static asset imports (images, fonts, etc.).
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_BOOKS_URL?: string;
  readonly VITE_BOOKS_URL_DEV?: string;
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_LOGIN_URL_DEV?: string;
  readonly VITE_USER_URL?: string;
  readonly VITE_USER_URL_DEV?: string;

  // Temporary compatibility with the existing Netlify environment names.
  readonly REACT_APP_books_Url?: string;
  readonly REACT_APP_books_Url_dev?: string;
  readonly REACT_APP_loginUrl?: string;
  readonly REACT_APP_loginUrl_dev?: string;
  readonly REACT_APP_userUrl?: string;
  readonly REACT_APP_userUrl_dev?: string;
}
