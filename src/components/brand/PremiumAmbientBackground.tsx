import { siteConfig } from "@/config/site";
import { useHype } from "@/context/HypeController";
import { cn } from "@/lib/utils";

interface PremiumAmbientBackgroundProps {
  intensity?: "full" | "low";
}

const cycle = siteConfig.animation.ambientCycleSeconds;

export function PremiumAmbientBackground({ intensity = "full" }: PremiumAmbientBackgroundProps) {
  const { isWinter } = useHype();
  const subtle = intensity === "low";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        subtle && "opacity-40",
      )}
      aria-hidden
    >
      {/* 3s animated SVG ambient layer */}
      <img
        src={siteConfig.assets.ambientBg}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          "animate-shima-ambient-pulse",
          isWinter && "opacity-50 mix-blend-multiply hue-rotate-[140deg] saturate-75",
          !isWinter && "opacity-90",
        )}
      />

      {/* CSS orbs — synced to 3s cycle */}
      <div
        className="shima-orb shima-orb-1"
        style={{ animationDuration: `${cycle}s` }}
      />
      <div
        className="shima-orb shima-orb-2"
        style={{ animationDuration: `${cycle}s` }}
      />
      <div
        className="shima-orb shima-orb-3"
        style={{ animationDuration: `${cycle}s` }}
      />

      {/* Readability veil */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-background/25 via-background/45 to-background/90",
          isWinter && "from-background/50 via-background/70 to-background/95",
        )}
      />

      {/* Subtle grain */}
      <div className="shima-grain absolute inset-0 opacity-[0.03]" />
    </div>
  );
}
