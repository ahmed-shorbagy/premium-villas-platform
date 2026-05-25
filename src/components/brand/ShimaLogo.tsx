import { siteConfig } from "@/config/site";
import { getBrandLogoSrc } from "@/config/brand";
import { cn } from "@/lib/utils";

import { useHypeOptional } from "@/context/HypeController";

/**
 * Which lockup file to show — based on the **UI background**, not hero text color.
 * - `light` → cream lockup (`shima-ak-logo-light.png`) on bright surfaces
 * - `dark` → charcoal lockup (`shima-ak-logo-dark.png`) on navy/dark surfaces
 * - `auto` → adapt to current theme
 */
export type ShimaLogoSurface = "light" | "dark" | "auto";

export interface ShimaLogoProps {
  surface?: ShimaLogoSurface;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  /** Soft rounded card around the lockup (header, hero, footer) */
  framed?: boolean;
  className?: string;
  /** @deprecated Use `surface` — was misleading; do not use */
  light?: boolean;
  /** @deprecated Use `surface` — was misleading; do not use */
  inverse?: boolean;
}

const heights: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "h-8",
  sm: "h-10",
  md: "h-11",
  lg: "h-14",
  xl: "h-[4.5rem] sm:h-20",
  hero: "h-[4.75rem] sm:h-[5.25rem] md:h-24",
};

const frameBySurface: Record<"light" | "dark", string> = {
  light:
    "inline-flex overflow-hidden rounded-[1.25rem] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 bg-white",
  dark:
    "inline-flex overflow-hidden rounded-[1.25rem] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/5 bg-[#1a1f2e]",
};

function resolveSurface(
  surface: ShimaLogoSurface | undefined,
  isWinter: boolean
): "light" | "dark" {
  if (surface === "light" || surface === "dark") return surface;
  return isWinter ? "dark" : "light";
}

export function ShimaLogo({
  surface,
  size = "md",
  framed = false,
  className,
}: ShimaLogoProps) {
  const hype = useHypeOptional();
  const resolvedSurface = resolveSurface(surface, hype?.isWinter ?? false);

  const image = (
    <img
      src={getBrandLogoSrc(resolvedSurface)}
      alt={siteConfig.brand.name}
      width={400}
      height={480}
      decoding="async"
      draggable={false}
      className={cn(
        "w-auto max-w-full shrink-0 object-contain object-center",
        heights[size]
      )}
    />
  );

  if (!framed) {
    return <span className={cn("inline-flex shrink-0", className)}>{image}</span>;
  }

  return (
    <span className={cn(frameBySurface[resolvedSurface], className)}>{image}</span>
  );
}
