import { siteConfig } from "@/config/site";
import { getBrandLogoSrc } from "@/config/brand";
import { cn } from "@/lib/utils";

export type ShimaLogoSurface = "light" | "dark";

export interface ShimaLogoProps {
  /**
   * Background the logo sits on (not the filename).
   * `light` → cream lockup · `dark` → charcoal lockup.
   */
  surface?: ShimaLogoSurface;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  /** @deprecated Use `surface="dark"` */
  light?: boolean;
  /** @deprecated Use `surface="dark"` */
  inverse?: boolean;
}

const heights: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "h-8",
  sm: "h-10",
  md: "h-12",
  lg: "h-16",
  xl: "h-20",
  hero: "h-[7.5rem] sm:h-32 md:h-36",
};

function resolveSurface({
  surface,
  light,
  inverse,
}: Pick<ShimaLogoProps, "surface" | "light" | "inverse">): ShimaLogoSurface {
  if (surface) return surface;
  if (light || inverse) return "dark";
  return "light";
}

export function ShimaLogo({
  surface,
  size = "md",
  className,
  light,
  inverse,
}: ShimaLogoProps) {
  const resolvedSurface = resolveSurface({ surface, light, inverse });

  return (
    <img
      src={getBrandLogoSrc(resolvedSurface)}
      alt={siteConfig.brand.name}
      width={400}
      height={480}
      decoding="async"
      draggable={false}
      className={cn(
        "w-auto max-w-full shrink-0 object-contain object-center",
        heights[size],
        className,
      )}
    />
  );
}
