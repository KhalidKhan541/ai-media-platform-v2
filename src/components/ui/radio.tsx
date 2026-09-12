"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn("grid gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioItemProps>(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export interface RadioItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
}

function RadioItem({ value, label, checked, onChange, className, ...props }: RadioItemProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <input type="radio" name="radio-group" value={value} checked={checked} onChange={onChange} className="sr-only" {...props} />
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-primary" : "border-muted-foreground"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export { RadioGroup, RadioItem };
