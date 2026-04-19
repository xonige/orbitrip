
/**
 * API CONFIGURATION
 * 
 * Manages the connection between the Frontend and the Backend Services.
 * In development, Vite proxies /api to https://orbitrip.ge.
 */

// Use local origin in browser, handled by Vite Proxy or Nginx relative proxy
// Use environment variable for separate backend, fallback to local origin
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 
                            // @ts-ignore
                            (import.meta.env?.VITE_API_URL) || 
                            (typeof window !== 'undefined' ? window.location.origin : '');

export const getBaseUrl = () => API_BASE_URL;

// Local DB fallback handles.
export const IS_LOCAL_DB = true; 
