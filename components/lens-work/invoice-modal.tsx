"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { WorkItem } from "./work-table"

interface InvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WorkItem | null
}

// Mock invoice data based on order
const getInvoiceData = (item: WorkItem) => {
  const isOnline = item.channel === "Online"
  return {
    orderNo: item.orderNumber,
    number: item.number || "-",
    orderDate: "Dec 28, 2025",
    shippingAddress: isOnline
      ? {
          name: item.customer?.name || "Lucille Chao",
          address: item.customer?.address1 || "1777 Wycliffe Lane",
          cityStateZip: `${item.customer?.city || "San Ramon"}, ${item.customer?.state || "CA"} ${item.customer?.zip || "94582"}`,
          country: "United States",
          tel: `Tel. ${item.customer?.phone || "+19258958088"}`,
        }
      : {
          name: `${item.storeCode} / ${item.storeName}`,
          address: "Store Address Line 1",
          cityStateZip: "Store City, ST 00000",
          country: "United States",
          tel: "",
        },
    customerInfo: isOnline
      ? {
          name: item.customer?.name || "Lucille Chao",
          address: item.customer?.address1 || "1777 Wycliffe Lane",
          cityStateZip: `${item.customer?.city || "San Ramon"}, ${item.customer?.state || "CA"} ${item.customer?.zip || "94582"}`,
          country: "United States",
          tel: `Tel. ${item.customer?.phone || "+19258958088"}`,
        }
      : {
          name: `${item.storeCode} / ${item.storeName}`,
          address: "Store Address Line 1",
          cityStateZip: "Store City, ST 00000",
          country: "United States",
          tel: "",
        },
    items: [
      {
        category: "FRAMES",
        name: "ALTO-01",
        sku: "SKU: ALTO-01",
        description: "",
        price: 305.0,
        tax: 0.0,
        qty: 1,
        itemTotal: 305.0,
      },
      {
        category: "LENS",
        name: "POLY-AR",
        sku: "SKU: POLY-AR",
        description: "Rx Single Vision, Polycarbonate, U.V400 and premium AR Coating",
        price: 240.0,
        tax: 0.0,
        qty: 1,
        itemTotal: 240.0,
      },
    ],
    subtotal: 545.0,
    total: 545.0,
  }
}

export function InvoiceModal({ open, onOpenChange, item }: InvoiceModalProps) {
  if (!item) return null

  const invoice = getInvoiceData(item)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Invoice Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Invoice preview for printing
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="bg-white p-8 border rounded-lg" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>GENTLE MONSTER USA</h1>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-500">#{invoice.orderNo}</p>
              <p className="text-xs text-muted-foreground">({invoice.number})</p>
              <p className="text-sm text-muted-foreground mt-1">{invoice.orderDate}</p>
            </div>
          </div>

          {/* Red divider */}
          <div className="h-0.5 bg-orange-400 mb-6" />

          {/* Shipping Address & Customer */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground mb-3">SHIPPING ADDRESS</p>
              <p className="text-sm">{invoice.shippingAddress.name}</p>
              <p className="text-sm">{invoice.shippingAddress.address}</p>
              <p className="text-sm">{invoice.shippingAddress.cityStateZip}</p>
              <p className="text-sm">{invoice.shippingAddress.country}</p>
              {invoice.shippingAddress.tel && (
                <p className="text-sm">{invoice.shippingAddress.tel}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground mb-3">CUSTOMER</p>
              <p className="text-sm">{invoice.customerInfo.name}</p>
              <p className="text-sm">{invoice.customerInfo.address}</p>
              <p className="text-sm">{invoice.customerInfo.cityStateZip}</p>
              <p className="text-sm">{invoice.customerInfo.country}</p>
              {invoice.customerInfo.tel && (
                <p className="text-sm">{invoice.customerInfo.tel}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-bold tracking-wider text-muted-foreground border-b border-muted pb-2 mb-4">
              <div className="col-span-5">ITEMS</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-1 text-right">TAX</div>
              <div className="col-span-1 text-center">QTY</div>
              <div className="col-span-3 text-right">ITEM TOTAL</div>
            </div>

            {/* Items */}
            {invoice.items.map((orderItem, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start py-4 border-b border-muted/50">
                <div className="col-span-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider bg-muted px-2 py-0.5 rounded">
                      {orderItem.category}
                    </span>
                    <span className="text-sm font-semibold">{orderItem.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{orderItem.sku}</p>
                  {orderItem.description && (
                    <p className="text-xs text-muted-foreground mt-1">{orderItem.description}</p>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm">${orderItem.price.toFixed(2)}</div>
                <div className="col-span-1 text-right text-sm">${orderItem.tax.toFixed(2)}</div>
                <div className="col-span-1 text-center text-sm">{orderItem.qty}</div>
                <div className="col-span-3 text-right text-sm">${orderItem.itemTotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-muted pt-2" />
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL (USD)</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Thank you message */}
          <div className="border-t border-muted/50 pt-8 pb-4">
            <p className="text-sm text-center text-muted-foreground mb-8">Thank you for shopping with us!</p>

            {/* Footer */}
            <div className="text-center text-sm">
              <p className="font-bold mb-1">Gentle Monster USA</p>
              <p className="text-muted-foreground">2211 E Howell Ave., Anaheim, CA, 92806, United States</p>
              <p className="text-muted-foreground">cs.us@gentlemonster.com</p>
              <p className="text-muted-foreground">gentlemonster.store</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
