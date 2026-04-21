import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('react-big-calendar')) return 'vendor-calendar';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('pdfkit') || id.includes('react-pdf')) return 'vendor-pdf';
            if (id.includes('emoji-picker-react')) return 'vendor-emoji';
            if (id.includes('framer-motion')) return 'vendor-motion';
            return 'vendor'; // other modules
          }
        }
      }
    }
  }
});
