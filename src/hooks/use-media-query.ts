import * as React from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") return window.matchMedia(query).matches;
    return false;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 640px)");
}

function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
}

function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)");
}

function usePrefersDark(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, usePrefersDark, usePrefersReducedMotion };
