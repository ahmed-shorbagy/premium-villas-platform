import { siteConfig } from "@/config/site";
import { getBrandLogoSrc } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * Which lockup file to show — based on the **UI background**, not hero text color.
 * - `light` → cream lockup (`shima-ak-logo-light.png`) on bright surfaces
 * - `dark` → charcoal lockup (`shima-ak-logo-dark.png`) on navy/dark surfaces
 */
export type ShimaLogoSurface = "light" | "dark";

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

const frameBySurface: Record<ShimaLogoSurface, string> = {
  light:
    "inline-flex overflow-hidden rounded-2xl border border-glass-border bg-card/90 p-1.5 shadow-float ring-1 ring-white/70 backdrop-blur-md",
  dark:
    "inline-flex overflow-hidden rounded-2xl border border-white/12 bg-navy/50 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/8 backdrop-blur-md",
};

function resolveSurface({
  surface,
}: Pick<ShimaLogoProps, "surface" | "light" | "inverse">): ShimaLogoSurface {
  if (surface) return surface;
  return "light";
}

export function ShimaLogo({
  surface,
  size = "md",
  framed = false,
  className,
}: ShimaLogoProps) {
  const resolvedSurface = resolveSurface({ surface });

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
        heights[size],
        framed && "rounded-[calc(1rem-6px)]",
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
