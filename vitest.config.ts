import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const sharedAliases = {
  '@renderer': path.resolve(__dirname, 'src/renderer/src'),
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@domain': path.resolve(__dirname, 'src/domain'),
} as const

/** Tests that run in Node (no DOM, no renderer setup file). */
const nodeTestGlobs = [
  'src/domain/**/*.{test,spec}.{ts,tsx}',
  'src/server/**/*.{test,spec}.{ts,tsx}',
  'src/shared/**/*.{test,spec}.{ts,tsx}',
  'src/main/**/*.{test,spec}.{ts,tsx}',
] as const

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: sharedAliases },
  test: {
    env: {
      STAR_HOTEL_SKIP_AUTH: '1',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [...nodeTestGlobs],
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [...nodeTestGlobs],
          setupFiles: ['src/renderer/src/test/setup.ts'],
        },
      },
    ],
  },
})
