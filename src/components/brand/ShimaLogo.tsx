import { siteConfig } from "@/config/site";
import { getBrandLogoSrc } from "@/config/brand";
import { cn } from "@/lib/utils";

export type ShimaLogoSurface = "light" | "dark";

export type ShimaLogoPresentation = "framed" | "tight";

export interface ShimaLogoProps {
  /**
   * UI background behind the logo — not the image file name.
   * `light` → cream lockup for headers, cards, admin.
   * `dark` → charcoal lockup for footer, etc.
   */
  surface?: ShimaLogoSurface;
  /**
   * `wordmark` — text only (best on hero photos).
   * `tight` — zoomed lockup, crops frame/padding (header, footer).
   * `framed` — full PNG lockup (admin cards).
   */
  variant?: "wordmark" | "lockup" | "full" | "icon";
  presentation?: ShimaLogoPresentation;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  /** @deprecated Use `surface="dark"` */
  light?: boolean;
  /** @deprecated Use `surface="dark"` */
  inverse?: boolean;
}

const wordmarkSizes: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "text-sm gap-1",
  sm: "text-base gap-1",
  md: "text-xl gap-1.5",
  lg: "text-3xl sm:text-4xl gap-2",
  xl: "text-4xl sm:text-[2.75rem] gap-2",
  hero: "text-4xl sm:text-5xl md:text-[3.25rem] gap-2.5",
};

const framedHeights: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-16",
  xl: "h-20",
  hero: "h-20",
};

/** Viewport for tight crop — hides PNG border and outer padding */
const tightFrames: Record<NonNullable<ShimaLogoProps["size"]>, string> = {
  xs: "h-7 w-[4.25rem]",
  sm: "h-9 w-[5.5rem]",
  md: "h-10 w-[6.5rem]",
  lg: "h-14 w-[9rem]",
  xl: "h-[4.25rem] w-[11rem]",
  hero: "h-[4.5rem] w-[11.5rem] sm:h-20 sm:w-[13rem]",
};

const tightZoom =
  "pointer-events-none absolute left-1/2 top-[36%] h-[340%] w-[340%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover select-none";

function resolveSurface({
  surface,
  light,
  inverse,
}: Pick<ShimaLogoProps, "surface" | "light" | "inverse">): ShimaLogoSurface {
  if (surface) return surface;
  if (light || inverse) return "dark";
  return "light";
}

function resolvePresentation(
  variant: ShimaLogoProps["variant"],
  presentation?: ShimaLogoPresentation,
): ShimaLogoPresentation {
  if (presentation) return presentation;
  if (variant === "wordmark") return "framed";
  return "tight";
}

export function ShimaLogo({
  surface,
  variant = "lockup",
  presentation,
  size = "md",
  className,
  light,
  inverse,
}: ShimaLogoProps) {
  const resolvedSurface = resolveSurface({ surface, light, inverse });
  const resolvedPresentation = resolvePresentation(variant, presentation);

  if (variant === "wordmark") {
    const onDark = resolvedSurface === "dark";
    return (
      <span
        dir="ltr"
        className={cn(
          "inline-flex items-baseline font-display leading-none",
          wordmarkSizes[size],
          className,
        )}
      >
        <span className={cn("font-medium tracking-tight", onDark ? "text-white" : "text-foreground")}>
          Shima
        </span>
        <span className="font-bold tracking-[0.12em] text-gradient-brand">AK</span>
      </span>
    );
  }

  const src = getBrandLogoSrc(resolvedSurface);
  const useTight = resolvedPresentation === "tight";

  if (useTight) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-md",
          tightFrames[size],
          className,
        )}
      >
        <img
          src={src}
          alt={siteConfig.brand.name}
          width={280}
          height={320}
          decoding="async"
          draggable={false}
          className={tightZoom}
        />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={siteConfig.brand.name}
      width={280}
      height={320}
      decoding="async"
      className={cn(
        "w-auto shrink-0 object-contain object-center",
        framedHeights[size],
        resolvedSurface === "light" && "rounded-lg",
        resolvedSurface === "dark" && "rounded-xl",
        className,
      )}
    />
  );
}
