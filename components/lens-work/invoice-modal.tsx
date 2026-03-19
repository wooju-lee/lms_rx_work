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
  return {
    invoiceNumber: item.orderNumber,
    invoiceDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      shippingAddress: "123 Main Street, Los Angeles, California, 90001, United States",
      billingAddress: "123 Main Street, Los Angeles, California, 90001, United States",
    },
    paymentMethod: "Paying with Debit or Credit Card",
    items: [
      {
        category: "Frame Used for Prescription Lenses",
        name: "Odd 01",
        variant: "Black / Clear",
        quantity: 1,
        price: 315,
        total: 315,
      },
      {
        category: "Prescription Lenses",
        name: "SINGLE VISION IMPACT-RESISTANT POLYCARBONATE",
        variant: "UV PROTECTION PLATINUM AR COATING",
        quantity: 1,
        price: 240,
        total: 240,
      },
    ],
    subtotal: 555,
    shipping: "FREE",
    salesTax: 0,
    total: 555,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Invoice Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Invoice preview for printing
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="bg-white p-6 border rounded-lg" id="invoice-content">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide">GENTLE MONSTER</h1>
          </div>

          {/* Invoice Number */}
          <div className="text-center mb-4">
            <p className="text-base font-bold">INVOICE #{invoice.invoiceNumber}</p>
          </div>

          {/* Date */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">{invoice.invoiceDate}</p>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h2 className="font-semibold text-sm mb-3">CUSTOMER INFORMATION</h2>
            <div>
              <p className="text-sm font-medium text-primary mb-1">Shipping Address</p>
              <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.customer.shippingAddress}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="font-semibold text-sm mb-4">ORDER INFORMATION</h2>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 mb-3 text-sm font-medium border-b pb-2">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>

            {/* Items */}
            {invoice.items.map((orderItem, index) => (
              <div key={index} className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">{orderItem.category}</p>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <p className="text-sm font-medium">{orderItem.name}</p>
                    <p className="text-xs text-muted-foreground">{orderItem.variant}</p>
                  </div>
                  <div className="col-span-2 text-center text-sm">{orderItem.quantity}</div>
                  <div className="col-span-2 text-right text-sm">${orderItem.price}</div>
                  <div className="col-span-2 text-right text-sm">${orderItem.total}</div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <div className="text-right">
                  <span>${invoice.total}</span>
                  <p className="text-xs text-muted-foreground font-normal">Taxes and duties included</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-6">
            <p className="text-sm mb-4">Thank you for shopping with us.</p>
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">GENTLE MONSTER USA</p>
              <p>2211 E Howell Ave., Anaheim, CA, 92806, United States</p>
              <p>rx@gentlemonsterusa.com</p>
              <p>gentlemonsterusa.com</p>
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
