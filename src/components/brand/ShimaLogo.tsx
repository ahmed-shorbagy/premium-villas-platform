import { siteConfig } from "@/config/site";
import { getBrandLogoSrc } from "@/config/brand";
import { cn } from "@/lib/utils";

export type ShimaLogoSurface = "light" | "dark";

export interface ShimaLogoProps {
  /**
   * UI background behind the logo — not the image file name.
   * `light` → cream lockup for headers, cards, admin.
   * `dark` → charcoal lockup for hero, footer.
   */
  surface?: ShimaLogoSurface;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  /** @deprecated Use `surface="dark"` */
  light?: boolean;
  /** @deprecated Use `surface="dark"` */
  inverse?: boolean;
  /** @deprecated Lockup only — kept for call-site compatibility */
  variant?: "full" | "icon" | "wordmark" | "lockup";
}

const heights: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-16",
  xl: "h-20",
  hero: "h-28 sm:h-36 md:h-40",
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
  const src = getBrandLogoSrc(resolvedSurface);

  return (
    <img
      src={src}
      alt={siteConfig.brand.name}
      width={280}
      height={320}
      decoding="async"
      className={cn(
        "w-auto shrink-0 object-contain object-center",
        heights[size],
        resolvedSurface === "light" && "rounded-lg",
        resolvedSurface === "dark" && "rounded-xl",
        className,
      )}
    />
  );
}
