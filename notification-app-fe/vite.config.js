import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "EVAL_");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/evaluation-service": {
          target: "http://4.224.186.213",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      __EVAL_CONFIG__: JSON.stringify({
        EVAL_EMAIL: env.EVAL_EMAIL,
        EVAL_NAME: env.EVAL_NAME,
        EVAL_ROLL_NO: env.EVAL_ROLL_NO,
        EVAL_ACCESS_CODE: env.EVAL_ACCESS_CODE,
        EVAL_CLIENT_ID: env.EVAL_CLIENT_ID,
        EVAL_CLIENT_SECRET: env.EVAL_CLIENT_SECRET,
        EVAL_BASE_URL: "/evaluation-service",
      }),
    },
  };
});
