import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function Avatar({ src, alt, name, size = "md", className, fallbackClassName, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const showFallback = !src || hasError;

  return (
    <div
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}
      {...props}
    >
      {!showFallback && (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
      {showFallback && (
        <div className={cn("flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground", fallbackClassName)}>
          {name ? getInitials(name) : "??"}
        </div>
      )}
    </div>
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: React.ReactNode;
}

function AvatarGroup({ max = 3, children, className, ...props }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {visible.map((child, i) => (
        <div key={i} className="relative inline-flex rounded-full ring-2 ring-background">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
