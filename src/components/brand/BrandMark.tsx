import { Building2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showImage?: boolean;
}

const sizeMap = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6" },
};

export function BrandMark({ size = "md", className, showImage }: BrandMarkProps) {
  const logoSrc = siteConfig.assets.logoSrc;
  const useImage = showImage !== false && logoSrc;

  if (useImage) {
    return (
      <img
        src={logoSrc}
        alt=""
        className={cn(
          "rounded-xl object-cover ring-1 ring-glass-border",
          sizeMap[size].box,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand",
        sizeMap[size].box,
        className,
      )}
      aria-hidden
    >
      <Building2 className={sizeMap[size].icon} />
    </div>
  );
}
