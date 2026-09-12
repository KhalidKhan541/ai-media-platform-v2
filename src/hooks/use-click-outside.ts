import * as React from "react";

function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  handler: () => void,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener(mouseEvent, listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler, mouseEvent]);

  return ref;
}

export { useClickOutside };
