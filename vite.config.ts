import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-dom") || id.includes("react-router")) return "vendor-react";
          if (id.includes("react")) return "vendor-react";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("embla-carousel")) return "vendor-embla";
          if (id.includes("date-fns")) return "vendor-date-fns";
          if (id.includes("recharts")) return "vendor-recharts";
          if (id.includes("lucide-react")) return "vendor-icons";
        },
      },
    },
  },
}));
