import * as React from "react";

function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useToggleGroup<T extends string>(options: T[], defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(defaultValue);
  return [value, setValue];
}

export { useToggle, useToggleGroup };
