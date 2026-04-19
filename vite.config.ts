
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Using path.resolve('.') instead of process.cwd() to avoid property missing error on Process type
  const env = loadEnv(mode, path.resolve('.'), '');
  
  return {
    root: '.', 
    publicDir: 'public',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('./src'), 
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    server: {
        host: true,
        port: 3000,
        // Proxy API requests to backend during development
        proxy: {
            '/viator-api': {
                target: 'https://api.sandbox.viator.com/partner',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/viator-api/, ''),
                secure: true,
                headers: {
                    'exp-api-key': '4ca7c53d-9c81-4b83-8e50-a72f9a0aeb74',
                    'Accept': 'application/json; version=2.0'
                }
            },
            '/api': {
                target: env.VITE_API_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: env.VITE_API_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      // Expose these to the client safely
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
          output: {
              manualChunks: (id) => {
                  // Core React - always needed
                  if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                      return 'vendor-react';
                  }
                  // Date picker - only needed in booking flow
                  if (id.includes('react-datepicker') || id.includes('date-fns')) {
                      return 'vendor-datepicker';
                  }
                  // Icons - lucide is large, isolate it
                  if (id.includes('lucide-react')) {
                      return 'vendor-icons';
                  }
                  // EmailJS - only used in contact/booking
                  if (id.includes('@emailjs')) {
                      return 'vendor-email';
                  }
                  // Gemini AI - only used in admin/helper
                  if (id.includes('@google/genai') || id.includes('@google/generative-ai')) {
                      return 'vendor-ai';
                  }
              }
          }
      }
    }
  };
});