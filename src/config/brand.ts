/**
 * Confirmed Shima AK lockups (user-cropped PNGs).
 * `surface` on ShimaLogo picks the asset for the UI background — no extra cropping in CSS.
 */
export const brandLogos = {
  onLight: "/brand/shima-ak-logo-light.png",
  onDark: "/brand/shima-ak-logo-dark.png",
} as const;

export function getBrandLogoSrc(surface: "light" | "dark"): string {
  return surface === "dark" ? brandLogos.onDark : brandLogos.onLight;
}
