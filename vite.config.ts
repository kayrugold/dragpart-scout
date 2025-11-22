import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Declare process for the config file environment (Node.js)
declare const process: { env: any, cwd: () => string };

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Map the standard API_KEY to the VITE_API_KEY expected by the client
      // This ensures import.meta.env.VITE_API_KEY works seamlessly
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})