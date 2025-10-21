import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // <-- Vercel deployment base path
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
            entryFileNames: `assets/[name]-v31.0-[hash].js`,
            chunkFileNames: `assets/[name]-v31.0-[hash].js`,
            assetFileNames: `assets/[name]-v31.0-[hash].[ext]`
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
