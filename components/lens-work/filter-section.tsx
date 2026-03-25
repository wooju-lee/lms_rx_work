"use client"

import { useState } from "react"
import { Search, Calendar, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface FilterSectionProps {
  onSearch: () => void
}

type QuickDate = "today" | "week" | "month" | "3months"

const BP_OPTIONS = [
  { value: "C1002", label: "C1002 미국 법인", prefix: "US" },
  { value: "C1003", label: "C1003 캐나다 법인", prefix: "CA" },
]

const STORE_OPTIONS_BY_BP: Record<string, { value: string; label: string }[]> = {
  C1002: [
    { value: "US1001", label: "US1001" },
    { value: "US1002", label: "US1002" },
    { value: "US1003", label: "US1003" },
    { value: "US1004", label: "US1004" },
  ],
  C1003: [
    { value: "CA1001", label: "CA1001" },
    { value: "CA1002", label: "CA1002" },
    { value: "CA1003", label: "CA1003" },
  ],
}

const formatDate = (date: Date) => date.toISOString().split("T")[0]
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

export function FilterSection({ onSearch }: FilterSectionProps) {
  const [quickDate, setQuickDate] = useState<QuickDate | null>(null)
  const [selectedBP, setSelectedBP] = useState<string>("")
  const [selectedStores, setSelectedStores] = useState<string[]>([])

  const currentStoreOptions = selectedBP ? (STORE_OPTIONS_BY_BP[selectedBP] ?? []) : []

  const handleBPChange = (value: string) => {
    setSelectedBP(value)
    setSelectedStores([])
  }

  const handleStoreToggle = (store: string) => {
    if (!selectedBP) return
    setSelectedStores((prev) =>
      prev.includes(store)
        ? prev.filter((s) => s !== store)
        : [...prev, store]
    )
  }

  const handleSelectAllStores = () => {
    if (!selectedBP) return
    if (selectedStores.length === currentStoreOptions.length) {
      setSelectedStores([])
    } else {
      setSelectedStores(currentStoreOptions.map((s) => s.value))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        {/* First Row - Dropdowns */}
        <div className="flex flex-wrap gap-4 mb-5">
          {/* BP - Single Select */}
          <div className="w-[180px]">
            <label className="block text-sm font-medium text-foreground mb-2">BP</label>
            <Select value={selectedBP} onValueChange={handleBPChange}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select BP" />
              </SelectTrigger>
              <SelectContent>
                {BP_OPTIONS.map((bp) => (
                  <SelectItem key={bp.value} value={bp.value}>
                    {bp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store - Multi Select */}
          <div className="w-[160px]">
            <label className="block text-sm font-medium text-foreground mb-2">Store</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!selectedBP}
                  className="w-full justify-between bg-background border-border font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedStores.length === 0
                    ? "All"
                    : selectedStores.length === currentStoreOptions.length
                    ? "All Selected"
                    : `${selectedStores.length} selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2" align="start">
                <div className="space-y-1">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    onClick={handleSelectAllStores}
                  >
                    <Checkbox
                      checked={currentStoreOptions.length > 0 && selectedStores.length === currentStoreOptions.length}
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                  <div className="border-t my-1" />
                  {currentStoreOptions.map((store) => (
                    <div
                      key={store.value}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleStoreToggle(store.value)}
                    >
                      <Checkbox
                        checked={selectedStores.includes(store.value)}
                      />
                      <span className="text-sm">{store.label}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Channel - Single Select */}
          <div className="w-[120px]">
            <label className="block text-sm font-medium text-foreground mb-2">Channel</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Type */}
          <div className="w-[130px]">
            <label className="block text-sm font-medium text-foreground mb-2">Work Type</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-house">IN HOUSE</SelectItem>
                <SelectItem value="outsourced">OUTSOURCED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Processing Period */}
          <div className="w-[150px]">
            <label className="block text-sm font-medium text-foreground mb-2">Processing Period</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="basic-iic">(Basic) IIC Lab</SelectItem>
                <SelectItem value="basic-lab1">(Basic) Lab 1</SelectItem>
                <SelectItem value="basic-lab2">(Basic) Lab 2</SelectItem>
                <SelectItem value="tint-iic">(Tint) IIC Lab</SelectItem>
                <SelectItem value="tint-lab1">(Tint) Lab 1</SelectItem>
                <SelectItem value="tint-lab2">(Tint) Lab 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Status */}
          <div className="w-[130px]">
            <label className="block text-sm font-medium text-foreground mb-2">Work Status</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="finalized">Finalized</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row - Date Range */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-3">Date Search</label>
          <div className="flex items-center gap-3">
            {/* Date Type Select */}
            <Select defaultValue="order">
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order Date</SelectItem>
                <SelectItem value="approval">Approval Date</SelectItem>
                <SelectItem value="completion">Completion Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Pickers */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="date"
                defaultValue={formatDate(thirtyDaysAgo)}
                className="w-40 pl-10 bg-background border-border [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />
            </div>
            <span className="text-muted-foreground">~</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="date"
                defaultValue={formatDate(today)}
                className="w-40 pl-10 bg-background border-border [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />
            </div>

            {/* Quick Date Buttons */}
            <div className="flex gap-2 ml-2">
              {[
                { key: "today", label: "Today" },
                { key: "week", label: "1 Week" },
                { key: "month", label: "1 Month" },
                { key: "3months", label: "3 Months" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQuickDate(item.key as QuickDate)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    quickDate === item.key
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Third Row - Search */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-2">
              Store Code, Store Name, Order No. #, Number #
            </label>
            <Input
              placeholder="Enter at least 2 characters"
              className="bg-background border-border"
            />
          </div>
          <Button 
            onClick={onSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
