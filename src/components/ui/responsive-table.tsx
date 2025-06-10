
import * as React from "react"
import { cn } from "@/lib/utils"

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-hidden rounded-lg border bg-card shadow-sm",
      className
    )}
    {...props}
  >
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        {children}
      </div>
    </div>
  </div>
))
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-muted/50 border-b px-6 py-4",
      className
    )}
    {...props}
  />
))
ResponsiveTableHeader.displayName = "ResponsiveTableHeader"

const ResponsiveTableBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("divide-y", className)}
    {...props}
  />
))
ResponsiveTableBody.displayName = "ResponsiveTableBody"

const ResponsiveTableRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 py-4 hover:bg-muted/50 transition-colors",
      className
    )}
    {...props}
  />
))
ResponsiveTableRow.displayName = "ResponsiveTableRow"

const ResponsiveTableCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    priority?: 'high' | 'medium' | 'low';
  }
>(({ className, label, priority = 'medium', children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1",
      priority === 'high' && "md:col-span-1",
      priority === 'medium' && "md:col-span-1 lg:col-span-1",
      priority === 'low' && "hidden lg:block",
      className
    )}
    {...props}
  >
    {label && (
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide md:hidden">
        {label}
      </span>
    )}
    <div className="text-sm">{children}</div>
  </div>
))
ResponsiveTableCell.displayName = "ResponsiveTableCell"

const ResponsiveTableHeaderCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    priority?: 'high' | 'medium' | 'low';
  }
>(({ className, priority = 'medium', children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:block",
      priority === 'high' && "md:col-span-1",
      priority === 'medium' && "md:col-span-1 lg:col-span-1",
      priority === 'low' && "hidden lg:block",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
ResponsiveTableHeaderCell.displayName = "ResponsiveTableHeaderCell"

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableHeaderCell,
}
