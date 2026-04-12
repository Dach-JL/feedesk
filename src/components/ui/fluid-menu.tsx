"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute mt-2 w-56 rounded-xl bg-card border border-border shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            align === "right" ? "right-0" : "left-0"
          )}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  className?: string
}

export function MenuItem({ children, onClick, disabled = false, icon, isActive = false, className }: MenuItemProps) {
  return (
    <button
      className={cn(
        "relative block w-full h-16 text-center group transition-colors",
        disabled ? "text-muted-foreground/50 cursor-not-allowed" : "text-foreground hover:bg-accent/50",
        isActive ? "bg-accent" : "",
        className
      )}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-end px-4 h-full">
        {children && (
          <span className="mr-3 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity hidden md:block whitespace-nowrap">
            {children}
          </span>
        )}
        {icon && (
          <span className="h-6 w-6 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5] flex items-center justify-center flex-shrink-0">
            {icon}
          </span>
        )}
      </span>
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300 pointer-events-none md:hidden",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="relative w-[64px]" data-expanded={isExpanded}>
        {/* Container for all items */}
        <div className="relative">
          {/* First item - always visible */}
          <div 
            className={cn(
              "relative w-16 h-16 bg-muted border border-border cursor-pointer rounded-full group z-[100] flex items-center justify-center shadow-lg transition-all duration-300",
              isExpanded ? "ring-2 ring-primary/20 scale-95" : "hover:shadow-primary/10 hover:-translate-y-1"
            )}
            onClick={handleToggle}
          >
            {childrenArray[0]}
          </div>

          {/* Other items */}
          {childrenArray.slice(1).map((child, index) => (
            <div 
              key={index} 
              className="absolute top-0 left-0 w-16 h-16 bg-card border border-border flex items-center justify-center will-change-transform rounded-full shadow-md"
              style={{
                transform: `translateY(${isExpanded ? -(index + 1) * 64 : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 80 - index,
                transition: `transform ${isExpanded ? '500ms' : '300ms'} cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity ${isExpanded ? '300ms' : '200ms'}`,
                transitionDelay: isExpanded ? `${index * 40}ms` : '0ms',
                backfaceVisibility: 'hidden',
                perspective: 1000,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
