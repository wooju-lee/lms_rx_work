"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { FilterSection } from "@/components/lens-work/filter-section"
import { WorkTable, type WorkItem } from "@/components/lens-work/work-table"
import { ProcessingStats } from "@/components/lens-work/processing-stats"
import { InvoiceModal } from "@/components/lens-work/invoice-modal"

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
  
  processingPeriods.forEach(({ period, count }) => {
    for (let i = 0; i < count; i++) {
      const store = stores[id % stores.length]
      const status = statuses[id % statuses.length]
      const channel = channels[id % channels.length]
      const isCompleted = status === "Completed" || status === "Finalized"
      const orderType = preOrderIds.includes(id) ? "Pre-order" : "Normal"
      
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

  const handleSearch = () => {
    console.log("[v0] Search triggered")
  }

  const handleExcelDownload = () => {
    // 엑셀 다운로드 - 리스트 기준 출력
  }

  const handleDetailClick = (item: WorkItem) => {
    router.push(`/work/${item.id}`)
  }

  const handleInvoicePrint = (item: WorkItem) => {
    setSelectedInvoiceItem(item)
    setInvoiceModalOpen(true)
  }

  const handleShippingTransmit = (item: WorkItem) => {
    // 송장 전송
  }

  const handleWorkLabelPrint = (selectedItems: WorkItem[]) => {
    // 작업 라벨 출력 - 체크박스 선택된 주문에 대한 라벨 출력
  }

  const handleCreateShipment = () => {
    // 출고 생성
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
            onShippingTransmit={handleShippingTransmit}
            onExcelDownload={handleExcelDownload}
            onWorkLabelPrint={handleWorkLabelPrint}
            onCreateShipment={handleCreateShipment}
          />

          {/* Invoice Modal */}
          <InvoiceModal
            open={invoiceModalOpen}
            onOpenChange={setInvoiceModalOpen}
            item={selectedInvoiceItem}
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
