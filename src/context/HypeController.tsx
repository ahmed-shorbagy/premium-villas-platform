import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_HYPE_SEASON,
  HYPE_STORAGE_KEY,
  HYPE_THEME_META,
} from "@/theme/tokens";
import type { HypeSeason } from "@/theme/types";

interface HypeControllerValue {
  season: HypeSeason;
  setSeason: (season: HypeSeason) => void;
  toggleSeason: () => void;
  meta: (typeof HYPE_THEME_META)[HypeSeason];
  isSummer: boolean;
  isWinter: boolean;
}

const HypeContext = createContext<HypeControllerValue | undefined>(undefined);

function readStoredSeason(): HypeSeason {
  if (typeof window === "undefined") return DEFAULT_HYPE_SEASON;
  try {
    const stored = localStorage.getItem(HYPE_STORAGE_KEY);
    if (stored === "summer" || stored === "winter") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_HYPE_SEASON;
}

function applySeasonToDocument(season: HypeSeason) {
  const root = document.documentElement;
  root.setAttribute("data-hype", season);
  root.classList.toggle("hype-winter", season === "winter");
  root.classList.toggle("hype-summer", season === "summer");
  root.style.colorScheme = season === "winter" ? "dark" : "light";
}

export function HypeControllerProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<HypeSeason>(readStoredSeason);

  useLayoutEffect(() => {
    applySeasonToDocument(season);
    try {
      localStorage.setItem(HYPE_STORAGE_KEY, season);
    } catch {
      /* ignore */
    }
  }, [season]);

  const setSeason = useCallback((next: HypeSeason) => {
    setSeasonState(next);
  }, []);

  const toggleSeason = useCallback(() => {
    setSeasonState((prev) => (prev === "summer" ? "winter" : "summer"));
  }, []);

  const value = useMemo<HypeControllerValue>(
    () => ({
      season,
      setSeason,
      toggleSeason,
      meta: HYPE_THEME_META[season],
      isSummer: season === "summer",
      isWinter: season === "winter",
    }),
    [season, setSeason, toggleSeason],
  );

  return <HypeContext.Provider value={value}>{children}</HypeContext.Provider>;
}

export function useHype(): HypeControllerValue {
  const ctx = useContext(HypeContext);
  if (!ctx) {
    throw new Error("useHype must be used within HypeControllerProvider");
  }
  return ctx;
}

/** Optional hook for components that may render outside provider (e.g. Storybook) */
export function useHypeOptional(): HypeControllerValue | null {
  return useContext(HypeContext) ?? null;
}
