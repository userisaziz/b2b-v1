"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative">{children}</div>
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  onClick?: () => void
}

const DropdownMenuTrigger = ({ children, onClick }: DropdownMenuTriggerProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  open: boolean
  align?: "start" | "end" | "center"
}

const DropdownMenuContent = ({ children, open, align = "center" }: DropdownMenuContentProps) => {
  if (!open) return null
  
  return (
    <div 
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 transform -translate-x-1/2"
      )}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const DropdownMenuItem = ({ children, onClick, className }: DropdownMenuItemProps) => {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel = ({ children, className }: DropdownMenuLabelProps) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
export type { 
  DropdownMenuProps, 
  DropdownMenuTriggerProps, 
  DropdownMenuContentProps, 
  DropdownMenuItemProps, 
  DropdownMenuLabelProps, 
  DropdownMenuSeparatorProps 
}