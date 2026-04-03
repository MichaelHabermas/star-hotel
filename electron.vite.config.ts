import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import { builtinModules } from 'node:module';
import { resolve } from 'node:path';

const sharedAlias = {
  '@shared': resolve(__dirname, 'src/shared'),
  '@domain': resolve(__dirname, 'src/domain'),
} as const;

const nodeBuiltinExternals = builtinModules.flatMap((m) => [m, `node:${m}`]);

/**
 * Main/preload: bundle app code + JS dependencies into out/{main,preload}.
 * Externals: native addons, electron, Node builtins. OpenAPI/Swagger omitted from production build.
 */
const mainProcessExternals: (string | RegExp)[] = [
  'electron',
  /^electron\/.+/,
  'better-sqlite3',
  /^better-sqlite3\/.+/,
  'argon2',
  /^argon2\/.+/,
  ...nodeBuiltinExternals,
];

const preloadExternals: (string | RegExp)[] = [
  'electron',
  /^electron\/.+/,
  ...nodeBuiltinExternals,
];

export default defineConfig(({ command }) => ({
  main: {
    resolve: { alias: { ...sharedAlias } },
    define: {
      'import.meta.env.STAR_HOTEL_INCLUDE_OPENAPI': JSON.stringify(command === 'serve'),
    },
    build: {
      externalizeDeps: false,
      sourcemap: true,
      rollupOptions: {
        external: mainProcessExternals,
      },
    },
  },
  preload: {
    resolve: { alias: { ...sharedAlias } },
    build: {
      externalizeDeps: false,
      sourcemap: true,
      rollupOptions: {
        external: preloadExternals,
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
}));
