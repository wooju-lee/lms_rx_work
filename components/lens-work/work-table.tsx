"use client"

import { useState } from "react"
import { FileText, Printer, Info, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Tag, Send, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface WorkItem {
  id: string
  orderDate: string
  approvalDate?: string
  orderNumber: string
  orderType: "Normal" | "Pre-order"
  number?: string
  channel: "Online" | "Offline"
  storeCode: string
  storeName: string
  status: "Pending" | "Inbound Inspection" | "In Progress" | "Outbound Inspection"
  outboundRegistered?: boolean
  workType?: string
  processingPeriod?: string
  assignee?: string
  completionDate?: string
  leadTime?: number
}

interface WorkTableProps {
  data: WorkItem[]
  onDetailClick: (item: WorkItem) => void
  onInvoicePrint: (item: WorkItem) => void
  onPickingListPrint: (items: WorkItem | WorkItem[]) => void
  onShippingTransmit: (item: WorkItem) => void
  onExcelDownload: () => void
  onWorkLabelPrint: (selectedItems: WorkItem[]) => void
  onCreateShipment: (selectedItems: WorkItem[]) => void
}

// Calculate lead time (리드타임) in days
const calculateLeadTime = (orderDate: string, completionDate?: string): { days: number; isOngoing: boolean } => {
  // Parse the order date (format: "2025-08-29 11:00 (PST)")
  const orderDateStr = orderDate.split(" ")[0]
  const orderDateTime = new Date(orderDateStr)
  
  if (completionDate && completionDate !== "-") {
    // If completion date exists, calculate from order date to completion date
    const completionDateStr = completionDate.split(" ")[0]
    const completionDateTime = new Date(completionDateStr)
    const diffTime = completionDateTime.getTime() - orderDateTime.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return { days: Math.max(1, diffDays), isOngoing: false }
  } else {
    // If no completion date, calculate from order date to today
    const today = new Date()
    const diffTime = today.getTime() - orderDateTime.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return { days: Math.max(1, diffDays), isOngoing: true }
  }
}

const getLeadTimeDisplay = (days: number, isOngoing: boolean) => {
  return (
    <span className="text-sm text-foreground">
      {days} days{isOngoing ? "+" : ""}
    </span>
  )
}

const getStatusBadge = (status: WorkItem["status"]) => {
  const statusStyles: Record<WorkItem["status"], string> = {
    Pending: "bg-[oklch(0.92_0.12_85)] text-[oklch(0.45_0.12_70)] border-[oklch(0.85_0.15_85)]",
    Inspection: "bg-[oklch(0.75_0.16_55)] text-white border-transparent",
    "In Progress": "bg-[oklch(0.7_0.15_145)] text-white border-transparent",
    Completed: "bg-[oklch(0.6_0.15_145)] text-white border-transparent",
    Finalized: "bg-transparent text-[oklch(0.5_0.12_145)] border-[oklch(0.7_0.15_145)]",
  }

  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 font-medium ${statusStyles[status]}`}
    >
      {status}
    </Badge>
  )
}

type SortField = "orderDate" | "approvalDate" | "leadTime" | "completionDate"
type SortDirection = "asc" | "desc"

export function WorkTable({ data, onDetailClick, onInvoicePrint, onPickingListPrint, onShippingTransmit, onExcelDownload, onWorkLabelPrint, onCreateShipment }: WorkTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"customer" | "store">("customer")
  const [downloadPopoverOpen, setDownloadPopoverOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("orderDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  
  const totalCount = data.length

  // Sort data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case "orderDate":
        comparison = new Date(a.orderDate.split(" ")[0]).getTime() - new Date(b.orderDate.split(" ")[0]).getTime()
        break
      case "approvalDate":
        const aApproval = a.approvalDate || a.orderDate
        const bApproval = b.approvalDate || b.orderDate
        comparison = new Date(aApproval.split(" ")[0]).getTime() - new Date(bApproval.split(" ")[0]).getTime()
        break
      case "leadTime":
        const aLeadTime = a.leadTime || calculateLeadTime(a.orderDate, a.completionDate).days
        const bLeadTime = b.leadTime || calculateLeadTime(b.orderDate, b.completionDate).days
        comparison = aLeadTime - bLeadTime
        break
      case "completionDate":
        const aCompletion = a.completionDate ? new Date(a.completionDate.split(" ")[0]).getTime() : 0
        const bCompletion = b.completionDate ? new Date(b.completionDate.split(" ")[0]).getTime() : 0
        comparison = aCompletion - bCompletion
        break
    }
    
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Filter by tab: To Store = Offline + Normal only
  const filteredData = activeTab === "store"
    ? sortedData.filter(item => item.channel === "Offline" && item.orderType !== "Pre-order")
    : sortedData

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
      : <ArrowDown className="h-3 w-3 ml-1 text-primary" />
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  const handleExcelDownload = () => {
    onExcelDownload()
    setDownloadPopoverOpen(false)
  }

  const handleWorkLabelPrint = () => {
    const selected = data.filter(item => selectedItems.includes(item.id))
    onWorkLabelPrint(selected)
    setDownloadPopoverOpen(false)
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => { setActiveTab("customer"); setSelectedItems([]) }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "customer"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            To Customer
          </button>
          <button
            onClick={() => { setActiveTab("store"); setSelectedItems([]) }}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "store"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            To Store
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-sm font-bold">{filteredData.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const selected = filteredData.filter((item) => selectedItems.includes(item.id))
              onPickingListPrint(selected)
            }}
            disabled={selectedItems.length === 0}
            className="gap-2 border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4 w-4" />
            Picking List
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {selectedItems.length}
              </Badge>
            )}
          </Button>
          {activeTab === "store" && (
            <Button
              variant="outline"
              onClick={() => {
                const selected = filteredData.filter((item) => selectedItems.includes(item.id))
                onCreateShipment(selected)
              }}
              disabled={selectedItems.length === 0}
              className="gap-2 border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Outbound Registration
              {selectedItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                  {selectedItems.length}
                </Badge>
              )}
            </Button>
          )}
          <Popover open={downloadPopoverOpen} onOpenChange={setDownloadPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="gap-2 border-border bg-background hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                <button
                  onClick={handleExcelDownload}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Excel Download</div>
                    <div className="text-xs text-muted-foreground">Export based on list</div>
                  </div>
                </button>
                <button
                  onClick={handleWorkLabelPrint}
                  disabled={selectedItems.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Tag className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Work Label Print</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedItems.length > 0 
                        ? `${selectedItems.length} selected` 
                        : "Select checkbox first"}
                    </div>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12 text-center">
              <Checkbox
                checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="text-center">
              <button
                onClick={() => handleSort("orderDate")}
                className="flex items-center justify-center w-full hover:text-primary transition-colors"
              >
                Order Date
                {getSortIcon("orderDate")}
              </button>
            </TableHead>
            <TableHead className="text-center">
              <button 
                onClick={() => handleSort("approvalDate")}
                className="flex items-center justify-center w-full hover:text-primary transition-colors"
              >
                Approval Date
                {getSortIcon("approvalDate")}
              </button>
            </TableHead>
            <TableHead className="text-center">Channel</TableHead>
            <TableHead className="text-center py-4">
              <div className="leading-relaxed">
                Order No. #<br />
                <span className="text-muted-foreground">(Number #)</span>
              </div>
            </TableHead>
            <TableHead className="text-center">Order Tag</TableHead>
            <TableHead className="text-center">
              Store Info
              <br />
              <span className="text-xs text-muted-foreground">(Code / Name)</span>
            </TableHead>
            <TableHead className="text-center">Work Status</TableHead>
            <TableHead className="text-center">Work Type</TableHead>
            <TableHead className="text-center">Processing Period</TableHead>
            <TableHead className="text-center">Worker</TableHead>
            <TableHead className="text-center">Invoice</TableHead>
            <TableHead className="text-center">Picking List</TableHead>
            <TableHead className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => handleSort("leadTime")}
                      className="flex items-center justify-center w-full hover:text-primary transition-colors"
                    >
                      Lead Time
                      <Info className="h-3 w-3 text-primary ml-1" />
                      {getSortIcon("leadTime")}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Days from order date to completion date (or today)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-center">
              <button 
                onClick={() => handleSort("completionDate")}
                className="flex items-center justify-center w-full hover:text-primary transition-colors"
              >
                Completion Date
                {getSortIcon("completionDate")}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id} onClick={() => onDetailClick(item)} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.orderDate}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.approvalDate || item.orderDate}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.channel === "Online" ? "bg-[oklch(0.7_0.15_145)]" : "bg-gray-400"}`} />
                  {item.channel}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="text-primary font-medium underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onDetailClick(item); }}>
                    {item.orderNumber}
                  </span>
                  <span className="text-muted-foreground">
                    ({item.number || "-"})
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center text-sm">
                <Badge 
                  variant="outline" 
                  className={item.orderType === "Pre-order" 
                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                    : "bg-gray-50 text-gray-600 border-gray-200"
                  }
                >
                  {item.orderType}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.storeCode} / {item.storeName}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(item.status)}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.workType || "-"}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.processingPeriod || "-"}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.assignee || "-"}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onInvoicePrint(item); }}
                  className="gap-1"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onPickingListPrint(item); }}
                  className="gap-1"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </Button>
              </TableCell>
              <TableCell className="text-center">
                {item.leadTime ? (
                  <span className="text-sm text-foreground">{item.leadTime} days</span>
                ) : (
                  getLeadTimeDisplay(
                    calculateLeadTime(item.orderDate, item.completionDate).days,
                    calculateLeadTime(item.orderDate, item.completionDate).isOngoing
                  )
                )}
              </TableCell>

              <TableCell className="text-center text-sm">
                {item.completionDate || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select defaultValue="30">
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          1-30 of {totalCount}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
