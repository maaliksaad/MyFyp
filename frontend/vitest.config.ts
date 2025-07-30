import react from '@vitejs/plugin-react'
import { config } from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

config()

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['**/*.server.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'node'],
      ['app/routes/**/*.test.ts', 'node']
    ],
    globals: true,
    setupFiles: ['./app/test/setup-test-environment.ts'],
    include: ['./app/**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['app/features/**/*.{js,ts,jsx,tsx}']
    },
    retry: process.env.CI === 'true' ? 2 : 0
  }
})
