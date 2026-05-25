/**
 * Confirmed Shima AK lockups (user-cropped PNGs).
 * Pick by **page background**: light UI → onLight, dark footer → onDark. No CSS cropping.
 */
export const brandLogos = {
  onLight: "/brand/shima-ak-logo-light.png",
  onDark: "/brand/shima-ak-logo-dark.png",
} as const;

export function getBrandLogoSrc(surface: "light" | "dark"): string {
  return surface === "dark" ? brandLogos.onDark : brandLogos.onLight;
}
