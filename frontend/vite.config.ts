import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude mock utilities from production builds
        if (mode === 'production' && id.includes('/utils/mock')) {
          return true;
        }
        return false;
      }
    }
  }
}))
