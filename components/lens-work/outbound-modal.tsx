"use client"

import { useState } from "react"
import { Check, Package, FileText, Printer, Truck, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { WorkItem } from "./work-table"

interface OutboundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: WorkItem[]
  onComplete: () => void
}

type Step = 1 | 2 | 3

interface InvoiceEntry {
  courier: string
  trackingNumber: string
  shippingDate: string
}

const STEPS = [
  { step: 1 as Step, label: "Outbound Registration", icon: Package },
  { step: 2 as Step, label: "Invoice Registration", icon: FileText },
  { step: 3 as Step, label: "Invoice Print", icon: Printer },
]

const COURIERS = ["UPS", "FedEx", "USPS", "DHL", "OnTrac"]

function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 px-4">
      {STEPS.map(({ step, label, icon: Icon }, index) => {
        const isCompleted = currentStep > step
        const isActive = currentStep === step
        const isUpcoming = currentStep < step

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? "text-primary"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-3 mb-5 ${
                  currentStep > step + 1
                    ? "bg-primary"
                    : currentStep === step + 1 || (isActive && !isUpcoming)
                      ? "bg-primary/30"
                      : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const EXCLUDED_STATUSES = ["Completed", "Finalized"]

// Step 1: Outbound Registration
function StepOutboundRegistration({
  items,
  onConfirm,
  onCancel,
}: {
  items: WorkItem[]
  onConfirm: (eligibleItems: WorkItem[]) => void
  onCancel: () => void
}) {
  const eligibleItems = items.filter((item) => !EXCLUDED_STATUSES.includes(item.status))

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {eligibleItems.length} orders selected
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden max-h-[45vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">Order No.</TableHead>
              <TableHead className="text-center">Order Tag</TableHead>
              <TableHead className="text-center">Store</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eligibleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-center text-sm font-medium">
                  {item.orderNumber}
                </TableCell>
                <TableCell className="text-center text-sm">
                  <Badge
                    variant="outline"
                    className={
                      item.orderType === "Pre-order"
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
                <TableCell className="text-center text-sm">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-2">
          <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              Selected orders will be grouped into <strong className="text-foreground">1 outbound shipment</strong> and
              the status will be updated to <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mx-1 text-xs">Outbound Registered</Badge>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={() => onConfirm(eligibleItems)} disabled={eligibleItems.length === 0} className="gap-2">
          <Package className="h-4 w-4" />
          Register Outbound
        </Button>
      </div>
    </div>
  )
}

// Step 2: Invoice Registration
function StepInvoiceRegistration({
  items,
  invoiceEntries,
  onEntriesChange,
  onConfirm,
  onBack,
}: {
  items: WorkItem[]
  invoiceEntries: Record<string, InvoiceEntry>
  onEntriesChange: (entries: Record<string, InvoiceEntry>) => void
  onConfirm: () => void
  onBack: () => void
}) {
  const today = new Date().toISOString().split("T")[0]

  const updateEntry = (id: string, field: keyof InvoiceEntry, value: string) => {
    onEntriesChange({
      ...invoiceEntries,
      [id]: {
        ...invoiceEntries[id],
        [field]: value,
      },
    })
  }

  // Apply same courier & date to all
  const applyToAll = (courier: string, date: string) => {
    const updated = { ...invoiceEntries }
    items.forEach((item) => {
      updated[item.id] = {
        ...updated[item.id],
        courier,
        shippingDate: date,
      }
    })
    onEntriesChange(updated)
  }

  const firstEntry = invoiceEntries[items[0]?.id]
  const allValid = items.every((item) => {
    const entry = invoiceEntries[item.id]
    return entry?.courier && entry?.trackingNumber && entry?.shippingDate
  })

  return (
    <div>
      {/* Bulk apply section */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <p className="text-sm font-medium mb-3">Bulk Apply</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1">Courier</Label>
            <Select
              value={firstEntry?.courier || ""}
              onValueChange={(v) => applyToAll(v, firstEntry?.shippingDate || today)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select courier" />
              </SelectTrigger>
              <SelectContent>
                {COURIERS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1">Shipping Date</Label>
            <Input
              type="date"
              className="h-9"
              value={firstEntry?.shippingDate || today}
              onChange={(e) => applyToAll(firstEntry?.courier || "", e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => applyToAll(firstEntry?.courier || "", firstEntry?.shippingDate || today)}
          >
            Apply All
          </Button>
        </div>
      </div>

      {/* Per-order entries */}
      <div className="border rounded-lg overflow-hidden max-h-[40vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">Order No.</TableHead>
              <TableHead className="text-center">Courier</TableHead>
              <TableHead className="text-center">Tracking Number</TableHead>
              <TableHead className="text-center">Shipping Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => {
              const entry = invoiceEntries[item.id] || {
                courier: "",
                trackingNumber: "",
                shippingDate: today,
              }
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-sm font-medium">
                    {item.orderNumber}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={entry.courier}
                      onValueChange={(v) => updateEntry(item.id, "courier", v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-28 mx-auto">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURIERS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      className="h-8 text-xs w-40 mx-auto text-center"
                      placeholder="Enter tracking no."
                      value={entry.trackingNumber}
                      onChange={(e) =>
                        updateEntry(item.id, "trackingNumber", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="date"
                      className="h-8 text-xs w-36 mx-auto"
                      value={entry.shippingDate}
                      onChange={(e) =>
                        updateEntry(item.id, "shippingDate", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={!allValid} className="gap-2">
          <FileText className="h-4 w-4" />
          Register Invoice
        </Button>
      </div>
    </div>
  )
}

// Step 3: Invoice Print
function StepInvoicePrint({
  items,
  invoiceEntries,
  outboundId,
  onClose,
}: {
  items: WorkItem[]
  invoiceEntries: Record<string, InvoiceEntry>
  outboundId: string
  onClose: () => void
}) {
  const handlePrint = () => {
    window.print()
  }

  const storeGroups = items.reduce(
    (acc, item) => {
      const key = `${item.storeCode} / ${item.storeName}`
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, WorkItem[]>
  )

  return (
    <div>
      {/* Print-ready invoice content */}
      <div className="bg-white border rounded-lg p-6 max-h-[55vh] overflow-y-auto" id="outbound-invoice-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold tracking-wide">GENTLE MONSTER</h2>
            <p className="text-xs text-muted-foreground mt-1">IICOMBINED CO., LTD.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">SHIPPING INVOICE</p>
            <p className="text-xs text-muted-foreground">Outbound ID: {outboundId}</p>
            <p className="text-xs text-muted-foreground">
              Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Sender */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">FROM (WAREHOUSE)</p>
            <p className="text-sm font-medium">IIC RX Lab</p>
            <p className="text-sm text-muted-foreground">2211 E Howell Ave.</p>
            <p className="text-sm text-muted-foreground">Anaheim, CA 92806</p>
            <p className="text-sm text-muted-foreground">United States</p>
          </div>

          {/* Recipient - first store group */}
          {Object.entries(storeGroups).map(([store]) => (
            <div key={store}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">TO (STORE)</p>
              <p className="text-sm font-medium">{store}</p>
              <p className="text-sm text-muted-foreground">Store Address Line 1</p>
              <p className="text-sm text-muted-foreground">Store Address Line 2</p>
            </div>
          ))}
        </div>

        {/* Shipment details table */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground mb-3">SHIPMENT DETAILS</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-xs">Order No.</th>
                <th className="text-left py-2 font-medium text-xs">Courier</th>
                <th className="text-left py-2 font-medium text-xs">Tracking No.</th>
                <th className="text-left py-2 font-medium text-xs">Shipping Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const entry = invoiceEntries[item.id]
                return (
                  <tr key={item.id} className="border-b border-dashed">
                    <td className="py-2 font-medium">{item.orderNumber}</td>
                    <td className="py-2">{entry?.courier}</td>
                    <td className="py-2 font-mono text-xs">{entry?.trackingNumber}</td>
                    <td className="py-2">{entry?.shippingDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Orders</span>
            <span className="font-bold">{items.length}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">GENTLE MONSTER USA</p>
            <p>2211 E Howell Ave., Anaheim, CA, 92806, United States</p>
            <p>rx@gentlemonsterusa.com</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>Outbound registration and invoice registration completed.</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Outbound Modal
export function OutboundModal({ open, onOpenChange, selectedItems, onComplete }: OutboundModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [invoiceEntries, setInvoiceEntries] = useState<Record<string, InvoiceEntry>>({})
  const [outboundId, setOutboundId] = useState("")
  const [eligibleItems, setEligibleItems] = useState<WorkItem[]>([])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setCurrentStep(1)
      setInvoiceEntries({})
      setOutboundId("")
      setEligibleItems([])
    }
    onOpenChange(newOpen)
  }

  const handleStep1Confirm = (items: WorkItem[]) => {
    setEligibleItems(items)

    // Mock: generate outbound ID
    const id = `OB-${Date.now().toString().slice(-8)}`
    setOutboundId(id)

    // Initialize invoice entries with defaults
    const today = new Date().toISOString().split("T")[0]
    const entries: Record<string, InvoiceEntry> = {}
    items.forEach((item) => {
      entries[item.id] = { courier: "", trackingNumber: "", shippingDate: today }
    })
    setInvoiceEntries(entries)

    setCurrentStep(2)
  }

  const handleStep2Confirm = () => {
    setCurrentStep(3)
  }

  const handleClose = () => {
    onComplete()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open && selectedItems.length > 0} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-6xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (currentStep > 1) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Outbound Shipment</DialogTitle>
          <DialogDescription className="sr-only">
            Create outbound shipment for selected orders
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <StepOutboundRegistration
            items={selectedItems}
            onConfirm={handleStep1Confirm}
            onCancel={() => handleOpenChange(false)}
          />
        )}

        {currentStep === 2 && (
          <StepInvoiceRegistration
            items={eligibleItems}
            invoiceEntries={invoiceEntries}
            onEntriesChange={setInvoiceEntries}
            onConfirm={handleStep2Confirm}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepInvoicePrint
            items={eligibleItems}
            invoiceEntries={invoiceEntries}
            outboundId={outboundId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
