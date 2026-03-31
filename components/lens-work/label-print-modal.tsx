"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LabelPrintModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    orderNumber: string
    storeCode: string
    storeName: string
    customer: {
      name: string
      phone: string
      address1: string
      address2: string
      city: string
      state: string
      zip: string
    }
  } | null
}

export function LabelPrintModal({ open, onOpenChange, item }: LabelPrintModalProps) {
  if (!item) return null

  const shipDate = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase().replace(/ /g, "")
  const trkNumber = `3999 ${String(Math.floor(Math.random() * 9000) + 1000)} ${String(Math.floor(Math.random() * 9000) + 1000)}`
  const refNumber = `TEST-ORD-${item.orderNumber.slice(-8)}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Printer className="h-4 w-4" />
            Label Print Preview
          </DialogTitle>
        </DialogHeader>

        {/* Label Preview */}
        <div className="p-5">
          <div className="border-2 border-black bg-white text-black font-mono text-[11px] leading-tight">
            {/* Top Section - FROM / SHIP INFO */}
            <div className="flex border-b-2 border-black">
              {/* Left - FROM */}
              <div className="flex-1 p-2.5 border-r-2 border-black">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[9px] font-bold">FROM:</span>
                  <span className="text-[10px]">17143371224</span>
                </div>
                <div className="font-bold text-[10px] leading-snug">
                  GENTLE MONSTER<br />
                  GENTLE MONSTER<br />
                  16221 HERON AVE
                </div>
                <div className="text-[10px] mt-0.5">
                  La Mirada CA 90638<br />
                  US
                </div>
              </div>
              {/* Right - SHIP INFO */}
              <div className="w-[180px] p-2.5 text-[9px]">
                <div>SHIP DATE: {shipDate}</div>
                <div>ACTWGT: 1.54 LB</div>
                <div>CAD: 264137732/WSXI3700</div>
                <div>DIMMED: 15 X 11 X 7 IN</div>
                <div className="mt-1.5 pt-1.5 border-t border-black text-[9px]">
                  BILL SENDER<br />
                  EEI: NO EEI 30.37(f)
                </div>
              </div>
            </div>

            {/* TO Section */}
            <div className="flex border-b-2 border-black">
              <div className="flex-1 p-2.5">
                <div className="flex items-start gap-1">
                  <span className="text-[9px] font-bold">TO</span>
                  <div>
                    <div className="font-bold text-sm">{item.customer.name}</div>
                    <div className="font-bold text-[11px]">{item.storeName}</div>
                    <div className="font-bold text-sm mt-1.5">{item.customer.address1}</div>
                    <div className="mt-3">
                      <div className="font-bold text-[11px]">{item.customer.city} {item.customer.state} {item.customer.zip}</div>
                      <div className="font-bold text-[11px]">{item.customer.phone}</div>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] mt-1.5">
                      <span>REF: {refNumber}</span>
                    </div>
                    <div className="flex items-center gap-8 text-[9px]">
                      <span>INV:</span>
                    </div>
                    <div className="flex items-center gap-8 text-[9px]">
                      <span>PO:</span>
                      <span>DEPT:</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right side - Country + Barcode area */}
              <div className="w-[100px] p-2 flex flex-col items-center justify-between">
                <div className="text-[9px] font-bold text-right w-full">(US)</div>
                <div className="flex flex-col items-center gap-1 my-2">
                  <div className="font-bold text-sm tracking-wider">FedEx</div>
                  <div className="text-[8px]">Ground</div>
                </div>
                <div className="bg-black text-white font-bold text-[10px] px-2 py-0.5 rounded-sm">
                  ETD
                </div>
              </div>
            </div>

            {/* Barcode Section 1 */}
            <div className="border-b-2 border-black p-2.5">
              {/* Barcode placeholder */}
              <div className="h-12 bg-[repeating-linear-gradient(90deg,black_0px,black_2px,white_2px,white_4px,black_4px,black_5px,white_5px,white_8px)] mb-2" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] mr-1">TRK#</span>
                  <span className="font-bold text-lg tracking-wider">{trkNumber}</span>
                </div>
                <span className="font-bold text-base tracking-widest">INTL</span>
              </div>
            </div>

            {/* Bottom Section - Zip + Barcode */}
            <div className="p-2.5">
              <div className="text-right font-bold text-xl mb-2 tracking-wider">
                {item.customer.zip}
              </div>
              <div className="text-center text-[9px] mb-1">
                9632 0026 6 (000 000 0000) 0 00 {trkNumber}
              </div>
              {/* Barcode placeholder */}
              <div className="h-16 bg-[repeating-linear-gradient(90deg,black_0px,black_1px,white_1px,white_3px,black_3px,black_5px,white_5px,white_6px,black_6px,black_7px,white_7px,white_10px)]" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-5 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs px-4"
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs px-4 gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
