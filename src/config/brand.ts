/**
 * Confirmed Shima AK lockups — gold on light (light) or gold on charcoal (dark).
 * Use `surface` on ShimaLogo to match the UI background.
 * Use `presentation="tight"` to crop frame/padding; use `variant="wordmark"` on hero photos.
 */
export const brandLogos = {
  onLight: "/brand/shima-ak-logo-light.png",
  onDark: "/brand/shima-ak-logo-dark.png",
} as const;

export type BrandLogoSurface = keyof typeof brandLogos;

export function getBrandLogoSrc(surface: "light" | "dark"): string {
  return surface === "dark" ? brandLogos.onDark : brandLogos.onLight;
}
