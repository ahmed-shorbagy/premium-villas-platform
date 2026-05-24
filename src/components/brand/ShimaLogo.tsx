import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface ShimaLogoProps {
  variant?: "full" | "icon" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Light text for dark backgrounds (footer, hero) */
  light?: boolean;
  inverse?: boolean;
}

const heights = {
  sm: { full: "h-8", icon: "h-7 w-7", word: "text-base" },
  md: { full: "h-10", icon: "h-9 w-9", word: "text-xl" },
  lg: { full: "h-14", icon: "h-12 w-12", word: "text-3xl" },
};

export function ShimaLogo({
  variant = "full",
  size = "md",
  className,
  light = false,
  inverse = false,
}: ShimaLogoProps) {
  const { name } = siteConfig.brand;

  if (variant === "icon") {
    return (
      <img
        src={siteConfig.assets.logoIconSrc}
        alt={name}
        className={cn("shrink-0 object-contain", heights[size].icon, className)}
      />
    );
  }

  if (variant === "full") {
    return (
      <img
        src={siteConfig.assets.logoSrc}
        alt={name}
        className={cn("w-auto shrink-0 object-contain", heights[size].full, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-display leading-none",
        heights[size].word,
        className,
      )}
    >
      <span
        className={cn(
          "font-display font-medium tracking-tight",
          inverse || light ? "text-white" : "text-foreground",
        )}
      >
        Shima
      </span>
      <span className="font-bold tracking-[0.18em] text-gradient-brand">AK</span>
    </span>
  );
}
