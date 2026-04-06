"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { OutboundModal } from "@/components/lens-work/outbound-modal"
import { AppHeader } from "@/components/app-header"
import { FilterSection } from "@/components/lens-work/filter-section"
import { WorkTable, type WorkItem } from "@/components/lens-work/work-table"
import { ProcessingStats } from "@/components/lens-work/processing-stats"
import { InvoiceModal } from "@/components/lens-work/invoice-modal"
import { PickingListModal } from "@/components/lens-work/picking-list-modal"

// Helper to generate sample data with correct distribution to match stats
// Stats: (Basic) IIC Lab: 7, (Basic) Lab 1: 5, (Basic) Lab 2: 3, (Tint) IIC Lab: 9, (Tint) Lab 1: 4, (Tint) Lab 2: 2 = Total 30
const generateSampleData = (): WorkItem[] => {
  const items: WorkItem[] = []
  let id = 1
  
  const statuses: WorkItem["status"][] = ["Pending", "Inspection", "In Progress", "Completed", "Finalized"]
  const channels: WorkItem["channel"][] = ["Online", "Offline"]
  const stores = [
    { code: "US1001", name: "US_STORE_1" },
    { code: "US1002", name: "US_STORE_2" },
    { code: "US1003", name: "US_STORE_3" },
    { code: "US1004", name: "US_ONLINE" },
  ]
  const assignees = ["sam_01", "sam_02", "monster1437"]
  const workTypes = ["IN HOUSE", "OUTSOURCED"]
  
  const processingPeriods = [
    { period: "(Basic) IIC Lab", count: 7 },
    { period: "(Basic) Lab 1", count: 5 },
    { period: "(Basic) Lab 2", count: 3 },
    { period: "(Tint) IIC Lab", count: 9 },
    { period: "(Tint) Lab 1", count: 4 },
    { period: "(Tint) Lab 2", count: 2 },
  ]
  
  // 25 Normal, 5 Pre-order
  const preOrderIds = [3, 8, 14, 21, 27] // 5 Pre-order items spread across the list
  // IDs that have cancel/return status for sample data
  const cancelIds = [2, 7, 16, 22] // Cancel: only for non-Completed/Finalized
  const returnIds = [4, 9, 19, 24] // Refund: only for Completed/Finalized

  processingPeriods.forEach(({ period, count }) => {
    for (let i = 0; i < count; i++) {
      const status = statuses[id % statuses.length]
      const channel = channels[id % channels.length]
      const offlineStores = [stores[0], stores[1], stores[2]] // US_STORE_1~3
      const store = channel === "Online"
        ? stores[3] // US1004 / US_ONLINE
        : offlineStores[id % offlineStores.length]
      const isCompleted = status === "Completed" || status === "Finalized"
      const orderType = preOrderIds.includes(id) ? "Pre-order" : "Normal"

      // Cancel/Return status: Cancel only when NOT Completed/Finalized, Return only when Completed/Finalized
      let cancelReturnStatus: "Cancel" | "Refund" | undefined = undefined
      if (cancelIds.includes(id) && !isCompleted) {
        cancelReturnStatus = "Cancel"
      } else if (returnIds.includes(id) && isCompleted) {
        cancelReturnStatus = "Refund"
      }

      items.push({
        id: String(id),
        orderDate: `2025-08-${String(10 + (id % 20)).padStart(2, "0")} ${10 + (id % 12)}:00 (PST)`,
        approvalDate: `2025-08-${String(10 + (id % 20)).padStart(2, "0")} ${10 + (id % 12)}:00 (PST)`,
        orderNumber: `6060606060${String(60000 + id).padStart(5, "0")}`,
        orderType,
        number: String(1000 + id),
        channel,
        storeCode: store.code,
        storeName: store.name,
        status,
        workType: workTypes[id % workTypes.length],
        processingPeriod: period,
        assignee: assignees[id % assignees.length],
        leadTime: 5 + (id % 15),
        completionDate: isCompleted ? `2025-09-${String(1 + (id % 28)).padStart(2, "0")} 11:00 (PST)` : undefined,
        cancelReturnStatus,
      })
      id++
    }
  })
  
  return items
}

const sampleData: WorkItem[] = generateSampleData()

export default function LensWorkManagement() {
  const router = useRouter()
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<WorkItem | null>(null)
  const [outboundModalOpen, setOutboundModalOpen] = useState(false)
  const [outboundSelectedItems, setOutboundSelectedItems] = useState<WorkItem[]>([])
  const [outboundRegisteredIds, setOutboundRegisteredIds] = useState<Set<string>>(new Set())
  const [pickingListModalOpen, setPickingListModalOpen] = useState(false)
  const [pickingListItems, setPickingListItems] = useState<WorkItem[]>([])

  const handleSearch = () => {
    console.log("[v0] Search triggered")
  }

  const handleExcelDownload = () => {
    // 엑셀 다운로드 - 리스트 기준 출력
  }

  const handleDetailClick = (item: WorkItem, tab: "customer" | "store") => {
    router.push(`/work/${item.id}?tab=${tab}`)
  }

  const handleInvoicePrint = (item: WorkItem) => {
    setSelectedInvoiceItem(item)
    setInvoiceModalOpen(true)
  }

  const handlePickingListPrint = (items: WorkItem | WorkItem[]) => {
    const itemArray = Array.isArray(items) ? items : [items]
    setPickingListItems(itemArray)
    setPickingListModalOpen(true)
  }

  const handleShippingTransmit = (item: WorkItem) => {
    // 송장 전송
  }

  const handleWorkLabelPrint = (selectedItems: WorkItem[]) => {
    // 작업 라벨 출력 - 체크박스 선택된 주문에 대한 라벨 출력
  }

  const handleCreateShipment = (selectedItems: WorkItem[]) => {
    setOutboundSelectedItems(selectedItems)
    setOutboundModalOpen(true)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <span className="text-muted-foreground">Rx (LMS)</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lens Work Management</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-primary font-medium">Lens Work Management</span>
          </nav>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Lens Work Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage RX order list from online/offline channels.
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <FilterSection
              onSearch={handleSearch}
            />
          </div>

          {/* Processing Stats - New Section */}
          <div className="mb-6">
            <ProcessingStats />
          </div>

          {/* Work Table */}
          <WorkTable
            data={sampleData}
            onDetailClick={handleDetailClick}
            onInvoicePrint={handleInvoicePrint}
            onPickingListPrint={handlePickingListPrint}
            onShippingTransmit={handleShippingTransmit}
            onExcelDownload={handleExcelDownload}
            onWorkLabelPrint={handleWorkLabelPrint}
            onCreateShipment={handleCreateShipment}
            outboundRegisteredIds={outboundRegisteredIds}
          />

          {/* Outbound Modal */}
          <OutboundModal
            open={outboundModalOpen}
            onOpenChange={setOutboundModalOpen}
            selectedItems={outboundSelectedItems}
            onComplete={() => {
              setOutboundRegisteredIds((prev) => {
                const next = new Set(prev)
                outboundSelectedItems.forEach((item) => next.add(item.id))
                return next
              })
            }}
          />

          {/* Invoice Modal */}
          <InvoiceModal
            open={invoiceModalOpen}
            onOpenChange={setInvoiceModalOpen}
            item={selectedInvoiceItem}
          />


          {/* Picking List Modal */}
          <PickingListModal
            open={pickingListModalOpen}
            onOpenChange={setPickingListModalOpen}
            items={pickingListItems}
          />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-card">
          <span>© 2025 IICOMBINED CO., LTD. ALL RIGHTS RESERVED.</span>
          <span>V.1.0.0</span>
        </footer>
      </div>
    </div>
  )
}
