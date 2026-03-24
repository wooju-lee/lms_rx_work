"use client"

import { useRef } from "react"
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

interface PickingListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WorkItem[]
}

// Mock data generator for picking list fields
function getPickingData(item: WorkItem) {
  const isOnline = item.channel === "Online"
  const isPreOrder = item.orderType === "Pre-order"

  return {
    orderNo: item.orderNumber,
    orderDate: item.orderDate?.split(" ")[0] || "-",
    orderType: item.channel,
    orderTypeClass: isOnline ? "online" : "offline",
    orderTag: item.orderType,
    orderTagClass: isPreOrder ? "preorder" : "normal",
    isPreOrder,
    pickupDate: isPreOrder ? "2025-09-15" : "",
    launchDate: isPreOrder ? "2025-09-20" : "",
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (310) 555-0147",
    },
    shipType: isOnline ? "Ship to Address" : "Ship to Store",
    shipTypeClass: isOnline ? "online" : "offline",
    shipTypeIcon: isOnline ? "📦" : "🏬",
    address: {
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
    },
    items: [
      {
        type: "Frame",
        typeClass: "normal",
        productId: "GM-ODD01-BK",
        productName: "Odd 01 Black",
        mappedProduct: "GM-ODD01-BK-52",
        qty: 1,
        totalPrice: "$315.00",
        cof: "-",
      },
      {
        type: "Lens",
        typeClass: "normal",
        productId: "RX-SV-POLY",
        productName: "Single Vision Polycarbonate",
        mappedProduct: "PLATINUM AR COATING",
        qty: 1,
        totalPrice: "$240.00",
        cof: "C",
      },
    ],
    rx: {
      od: { sph: "-2.00", cyl: "-0.75", axis: "180", add: "-", pd: "32" },
      os: { sph: "-1.75", cyl: "-0.50", axis: "175", add: "-", pd: "31" },
    },
    comments: [
      { author: "sam_01", date: "2025-08-15 10:30", body: "Rush order - priority processing" },
    ],
  }
}

function TicketHTML({ item, index, total }: { item: WorkItem; index: number; total: number }) {
  const data = getPickingData(item)

  return (
    <div className="picking-ticket">
      {/* Header */}
      <div className="picking-header">
        <div>
          <h1 className="picking-title">📋 PICKING LIST</h1>
          <div style={{ marginTop: 4 }}>
            <span className={`picking-badge ${data.orderTypeClass}`}>{data.orderType}</span>
          </div>
        </div>
        <div className="picking-meta">
          <div className="picking-order-no">#{data.orderNo}</div>
          <div>Order Date: {data.orderDate}</div>
        </div>
      </div>

      {/* Customer Information */}
      <div>
        <div className="picking-section-header">
          <span className="picking-section-title">Customer Information</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className={`picking-badge ${data.orderTagClass}`}>{data.orderTag}</span>
            {data.isPreOrder && (
              <>
                <span style={{ fontSize: 11, color: "#555" }}>Pickup: {data.pickupDate}</span>
                <span style={{ fontSize: 11, color: "#555" }}>Launch: {data.launchDate}</span>
              </>
            )}
          </div>
        </div>
        <div className="picking-info-grid">
          <div className="picking-info-row" style={{ gridColumn: "span 2" }}>
            <span className="picking-info-label">Customer Name</span>
            <span className="picking-info-value">{data.customer.name}</span>
          </div>
          <div className="picking-info-row" style={{ gridColumn: "span 2" }}>
            <span className="picking-info-label">Email</span>
            <span className="picking-info-value">{data.customer.email}</span>
          </div>
          <div className="picking-info-row">
            <span className="picking-info-label">Phone</span>
            <span className="picking-info-value">{data.customer.phone}</span>
          </div>
          <div className="picking-info-row" style={{ gridColumn: "span 2" }}>
            <span className="picking-info-label">Shipping Address</span>
            <span className="picking-info-value">
              <span className={`picking-badge ${data.shipTypeClass}`} style={{ fontSize: 11, marginBottom: 4, display: "inline-block" }}>
                {data.shipTypeIcon} {data.shipType}
              </span>
              <br />
              {data.address.line1}
              <br />
              {data.address.line2}
              <br />
              <span style={{ fontSize: 12, color: "#888" }}>CITY</span>&nbsp;&nbsp;{data.address.city}&nbsp;&nbsp;&nbsp;
              <span style={{ fontSize: 12, color: "#888" }}>STATE</span>&nbsp;&nbsp;{data.address.state}&nbsp;&nbsp;&nbsp;
              <span style={{ fontSize: 12, color: "#888" }}>ZIP</span>&nbsp;&nbsp;{data.address.zip}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="picking-section-title">Order Items</div>
        <table className="picking-product-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Product Info</th>
              <th>Mapped Product</th>
              <th>Qty</th>
              <th>Total Price</th>
              <th>C.O.F</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((orderItem, i) => (
              <tr key={i}>
                <td>
                  <span className={`picking-badge ${orderItem.typeClass}`} style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                    {orderItem.type}
                  </span>
                </td>
                <td style={{ textAlign: "left" }}>
                  {orderItem.productId} | {orderItem.productName}
                </td>
                <td style={{ textAlign: "left" }}>{orderItem.mappedProduct}</td>
                <td>{orderItem.qty}</td>
                <td>{orderItem.totalPrice}</td>
                <td>{orderItem.cof}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prescription Values */}
      <div>
        <div className="picking-section-title">Prescription Values</div>
        <table>
          <thead>
            <tr>
              <th>Eye</th>
              <th>SPH</th>
              <th>CYL</th>
              <th>AXIS</th>
              <th>ADD</th>
              <th>PD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="picking-td-label">OD (Right)</td>
              <td>{data.rx.od.sph}</td>
              <td>{data.rx.od.cyl}</td>
              <td>{data.rx.od.axis}</td>
              <td>{data.rx.od.add}</td>
              <td>{data.rx.od.pd}</td>
            </tr>
            <tr>
              <td className="picking-td-label">OS (Left)</td>
              <td>{data.rx.os.sph}</td>
              <td>{data.rx.os.cyl}</td>
              <td>{data.rx.os.axis}</td>
              <td>{data.rx.os.add}</td>
              <td>{data.rx.os.pd}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comments */}
      {data.comments.length > 0 && (
        <div>
          <div className="picking-section-title">Comments</div>
          <div className="picking-comment-list">
            {data.comments.map((comment, i) => (
              <div key={i} className="picking-comment-item">
                <div className="picking-comment-meta">
                  <span className="picking-comment-author">{comment.author}</span>
                  <span className="picking-comment-date">{comment.date}</span>
                </div>
                <div className="picking-comment-body">{comment.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="picking-bottom-row">
        <div className="picking-sign-area">
          <div className="picking-sign-box">
            <div className="picking-sign-line" />
            <div className="picking-sign-label">Picked by</div>
          </div>
          <div className="picking-sign-box">
            <div className="picking-sign-line" />
            <div className="picking-sign-label">Checked by</div>
          </div>
          <div className="picking-sign-box">
            <div className="picking-sign-line" />
            <div className="picking-sign-label">Packed by</div>
          </div>
        </div>
        <div className="picking-footer-note">
          IIC BO — Picking List &nbsp;|&nbsp; {index} / {total}
        </div>
      </div>
    </div>
  )
}

export function PickingListModal({ open, onOpenChange, items }: PickingListModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Picking List</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>${printRef.current.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  if (items.length === 0) return null

  // Group items into pairs for 2-up layout (2 tickets per A4 landscape page)
  const pages: WorkItem[][] = []
  for (let i = 0; i < items.length; i += 2) {
    pages.push(items.slice(i, i + 2))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            Picking List Preview ({items.length} orders)
          </DialogTitle>
          <DialogDescription className="sr-only">
            Picking list preview for printing
          </DialogDescription>
        </DialogHeader>

        {/* Preview Area */}
        <div ref={printRef}>
          {pages.map((pageItems, pageIdx) => (
            <div key={pageIdx} className="picking-page">
              {pageItems.map((item, ticketIdx) => (
                <TicketHTML
                  key={item.id}
                  item={item}
                  index={pageIdx * 2 + ticketIdx + 1}
                  total={items.length}
                />
              ))}
              {/* If odd number of items, fill the empty half */}
              {pageItems.length === 1 && <div className="picking-ticket" />}
            </div>
          ))}
        </div>

        {/* Print Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Picking List
          </Button>
        </div>

        {/* Embedded styles for preview */}
        <style>{PREVIEW_STYLES}</style>
      </DialogContent>
    </Dialog>
  )
}

const PREVIEW_STYLES = `
  .picking-page {
    display: flex;
    flex-direction: row;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    background: white;
    min-height: 500px;
  }
  .picking-ticket {
    width: 50%;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #222;
  }
  .picking-ticket:first-child {
    border-right: 2px dashed #bbb;
  }
  .picking-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #222;
    padding-bottom: 7px;
  }
  .picking-title {
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
  }
  .picking-meta {
    text-align: right;
    font-size: 11px;
    color: #444;
  }
  .picking-order-no {
    font-size: 13px;
    font-weight: bold;
    color: #0066cc;
  }
  .picking-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 11px;
  }
  .picking-badge.online { background: #e0f0ff; color: #0066cc; }
  .picking-badge.offline { background: #fff0e0; color: #cc6600; }
  .picking-badge.normal { background: #e8f5e9; color: #2e7d32; }
  .picking-badge.preorder { background: #fff3e0; color: #e65100; }

  .picking-section-title {
    font-size: 10px;
    font-weight: bold;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }
  .picking-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-top: 6px;
    padding-bottom: 6px;
    margin-bottom: 5px;
  }
  .picking-section-header .picking-section-title {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .picking-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }
  .picking-info-row {
    display: flex;
    gap: 5px;
  }
  .picking-info-label {
    color: #888;
    min-width: 100px;
    font-size: 11px;
  }
  .picking-info-value {
    font-weight: 500;
    font-size: 12px;
    line-height: 1.6;
  }

  .picking-ticket table {
    width: 100%;
    border-collapse: collapse;
  }
  .picking-ticket thead tr {
    background: #f4f4f4;
  }
  .picking-ticket th {
    padding: 5px 6px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #ddd;
    font-size: 10px;
    color: #444;
  }
  .picking-ticket td {
    padding: 5px 6px;
    text-align: center;
    border: 1px solid #ddd;
    font-size: 11px;
  }
  .picking-td-label {
    text-align: left !important;
    font-weight: bold;
    background: #fafafa;
    color: #555;
  }

  .picking-comment-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .picking-comment-item {
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
  .picking-comment-item:last-child { border-bottom: none; }
  .picking-comment-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 2px;
  }
  .picking-comment-author { font-weight: bold; font-size: 11px; }
  .picking-comment-date { font-size: 10px; color: #999; }
  .picking-comment-body { font-size: 12px; color: #333; }

  .picking-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
    padding-top: 6px;
    border-top: 1px solid #eee;
  }
  .picking-sign-area { display: flex; gap: 20px; }
  .picking-sign-box { text-align: center; }
  .picking-sign-line { width: 70px; border-bottom: 1px solid #aaa; height: 18px; }
  .picking-sign-label { font-size: 10px; color: #888; margin-top: 2px; }
  .picking-footer-note { font-size: 10px; color: #bbb; }
`

const PRINT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 15px; color: #222; background: #fff; }

  .picking-page {
    width: 297mm;
    height: 210mm;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    page-break-after: always;
  }
  .picking-page:last-child { page-break-after: avoid; }

  .picking-ticket {
    width: 50%;
    height: 210mm;
    padding: 10mm 12mm;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .picking-ticket:first-child { border-right: 2px dashed #bbb; }

  .picking-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #222;
    padding-bottom: 7px;
  }
  .picking-title { font-size: 17px; font-weight: bold; letter-spacing: 1px; }
  .picking-meta { text-align: right; font-size: 13px; color: #444; }
  .picking-order-no { font-size: 15px; font-weight: bold; color: #0066cc; }

  .picking-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }
  .picking-badge.online  { background: #e0f0ff; color: #0066cc; }
  .picking-badge.offline { background: #fff0e0; color: #cc6600; }
  .picking-badge.normal  { background: #e8f5e9; color: #2e7d32; }
  .picking-badge.preorder{ background: #fff3e0; color: #e65100; }

  .picking-section-title { font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 5px; }
  .picking-section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-top: 6px; padding-bottom: 6px; margin-bottom: 5px; }
  .picking-section-header .picking-section-title { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  .picking-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
  .picking-info-row { display: flex; gap: 5px; }
  .picking-info-label { color: #888; min-width: 110px; font-size: 12px; }
  .picking-info-value { font-weight: 500; font-size: 13px; line-height: 1.8; }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f4f4f4; }
  th { padding: 7px 7px; text-align: center; font-weight: bold; border: 1px solid #ddd; font-size: 12px; color: #444; }
  td { padding: 7px 7px; text-align: center; border: 1px solid #ddd; font-size: 13px; }
  .picking-td-label { text-align: left; font-weight: bold; background: #fafafa; color: #555; }
  .picking-product-table td { text-align: left; }
  .picking-product-table td.center { text-align: center; }

  .picking-comment-list { display: flex; flex-direction: column; gap: 5px; }
  .picking-comment-item { border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .picking-comment-item:last-child { border-bottom: none; }
  .picking-comment-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 2px; }
  .picking-comment-author { font-weight: bold; font-size: 12px; }
  .picking-comment-date { font-size: 11px; color: #999; }
  .picking-comment-body { font-size: 13px; color: #333; }

  .picking-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 6px; border-top: 1px solid #eee; }
  .picking-sign-area { display: flex; gap: 20px; }
  .picking-sign-box { text-align: center; }
  .picking-sign-line { width: 80px; border-bottom: 1px solid #aaa; height: 20px; }
  .picking-sign-label { font-size: 11px; color: #888; margin-top: 2px; }
  .picking-footer-note { font-size: 11px; color: #bbb; }

  @media print {
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; }
    .picking-page { width: 297mm; height: 210mm; }
  }
`
