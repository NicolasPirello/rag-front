import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3001,
    cors: false,
    proxy: {
      "/ask": {
        target: "https://10.74.18.56:8000",
        changeOrigin: true,
      },
      "/ask_audio": {
        target: "https://10.74.18.56:8000",
        changeOrigin: true,
      },
      "/synthesize": {
        target: "http://iaapi.seguridadciudad.gob.ar:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/synthesize/, "/synthesize"),
      },
    },
  },
});
