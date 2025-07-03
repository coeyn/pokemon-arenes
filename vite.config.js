import { defineConfig } from 'vite'
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pokemon-arenes/',
  build: {
    outDir: 'docs'
  },
  define: {
    'process.env': {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN
    }
  }
})
