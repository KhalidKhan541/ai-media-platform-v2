import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  title?: string;
  sticky?: boolean;
  transparent?: boolean;
  bordered?: boolean;
  user?: React.ReactNode;
  notifications?: React.ReactNode;
  search?: React.ReactNode;
}

function Header({
  logo,
  title,
  children,
  sticky = true,
  transparent = false,
  bordered = true,
  user,
  notifications,
  search,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center gap-4 px-4 md:px-6",
        sticky && "sticky top-0 z-40",
        transparent ? "bg-transparent" : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        bordered && "border-b",
        className
      )}
      {...props}
    >
      {logo && <div className="flex items-center gap-2">{logo}</div>}
      {title && <h1 className="text-lg font-semibold md:text-xl">{title}</h1>}
      {search && <div className="flex-1">{search}</div>}
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-2">
        {notifications}
        {user}
      </div>
    </header>
  );
}

export interface HeaderNavProps {
  items: Array<{ label: string; href: string; active?: boolean; icon?: React.ReactNode }>;
  className?: string;
}

function HeaderNav({ items, className }: HeaderNavProps) {
  return (
    <nav className={cn("hidden items-center gap-1 md:flex", className)}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export { Header, HeaderNav };
