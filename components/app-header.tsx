"use client"

import { Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border">
      {/* Logo */}
      <span className="text-lg font-bold tracking-tight">IIC_BO</span>

      <div className="flex items-center gap-4">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 text-sm">
            <Globe className="h-4 w-4" />
            Language
            <span className="font-semibold">Korean</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Korean</DropdownMenuItem>
          <DropdownMenuItem>English</DropdownMenuItem>
          <DropdownMenuItem>Japanese</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <span className="font-semibold">Monster1437</span>
            <span className="text-xs opacity-80">(Super_Admin)</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>프로필 설정</DropdownMenuItem>
          <DropdownMenuItem>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  )
}
