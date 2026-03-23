import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages, set VITE_BASE_URL to '/your-repo-name/'
// For local dev, leave it unset (defaults to '/')
const base = process.env.VITE_BASE_URL ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
})
