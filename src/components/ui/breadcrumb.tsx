import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

function Breadcrumb({ separator = <ChevronRight className="h-4 w-4" />, className, ...props }: BreadcrumbProps) {
  return <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)} {...props} />;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  href?: string;
}

function BreadcrumbItem({ active, href, className, children, ...props }: BreadcrumbItemProps) {
  return (
    <span className={cn("flex items-center gap-1", className)} {...props}>
      {href && !active ? (
        <a href={href} className="transition-colors hover:text-foreground">{children}</a>
      ) : (
        <span className={cn("font-medium text-foreground", active && "text-primary")}>{children}</span>
      )}
    </span>
  );
}

export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

function BreadcrumbSeparator({ children, className }: BreadcrumbSeparatorProps) {
  return <span className={cn("mx-1 text-muted-foreground", className)} role="presentation">{children || <ChevronRight className="h-4 w-4" />}</span>;
}

function BreadcrumbEllipsis({ className }: { className?: string }) {
  return <span className={cn("flex h-9 w-9 items-center justify-center", className)}><span className="h-1 w-1 rounded-full bg-foreground" /><span className="mx-0.5 h-1 w-1 rounded-full bg-foreground" /><span className="h-1 w-1 rounded-full bg-foreground" /><span className="sr-only">More</span></span>;
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis };
