"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Menu,
  Globe,
  Settings,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href?: string
  icon?: React.ReactNode
  children?: NavItem[]
  active?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Master",
    children: [
      { title: "Master Info", href: "/master" },
    ],
  },
  {
    title: "Sales",
    children: [
      { title: "Sales", href: "/sales" },
    ],
  },
  {
    title: "Inventory",
    children: [
      { title: "Inventory", href: "/inventory" },
    ],
  },
  {
    title: "3PL",
    children: [
      { title: "3PL Logistics", href: "/3pl" },
    ],
  },
  {
    title: "Rx (LMS)",
    children: [
      {
        title: "Lens Work Management",
        children: [
          { title: "Prescription Review List", href: "/rx/prescription-review" },
          { title: "Lens Work Management", href: "/rx/lens-work", active: true },
        ],
      },
    ],
  },
  {
    title: "Global Report",
    children: [
      { title: "Global Report", href: "/reports" },
    ],
  },
  {
    title: "Setting",
    children: [
      { title: "System Settings", href: "/settings" },
    ],
  },
]

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [isOpen, setIsOpen] = useState(item.children?.some(child => child.active || child.children?.some(c => c.active)) ?? false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = isOpen ? FolderOpen : Folder

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md",
          depth === 0 ? "text-muted-foreground font-medium" : "text-foreground",
          item.active && "bg-primary/10 text-primary font-medium",
          !item.active && "hover:bg-muted"
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {depth === 0 ? (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {item.title}
          </span>
        ) : (
          <>
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">{item.title}</span>
            {hasChildren && (
              isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </>
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="mt-1">
          {item.children?.map((child, i) => (
            child.href ? (
              <Link
                key={i}
                href={child.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md",
                  child.active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={{ paddingLeft: `${28 + depth * 16}px` }}
              >
                <Folder className="h-4 w-4" />
                {child.title}
              </Link>
            ) : (
              <NavItemComponent key={i} item={child} depth={depth + 1} />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "flex flex-col bg-card border-r border-border h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <span className="font-bold text-lg">IIC_BO</span>
        )}
      </div>

      {/* Navigation */}
      {!collapsed && (
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, i) => (
            <div key={i} className="mb-2">
              <NavItemComponent item={item} />
            </div>
          ))}
        </nav>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Front POS
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Copyright */}
      {!collapsed && (
        <div className="px-4 py-3 text-xs text-muted-foreground">
          © 2025 IICOMBINED CO., LTD. ALL RIGHTS RESERVED.
        </div>
      )}
    </aside>
  )
}
