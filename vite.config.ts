import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Cloudflare build environments hide "Secrets" (encrypted env vars) during build.
      // We provide a fallback ("") so 'npm run build' doesn't crash.
      // NOTE: For the app to use the key, it must be set as a non-encrypted 'Variable' 
      // in Cloudflare Pages/Workers settings, or baked in via .env for local builds.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    }
  }
})
