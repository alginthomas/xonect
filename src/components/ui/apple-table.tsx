
import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const AppleTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <ScrollArea className="w-full whitespace-nowrap rounded-md border">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
))
AppleTable.displayName = "AppleTable"

const AppleTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/50", className)} {...props} />
))
AppleTableHeader.displayName = "AppleTableHeader"

const AppleTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-border", className)}
    {...props}
  />
))
AppleTableBody.displayName = "AppleTableBody"

const AppleTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium",
      className
    )}
    {...props}
  />
))
AppleTableFooter.displayName = "AppleTableFooter"

const AppleTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
AppleTableRow.displayName = "AppleTableRow"

const AppleTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-14 px-6 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap",
      className
    )}
    {...props}
  />
))
AppleTableHead.displayName = "AppleTableHead"

const AppleTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 align-middle text-sm font-medium whitespace-nowrap", className)}
    {...props}
  />
))
AppleTableCell.displayName = "AppleTableCell"

const AppleTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
AppleTableCaption.displayName = "AppleTableCaption"

export {
  AppleTable,
  AppleTableHeader,
  AppleTableBody,
  AppleTableFooter,
  AppleTableHead,
  AppleTableRow,
  AppleTableCell,
  AppleTableCaption,
}
