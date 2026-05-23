import { ShimaLogo } from "./ShimaLogo";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "full" | "icon" | "wordmark";
  light?: boolean;
}

/** @deprecated Use ShimaLogo — kept for existing imports */
export function BrandMark({
  size = "md",
  className,
  variant = "icon",
  light,
}: BrandMarkProps) {
  return <ShimaLogo variant={variant} size={size} className={className} light={light} />;
}
