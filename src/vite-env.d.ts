// Manually defined types to replace missing vite/client
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
    dataLayer: any[];
  }

  interface ImportMetaEnv {
    readonly VITE_API_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_ADMIN_PASSWORD: string
    readonly VITE_EMAILJS_SERVICE_ID: string
    readonly VITE_EMAILJS_TEMPLATE_ID: string
    readonly VITE_EMAILJS_PUBLIC_KEY: string
    readonly VITE_API_URL: string
    
    [key: string]: any
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {};