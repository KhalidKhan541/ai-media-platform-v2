import * as React from "react";

function useKeyPress(targetKey: string, handler?: () => void, options?: { down?: boolean; up?: boolean }) {
  const { down = true, up = false } = options || {};

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === targetKey && down) handler?.();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === targetKey && up) handler?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [targetKey, handler, down, up]);
}

function useKeyPressCombo(keys: string[], handler: () => void) {
  const pressedKeys = React.useRef(new Set<string>());

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
      if (keys.every((k) => pressedKeys.current.has(k))) handler();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [keys, handler]);
}

export { useKeyPress, useKeyPressCombo };
