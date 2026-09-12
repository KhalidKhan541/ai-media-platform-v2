import * as React from "react";

function useCopyToClipboard(resetDelay = 2000): { copiedText: string | null; copy: (text: string) => Promise<boolean> } {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const copy = React.useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), resetDelay);
      return true;
    } catch {
      return false;
    }
  }, [resetDelay]);

  return { copiedText, copy };
}

export { useCopyToClipboard };
