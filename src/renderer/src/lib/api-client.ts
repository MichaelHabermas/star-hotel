/** Renderer data boundary; E4 will call Express in main (no direct Node/SQLite). */
export const apiClient = {
  async ping(): Promise<{ ok: true }> {
    return { ok: true }
  },
}
