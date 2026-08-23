import { useEffect, useState } from "react";
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
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (subtle || mobile || reducedMotion) {
      setMotionEnabled(false);
      return;
    }

    const enable = () => setMotionEnabled(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(enable, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(enable, 400);
    return () => window.clearTimeout(timer);
  }, [subtle]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        subtle && "opacity-40",
      )}
      aria-hidden
    >
      {motionEnabled ? (
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
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-secondary/40",
            isWinter && "from-sky-100/40 via-background to-background",
          )}
        />
      )}

      {motionEnabled ? (
        <>
          <div className="shima-orb shima-orb-1" style={{ animationDuration: `${cycle}s` }} />
          <div className="shima-orb shima-orb-2" style={{ animationDuration: `${cycle}s` }} />
          <div className="shima-orb shima-orb-3" style={{ animationDuration: `${cycle}s` }} />
        </>
      ) : null}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-background/25 via-background/45 to-background/90",
          isWinter && "from-background/50 via-background/70 to-background/95",
        )}
      />

      {motionEnabled ? <div className="shima-grain absolute inset-0 opacity-[0.03]" /> : null}
    </div>
  );
}
