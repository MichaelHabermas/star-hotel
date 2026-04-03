/** Augment Vite `import.meta.env` for main-process and Vitest node code. */
interface ImportMetaEnv {
  /** True in `pnpm dev` (electron-vite serve) and Vitest; false in `electron-vite build` (packaged app). */
  readonly STAR_HOTEL_INCLUDE_OPENAPI: boolean;
}
