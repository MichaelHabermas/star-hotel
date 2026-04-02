/**
 * Minimal surface for attaching Bearer tokens to embedded API `fetch` — features that only need
 * auth can depend on this instead of the full `StarHotelApp`.
 */
export type EmbeddedApiSessionPort = {
  getAuthToken?: () => string | null | undefined;
};
