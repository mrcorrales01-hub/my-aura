import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Copy service worker
    {
      name: "copy-sw",
      generateBundle(this: any) {
        try {
          const swContent = fs.readFileSync("src/sw.ts", "utf8");
          this.emitFile({ 
            type: "asset", 
            fileName: "sw.js", 
            source: swContent 
          });
        } catch (e) {
          console.warn("Could not copy service worker:", e);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
