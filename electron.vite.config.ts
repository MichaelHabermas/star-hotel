import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'node:path'

const sharedAlias = {
  '@shared': resolve(__dirname, 'src/shared'),
} as const

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { ...sharedAlias } },
    build: {
      sourcemap: true,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { ...sharedAlias } },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: 'index.js',
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        ...sharedAlias,
      },
    },
    build: {
      sourcemap: true,
    },
  },
})
