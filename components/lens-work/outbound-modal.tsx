"use client"

import { useState } from "react"
import { Check, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

const EXCLUDED_STATUSES = ["Completed", "Finalized"]

export function OutboundModal({ open, onOpenChange, selectedItems, onComplete }: OutboundModalProps) {
  const [isCompleted, setIsCompleted] = useState(false)

  const eligibleItems = selectedItems.filter((item) => !EXCLUDED_STATUSES.includes(item.status))

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsCompleted(false)
    }
    onOpenChange(newOpen)
  }

  const handleConfirm = () => {
    console.log("TMS Outbound Registration:", {
      items: eligibleItems.map((item) => ({
        orderId: item.id,
        orderNumber: item.orderNumber,
        storeCode: item.storeCode,
        storeName: item.storeName,
      })),
    })
    setIsCompleted(true)
  }

  const handleClose = () => {
    onComplete()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open && selectedItems.length > 0} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Outbound Shipment</DialogTitle>
          <DialogDescription className="sr-only">
            Create outbound shipment for selected orders
          </DialogDescription>
        </DialogHeader>

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
                  Selected orders will be sent to TMS for outbound registration and
                  the status will be updated to <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mx-1 text-xs">Outbound Registered</Badge>.
                </p>
              </div>
            </div>
          </div>

          {isCompleted ? (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Outbound registration completed. Orders have been sent to TMS.</span>
              </div>
              <Button onClick={handleClose}>
                OK
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={handleConfirm} disabled={eligibleItems.length === 0} className="gap-2">
                <Package className="h-4 w-4" />
                Register Outbound
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
