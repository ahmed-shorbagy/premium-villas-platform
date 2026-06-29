/**
 * Confirmed Shima AK lockups (user-cropped PNGs).
 * Pick by **page background**: light UI → onLight, dark footer → onDark. No CSS cropping.
 */
export const brandLogos = {
  onLight: "/brand/nuzuul-logo.png",
  onDark: "/brand/nuzuul-logo.png",
} as const;

export function getBrandLogoSrc(surface: "light" | "dark"): string {
  return surface === "dark" ? brandLogos.onDark : brandLogos.onLight;
}
