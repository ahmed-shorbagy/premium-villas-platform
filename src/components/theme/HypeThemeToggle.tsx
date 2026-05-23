import { Sun, Snowflake } from "lucide-react";
import { useHype } from "@/context/HypeController";
import { HYPE_THEME_META } from "@/theme/tokens";
import type { HypeSeason } from "@/theme/types";
import { cn } from "@/lib/utils";

interface HypeThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function HypeThemeToggle({ className, compact = false }: HypeThemeToggleProps) {
  const { season, setSeason } = useHype();

  const options: HypeSeason[] = ["summer", "winter"];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-glass-border bg-glass p-0.5 backdrop-blur-md transition-colors duration-300",
        className,
      )}
      role="group"
      aria-label="تبديل الموسم"
    >
      {options.map((id) => {
        const active = season === id;
        const meta = HYPE_THEME_META[id];
        const Icon = id === "summer" ? Sun : Snowflake;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setSeason(id)}
            aria-pressed={active}
            title={meta.descriptionAr}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              compact && "px-2",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {!compact && <span>{meta.labelAr}</span>}
          </button>
        );
      })}
    </div>
  );
}
