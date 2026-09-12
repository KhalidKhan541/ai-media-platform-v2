import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  width?: number;
  collapsedWidth?: number;
  className?: string;
}

function Sidebar({ children, collapsed = false, width = 260, collapsedWidth = 72, className }: SidebarProps) {
  return (
    <aside
      className={cn("flex h-full flex-col border-r bg-card transition-all duration-300", className)}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({ logo, title, collapsed, className, children, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex items-center gap-3 border-b px-4 py-4", collapsed && "justify-center px-2", className)}
      {...props}
    >
      {logo}
      {!collapsed && title && <span className="text-lg font-semibold">{title}</span>}
      {children}
    </div>
  );
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  title?: string;
  collapsed?: boolean;
}

function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-3 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function SidebarGroup({ label, collapsed, className, children, ...props }: SidebarGroupProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {!collapsed && label && (
        <h4 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</h4>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  collapsed?: boolean;
}

function SidebarItem({ icon, label, href, active = false, collapsed, badge, onClick, className, ...props }: SidebarItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{badge}</span>
          )}
        </>
      )}
    </div>
  );
  if (href) return <a href={href} className="block">{content}</a>;
  return content;
}

export interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t px-4 py-4", className)} {...props}>{children}</div>;
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarItem, SidebarFooter };
