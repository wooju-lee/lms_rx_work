"use client"

import { useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronRight,
  ArrowLeft,
  Package,
  User,
  Eye,
  FileText,
  Printer,
  Truck,
  MapPin,
  Store,
  ExternalLink,
  Image as ImageIcon,
  FolderOpen,
  X,
  Trash2,
  Plus,
  Check,
  Info,
  UserCog,
  Activity,
  Wrench,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InvoiceModal } from "@/components/lens-work/invoice-modal"
import { LabelPrintModal } from "@/components/lens-work/label-print-modal"
import { CancelReturnModal, getCancelAvailability, getReturnAvailability } from "@/components/lens-work/cancel-return-modal"
import { toast } from "sonner"

// Replicate list page data generation to keep detail in sync
const getListItemData = (numId: number) => {
  const statuses = ["Pending", "Inspection", "In Progress", "Completed", "Finalized"]
  const channels = ["Online", "Offline"]
  const stores = [
    { code: "US1001", name: "US_STORE_1" },
    { code: "US1002", name: "US_STORE_2" },
    { code: "US1003", name: "US_STORE_3" },
    { code: "US1004", name: "US_ONLINE" },
  ]
  const workTypes = ["IN HOUSE", "OUTSOURCED"]
  const assignees = ["sam_01", "sam_02", "monster1437"]
  const preOrderIds = [3, 8, 14, 21, 27]

  // Processing period mapping: same iteration order as list page
  const processingPeriods = [
    { period: "(Basic) IIC Lab", range: [1, 7] },
    { period: "(Basic) Lab 1", range: [8, 12] },
    { period: "(Basic) Lab 2", range: [13, 15] },
    { period: "(Tint) IIC Lab", range: [16, 24] },
    { period: "(Tint) Lab 1", range: [25, 28] },
    { period: "(Tint) Lab 2", range: [29, 30] },
  ]

  const status = statuses[numId % statuses.length]
  const channel = channels[numId % channels.length]
  const offlineStores = [stores[0], stores[1], stores[2]]
  const store = channel === "Online"
    ? stores[3] // US1004 / US_ONLINE
    : offlineStores[numId % offlineStores.length]
  const orderType = preOrderIds.includes(numId) ? "Pre-order" : "Normal"
  const period = processingPeriods.find(p => numId >= p.range[0] && numId <= p.range[1])?.period || "-"

  return { status, channel, store, workType: workTypes[numId % workTypes.length], assignee: assignees[numId % assignees.length], orderType, period }
}

// Sample data - in real app, this would come from API
const getWorkItem = (id: string) => {
  const numId = Number(id)
  const listData = getListItemData(numId)

  // Map list "Inspection" to detail "Inbound Inspection"
  const statusMap: Record<string, string> = {
    "Inspection": "Inbound Inspection",
  }
  const status = statusMap[listData.status] || listData.status
  const isCompleted = status === "Completed" || status === "Finalized"

  return {
    id,
    orderDate: `2025-08-${String(10 + (numId % 20)).padStart(2, "0")} ${10 + (numId % 12)}:00 (PST)`,
    orderNumber: `6060606060${String(60000 + numId).padStart(5, "0")}`,
    orderType: listData.orderType,
    launchDate: listData.orderType === "Pre-order" ? "2026-01-15 10:00" : undefined,
    channel: listData.channel as "Online" | "Offline",
    storeCode: listData.store.code,
    storeName: listData.store.name,
    status: status,
    workType: listData.workType,
    processingPeriod: listData.period,
    assignee: listData.assignee,
    country: numId === 15 ? "-" : "US",
    hasMembership: numId !== 15,
    membership: numId === 15
      ? { email: "-", phone: "-", provider: "-", expDate: "-", isActive: false }
      : { email: "***********@naver.com", phone: "010-****-2222", provider: "google", expDate: "2026. 12. 31", isActive: true },
    products: [
      {
        type: "OPTICAL ACETATE",
        typeColor: "bg-[oklch(0.92_0.12_85)]",
        productInfo: "11000003 | DAY-01 OPT | 8809639023860",
        mappedProduct: "-",
        qty: 1,
        totalPrice: 560,
        cof: false,
      },
      {
        type: "LENS",
        typeColor: "bg-[oklch(0.92_0.12_85)]",
        productInfo: "14000223 | PL-167-AR | -",
        mappedProduct: "11000003 | DAY-01 OPT | 8809639023860",
        qty: 1,
        totalPrice: 500,
        cof: false,
      },
    ],
    customer: {
      name: "John Doe",
      phone: "01072119843",
      email: "landa0707@naver.com",
      shippingType: (listData.channel === "Offline" && listData.orderType !== "Pre-order" ? "store" : "address") as "address" | "store",
      address1: "Address Address Address Address",
      address2: "Address Address Address Address",
      city: "New York",
      state: "CA",
      zip: "10001",
    },
    prescription: {
      od: { sph: "+2.00", cyl: "-2.00", axis: "180", pd: "Single", oc: "-" },
      os: { sph: "+2.00", cyl: "-2.00", axis: "180", pd: "63.0", oc: "-" },
    },

    prescriptionFiles: numId === 15 ? [] : [
      { id: "p1", name: "prescription_front.jpg", url: "/placeholder.svg?height=600&width=400&text=Prescription+Front" },
      { id: "p2", name: "prescription_back.jpg", url: "/placeholder.svg?height=600&width=400&text=Prescription+Back" },
      { id: "p3", name: "doctor_note.jpg", url: "/placeholder.svg?height=600&width=400&text=Doctor+Note" },
    ],
    attachments: [
      { id: "1", name: "prescription_scan.jpg", type: "image", url: "/placeholder.svg?height=600&width=400" },
      { id: "2", name: "rx_document.pdf", type: "pdf", url: "#" },
    ],
    consent: {
      prescriptionPolicy: true,
      hipaaAuthorization: true,
      marketingCommunications: false,
      signature: true,
    },
    inboundTracking: listData.channel === "Online" ? null : { trackingNo: "7489274892748", carrier: "FedEx" },
    // Outbound tracking exists when outbound registration has been done (Completed/Finalized items have it)
    outboundTracking: isCompleted ? { trackingNo: "9201774892100", carrier: "UPS" } : null,
    comments: [
      {
        id: "1",
        author: "sam_01",
        content: "Prescription verified. Ready for processing.",
        createdAt: "2026-03-09 14:30 (PST)",
      },
    ],
  }
}

type Comment = {
  id: string
  author: string
  content: string
  createdAt: string
}

export default function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") as "customer" | "store" | null
  const isCustomerTab = tab === "customer"
  const item = getWorkItem(id)

  // Editable work status fields
  const [worker, setWorker] = useState(item.worker || "")
  const [workStatus, setWorkStatus] = useState(item.status)
  const [workType, setWorkType] = useState(item.workType)
  const [processingPeriod, setProcessingPeriod] = useState(item.processingPeriod)

  // Editable address fields
  const [shippingType, setShippingType] = useState<"address" | "store">(item.customer.shippingType)
  const [address1, setAddress1] = useState(item.customer.address1)
  const [address2, setAddress2] = useState(item.customer.address2)
  const [city, setCity] = useState(item.customer.city)
  const [state, setState] = useState(item.customer.state)
  const [zip, setZip] = useState(item.customer.zip)

  // Saved values (to track changes after save)
  const [savedValues, setSavedValues] = useState({
    worker: item.worker || "",
    workStatus: item.status,
    workType: item.workType,
    processingPeriod: item.processingPeriod,
    shippingType: item.customer.shippingType,
    address1: item.customer.address1,
    address2: item.customer.address2,
    city: item.customer.city,
    state: item.customer.state,
    zip: item.customer.zip,
  })

  // Image viewer state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Prescription view states
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false)
  const [floatingImages, setFloatingImages] = useState<{ id: string; name: string; url: string; x: number; y: number }[]>([])
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  // Comments state
  const [comments, setComments] = useState<Comment[]>(item.comments)
  const [newComment, setNewComment] = useState("")

  // Shipment label state
  const [shipmentLabelNo, setShipmentLabelNo] = useState("")

  // Invoice modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  // Label print modal state (To Store)
  const [labelPrintModalOpen, setLabelPrintModalOpen] = useState(false)

  // Cancel/Return modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)

  // Detail history entries (newest first)
  const [historyEntries, setHistoryEntries] = useState<{
    type: "cancel" | "return" | "status"
    timestamp: string
    changes: { label: string; value: string; badgeClass: string }[]
  }[]>([])

  // Outbound/Label registration state
  const [outboundConfirmOpen, setOutboundConfirmOpen] = useState(false)
  const [labelRegConfirmOpen, setLabelRegConfirmOpen] = useState(false)
  const [labelRegistered, setLabelRegistered] = useState(false)
  // To Store: outbound registration state
  const [storeOutboundRegistered, setStoreOutboundRegistered] = useState(false)

  // Check if editable based on status (Completed and Finalized are read-only)
  const isEditable = !["Completed", "Finalized"].includes(item.status)

  // Address fields are not editable for Online channel
  const isAddressEditable = isEditable && item.channel !== "Online"

  // Label Print is only enabled when outbound registration is completed (Outbound Inspection status)
  const isLabelPrintEnabled = workStatus === "Outbound Inspection"

  // Track address changes
  const hasAddressChanges =
    shippingType !== savedValues.shippingType ||
    address1 !== savedValues.address1 ||
    address2 !== savedValues.address2 ||
    city !== savedValues.city ||
    state !== savedValues.state ||
    zip !== savedValues.zip

  // Track work status changes
  const hasWorkStatusChanges =
    worker !== savedValues.worker ||
    workStatus !== savedValues.workStatus ||
    workType !== savedValues.workType ||
    processingPeriod !== savedValues.processingPeriod

  const [addressSaveSuccess, setAddressSaveSuccess] = useState(false)
  const [workStatusSaveSuccess, setWorkStatusSaveSuccess] = useState(false)

  const handleSaveAddress = () => {
    console.log("Saving address:", { shippingType, address1, address2, city, state, zip })
    setSavedValues((prev) => ({ ...prev, shippingType, address1, address2, city, state, zip }))
    setAddressSaveSuccess(true)
    setTimeout(() => setAddressSaveSuccess(false), 2000)
  }

  const handleSaveWorkStatus = () => {
    console.log("Saving work status:", { worker, workStatus, workType, processingPeriod })
    const now = new Date()
    const timestamp = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} (PST)`
    const changes: { label: string; value: string; badgeClass: string }[] = []
    if (worker !== savedValues.worker) {
      changes.push({ label: "Worker", value: `${savedValues.worker || "-"} → ${worker}`, badgeClass: "bg-teal-50 text-teal-700 border-teal-200" })
    }
    if (workStatus !== savedValues.workStatus) {
      changes.push({ label: "Status", value: `${savedValues.workStatus} → ${workStatus}`, badgeClass: "bg-blue-50 text-blue-700 border-blue-200" })
    }
    if (workType !== savedValues.workType) {
      changes.push({ label: "Type", value: `${savedValues.workType || "-"} → ${workType || "-"}`, badgeClass: "bg-purple-50 text-purple-700 border-purple-200" })
    }
    if (processingPeriod !== savedValues.processingPeriod) {
      changes.push({ label: "Period", value: `${savedValues.processingPeriod || "-"} → ${processingPeriod || "-"}`, badgeClass: "bg-green-50 text-green-700 border-green-200" })
    }
    if (changes.length > 0) {
      setHistoryEntries((prev) => [{ type: "status", timestamp, changes }, ...prev])
    }
    setSavedValues((prev) => ({ ...prev, worker, workStatus, workType, processingPeriod }))
    setWorkStatusSaveSuccess(true)
    setTimeout(() => setWorkStatusSaveSuccess(false), 2000)
  }

  const handleWorkPrint = () => {
    // Picking list print (work instruction for the order)
  }

  const handleInvoicePrint = () => {
    setInvoiceModalOpen(true)
  }

  const handleLabelPrint = () => {
    setLabelPrintModalOpen(true)
  }

  const handleSerialPrint = () => {
    // Serial print
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: Date.now().toString(),
      author: "monster1437",
      content: newComment,
      createdAt: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    }
    setComments([...comments, comment])
    setNewComment("")
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  const handlePrescriptionView = () => {
    if (item.prescriptionFiles.length === 1) {
      // Only 1 file - open floating directly
      const file = item.prescriptionFiles[0]
      if (!floatingImages.find((f) => f.id === file.id)) {
        setFloatingImages([...floatingImages, { ...file, x: 100, y: 100 }])
      }
    } else {
      setShowPrescriptionPopup(true)
    }
  }

  const handleSelectPrescriptionFile = (file: { id: string; name: string; url: string }) => {
    if (!floatingImages.find((f) => f.id === file.id)) {
      const offset = floatingImages.length * 30
      setFloatingImages([...floatingImages, { ...file, x: 100 + offset, y: 100 + offset }])
    }
    setShowPrescriptionPopup(false)
  }

  const handleCloseFloatingImage = (id: string) => {
    setFloatingImages(floatingImages.filter((f) => f.id !== id))
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const img = floatingImages.find((f) => f.id === id)
    if (!img) return
    setDragging({ id, offsetX: e.clientX - img.x, offsetY: e.clientY - img.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setFloatingImages(floatingImages.map((f) =>
      f.id === dragging.id ? { ...f, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY } : f
    ))
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending:
        "bg-[oklch(0.92_0.12_85)] text-[oklch(0.45_0.12_70)] border-[oklch(0.85_0.15_85)]",
      "Inbound Inspection": "bg-[oklch(0.75_0.16_55)] text-white border-transparent",
      "In Progress": "bg-[oklch(0.7_0.15_145)] text-white border-transparent",
      "Outbound Inspection": "bg-indigo-500 text-white border-transparent",
      Completed: "bg-blue-100 text-blue-700 border-blue-300",
      Finalized:
        "bg-transparent text-[oklch(0.5_0.12_145)] border-[oklch(0.7_0.15_145)]",
    }

    return (
      <Badge
        variant="outline"
        className={`px-3 py-1 font-medium ${statusStyles[status] || ""}`}
      >
        {status}
      </Badge>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <AppHeader />

        <main className="flex-1 overflow-y-auto p-4">
          {/* Back to List */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>

          {/* Header - Row 1: Order info + Worker */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold">{item.orderNumber}</h1>
              {getStatusBadge(item.status)}
              <Badge variant="outline" className={`px-3 py-1 font-medium ${
                item.channel === "Online"
                  ? "text-green-600 border-green-600"
                  : "text-blue-600 border-blue-600"
              }`}>
                {item.channel}
              </Badge>
            </div>

          </div>

          {/* Header - Row 2: Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSerialPrint}
              className="gap-1.5 bg-transparent h-7 text-xs px-2.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Serial Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWorkPrint}
              className="gap-1.5 bg-transparent h-7 text-xs px-2.5"
            >
              <Package className="h-3.5 w-3.5" />
              Picking List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvoicePrint}
              className="gap-1.5 bg-transparent h-7 text-xs px-2.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Invoice
            </Button>
            {isCustomerTab ? (
            /* To Customer: Label Registration only (B2C - TMS 송장 등록만) */
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLabelRegConfirmOpen(true)}
              disabled={labelRegistered}
              className="gap-1.5 bg-transparent h-7 text-xs px-2.5 border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck className="h-3.5 w-3.5" />
              Label Registration
            </Button>
            ) : (
            /* To Store: Outbound Registration only (B2B - 출고등록) */
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOutboundConfirmOpen(true)}
              disabled={storeOutboundRegistered}
              className="gap-1.5 bg-transparent h-7 text-xs px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="h-3.5 w-3.5" />
              Outbound Registration
            </Button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Left Column - Main Content (3 columns) */}
            <div className="col-span-3 space-y-6">
              {/* Member Info Card */}
              <Card>
                <CardHeader className="pb-1 pt-2.5 px-3">
                  <CardTitle className="text-xs font-semibold">Member Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-2.5">
                  <div className="flex items-center gap-4 text-xs mb-1.5">
                    <span className="text-muted-foreground text-[10px]">Country</span>
                    <span className="font-medium">{item.country}</span>
                  </div>
                  <div className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-xs">{item.membership.email}</p>
                        {item.channel !== "Online" && (
                          <p className="text-[11px] text-muted-foreground">
                            {item.hasMembership ? `${item.membership.phone} · ${item.membership.provider}` : "-"}
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handlePrescriptionView}
                          disabled={item.prescriptionFiles.length === 0}
                          className={`gap-1.5 h-7 text-xs px-3 rounded-md shadow-sm ${
                            item.prescriptionFiles.length === 0
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-[oklch(0.7_0.15_55)] hover:bg-[oklch(0.65_0.15_55)] text-white"
                          }`}
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Prescription View
                          {item.prescriptionFiles.length > 1 && (
                            <span className="bg-white/30 text-white text-[9px] rounded-full px-1 ml-0.5">
                              {item.prescriptionFiles.length}
                            </span>
                          )}
                        </Button>
                        {/* Prescription file selection popup */}
                        {showPrescriptionPopup && (
                          <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg p-2 w-[220px]">
                            <div className="flex items-center justify-between mb-1.5 px-1">
                              <span className="text-[11px] font-semibold">Select File</span>
                              <button onClick={() => setShowPrescriptionPopup(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1">
                              {item.prescriptionFiles.map((file) => {
                                const isOpen = floatingImages.some((f) => f.id === file.id)
                                return (
                                  <button
                                    key={file.id}
                                    onClick={() => !isOpen && handleSelectPrescriptionFile(file)}
                                    className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left transition-colors ${
                                      isOpen ? "bg-muted/50 opacity-50 cursor-default" : "hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className="h-6 w-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                                      <ImageIcon className="h-3 w-3 text-blue-500" />
                                    </div>
                                    <span className="text-[11px] truncate">{file.name}</span>
                                    {isOpen && <span className="text-[9px] text-muted-foreground ml-auto shrink-0">Opened</span>}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.channel !== "Online" && (
                      <div className="mt-2.5 pt-2.5 border-t border-dashed flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">EXP</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px]">{item.membership.expDate}</span>
                          {item.membership.isActive && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-green-300 text-green-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Info Card */}
              <Card>
                <CardHeader className="pb-1 pt-2.5 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold">Order Info</CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 ${
                        item.orderType === "Pre-order"
                          ? "border-purple-300 text-purple-600 bg-purple-50"
                          : "border-gray-300 text-gray-600 bg-gray-50"
                      }`}
                    >
                      {item.orderType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-2.5">
                  {/* Order Date & Store Info */}
                  <div className="space-y-1 text-xs mb-2 px-1">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Order Date</span>
                      <span className="font-medium">{item.orderDate}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Store Info</span>
                      <span className="font-medium">{item.storeCode} / {item.storeName}</span>
                    </div>
                    {item.orderType === "Pre-order" && item.launchDate && (
                      <div className="flex items-center gap-4">
                        <span className="text-purple-500">Launch Date</span>
                        <span className="font-medium">{item.launchDate}</span>
                      </div>
                    )}
                  </div>
                  {/* Products Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] py-1 w-[110px]">Type</TableHead>
                        <TableHead className="text-[10px] py-1">Product Info</TableHead>
                        <TableHead className="text-[10px] py-1">Mapped Product</TableHead>
                        <TableHead className="text-[10px] py-1 text-center w-[40px]">Qty</TableHead>
                        <TableHead className="text-[10px] py-1 text-right w-[70px]">Total Price</TableHead>
                        <TableHead className="text-[10px] py-1 text-center w-[40px]">C.O.F</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="py-1">
                            <Badge className={`${product.typeColor} text-[9px] font-medium px-1.5 py-0`}>
                              {product.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] py-1">{product.productInfo}</TableCell>
                          <TableCell className="text-[10px] py-1">{product.mappedProduct}</TableCell>
                          <TableCell className="text-center text-[10px] py-1">{product.qty}</TableCell>
                          <TableCell className="text-right text-[10px] py-1">{product.totalPrice}</TableCell>
                          <TableCell className="text-center py-1">
                            <Checkbox checked={product.cof} disabled className="h-3 w-3" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Tabs: Prescription, Additional Details, Comment */}
              <Tabs defaultValue="prescription" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/50 rounded-lg p-0.5">
                  <TabsTrigger
                    value="prescription"
                    className="rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Prescription
                  </TabsTrigger>
                  <TabsTrigger
                    value="additional"
                    className="rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Additional Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="comment"
                    className="rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Comment
                  </TabsTrigger>
                </TabsList>

                {/* Prescription Tab */}
                <TabsContent value="prescription" className="mt-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">Prescription Values</span>
                  </div>

                  {/* Prescription Table */}
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/60 border-b">
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center w-[120px]"></th>
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center">SPH</th>
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center">CYL</th>
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center">Axis</th>
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center">PD</th>
                          <th className="py-2 px-3 text-[11px] font-semibold text-muted-foreground text-center">OC</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2.5 px-3">
                            <div className="bg-muted rounded py-1.5 px-2 text-center">
                              <span className="text-xs font-medium">OS (Left Eye)</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-primary">{item.prescription.os.sph}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.os.cyl}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.os.axis}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.os.pd}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.os.oc}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="bg-muted rounded py-1.5 px-2 text-center">
                              <span className="text-xs font-medium">OD (Right Eye)</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-primary">{item.prescription.od.sph}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.od.cyl}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.od.axis}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.od.pd}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{item.prescription.od.oc}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Attached Files */}
                  {item.attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">Attached Files</span>
                        <Badge variant="secondary" className="text-[10px] ml-1 px-1.5 py-0">{item.attachments.length}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {item.attachments.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => file.type === "image" && setSelectedImage(file.url)}
                            className="flex items-center gap-2.5 p-2.5 border rounded-md hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                          >
                            <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                              file.type === "image" ? "bg-blue-50" : "bg-red-50"
                            }`}>
                              {file.type === "image" ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium truncate block group-hover:text-primary transition-colors">{file.name}</span>
                              <span className="text-[10px] text-muted-foreground">{file.type === "image" ? "Image File" : "PDF Document"}</span>
                            </div>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Additional Details Tab */}
                <TabsContent value="additional" className="mt-3 space-y-3">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-bold text-sm mb-3">Customer Info</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-[80px_1fr] gap-8 items-center">
                        <Label className="text-xs font-bold text-foreground">Name</Label>
                        <Input value={item.customer.name} disabled className="bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1" />
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-8 items-center">
                        <Label className="text-xs font-bold text-foreground">Phone</Label>
                        <Input value={item.customer.phone} disabled className="bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1" />
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-8 items-center">
                        <Label className="text-xs font-bold text-foreground">Email</Label>
                        <Input value={item.customer.email} disabled className="bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1" />
                      </div>

                      {/* Address Section */}
                      <div className="grid grid-cols-[80px_1fr] gap-8 items-start">
                        <Label className="text-xs font-bold text-foreground pt-1.5">Address</Label>
                        <div className="space-y-3">
                          {/* Shipping Type Toggle - Ship to Store only for Offline + Normal */}
                          {item.channel === "Offline" && item.orderType !== "Pre-order" ? (
                            <div className={`inline-flex rounded-lg bg-muted/50 p-0.5 ${!isEditable ? "opacity-60" : ""}`}>
                              <button
                                onClick={() => isEditable && setShippingType("address")}
                                disabled={!isEditable}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                  shippingType === "address"
                                    ? "bg-emerald-50 shadow-sm text-emerald-700 border border-emerald-200"
                                    : "text-muted-foreground hover:text-foreground"
                                } ${!isEditable ? "cursor-not-allowed" : ""}`}
                              >
                                <MapPin className="h-3 w-3" />
                                Ship to Address
                              </button>
                              <button
                                onClick={() => isEditable && setShippingType("store")}
                                disabled={!isEditable}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                  shippingType === "store"
                                    ? "bg-emerald-50 shadow-sm text-emerald-700 border border-emerald-200"
                                    : "text-muted-foreground hover:text-foreground"
                                } ${!isEditable ? "cursor-not-allowed" : ""}`}
                              >
                                <Store className="h-3 w-3" />
                                Ship to Store
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                              <MapPin className="h-3 w-3" />
                              Ship to Address
                            </div>
                          )}

                          {/* Address Fields */}
                          <Input
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            placeholder="Address Line 1"
                            disabled={!isAddressEditable}
                            className={`bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1 ${!isAddressEditable ? "opacity-60" : ""}`}
                          />
                          <Input
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            placeholder="Address Line 2"
                            disabled={!isAddressEditable}
                            className={`bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1 ${!isAddressEditable ? "opacity-60" : ""}`}
                          />
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase block mb-0.5">City</span>
                              <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!isAddressEditable}
                                className={`bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1 ${!isAddressEditable ? "opacity-60" : ""}`}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase block mb-0.5">State</span>
                              <Input
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                disabled={!isAddressEditable}
                                className={`bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1 ${!isAddressEditable ? "opacity-60" : ""}`}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase block mb-0.5">Zip</span>
                              <Input
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                disabled={!isAddressEditable}
                                className={`bg-transparent border-0 border-b border-border rounded-none shadow-none h-6 text-[9px] font-normal text-muted-foreground px-1 ${!isAddressEditable ? "opacity-60" : ""}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Save Button */}
                  {isAddressEditable && (
                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={handleSaveAddress}
                        size="sm"
                        disabled={(!hasAddressChanges && !addressSaveSuccess)}
                        className={`h-7 text-xs px-4 transition-all ${
                          addressSaveSuccess
                            ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                            : hasAddressChanges
                              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {addressSaveSuccess ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Saved
                          </span>
                        ) : (
                          "Save Address"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Consent & Agreement Policy - Offline only */}
                  {item.channel !== "Online" && (<>
                  {/* Divider */}
                  <div className="border-t border-border mt-4 mb-3" />

                  <div className="opacity-60 pointer-events-none select-none">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Check className="h-3.5 w-3.5 text-[oklch(0.7_0.15_55)]" />
                      <h3 className="font-bold text-sm text-[oklch(0.7_0.15_55)]">Consent & Agreement Policy</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="border border-[oklch(0.85_0.15_85)] rounded-md p-2.5 bg-[oklch(0.99_0.01_85)]">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={item.consent.prescriptionPolicy} disabled />
                          <span className="text-xs">
                            I have read and agree to the{" "}
                            <span className="text-[oklch(0.7_0.15_55)] underline">
                              Consent & Agreement Policy
                            </span>{" "}
                            for prescription lens services.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                        <Checkbox checked={item.consent.hipaaAuthorization} disabled />
                        <span className="text-xs text-muted-foreground">
                          I authorize the use and disclosure of my health information as described in the HIPAA Authorization.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                        <Checkbox checked={item.consent.marketingCommunications} disabled />
                        <span className="text-xs text-muted-foreground">
                          I agree to receive marketing communications.
                        </span>
                      </div>

                      {/* Signature */}
                      <div className="mt-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">Signature</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="border-2 border-dashed border-muted rounded-md p-4 text-center">
                          <span className="text-xs text-muted-foreground">
                            {item.consent.signature ? "Signature on file" : "Agree to the policy to Sign."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </>)}
                </TabsContent>

                {/* Comment Tab */}
                <TabsContent value="comment" className="mt-3 space-y-3">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment..."
                      className="w-full min-h-[70px] p-2.5 border border-input rounded-md text-xs bg-background resize-none"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} size="sm" className="gap-1.5 h-7 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        Add Comment
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2 mt-3">
                    {comments.length === 0 ? (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No comments yet
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border rounded-md p-2.5 bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs">{comment.author}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {comment.createdAt}
                                </span>
                              </div>
                              <p className="text-xs">{comment.content}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-muted-foreground hover:text-destructive h-6 w-6"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar (1 column) */}
            <div className="space-y-3">
              {/* Work Status Management Card */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-semibold">Work Status Management</CardTitle>
                  {!isEditable && (
                    <p className="text-[10px] text-muted-foreground">Status is {item.status}. Editing is disabled.</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 text-xs px-4 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-bold shrink-0 flex items-center gap-1.5"><UserCog className="h-3 w-3" />Worker</span>
                    <Select value={worker || undefined} onValueChange={setWorker} disabled={!isEditable}>
                      <SelectTrigger className={`w-[150px] h-7 text-xs ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monster1437">monster1437</SelectItem>
                        <SelectItem value="sam_01">sam_01</SelectItem>
                        <SelectItem value="sam_02">sam_02</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-bold shrink-0 flex items-center gap-1.5"><Activity className="h-3 w-3" />Work Status</span>
                    <Select value={workStatus} onValueChange={setWorkStatus} disabled={!isEditable}>
                      <SelectTrigger className={`w-[150px] h-7 text-xs ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inbound Inspection">Inbound Inspection</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Outbound Inspection">Outbound Inspection</SelectItem>
                        <SelectItem value="Completed" disabled>Completed</SelectItem>
                        <SelectItem value="Finalized" disabled>Finalized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-bold shrink-0 flex items-center gap-1.5"><Wrench className="h-3 w-3" />Work Type</span>
                    <Select value={workType || undefined} onValueChange={setWorkType} disabled={!isEditable}>
                      <SelectTrigger className={`w-[150px] h-7 text-xs ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="IN HOUSE">IN HOUSE</SelectItem>
                        <SelectItem value="OUTSOURCED">OUTSOURCED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-bold shrink-0 flex items-center gap-1.5"><Clock className="h-3 w-3" />Processing Period</span>
                    <Select value={processingPeriod || undefined} onValueChange={setProcessingPeriod} disabled={!isEditable}>
                      <SelectTrigger className={`w-[150px] h-7 text-xs ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="(Basic) IIC Lab">(Basic) IIC Lab</SelectItem>
                        <SelectItem value="(Basic) Lab 1">(Basic) Lab 1</SelectItem>
                        <SelectItem value="(Express) IIC Lab">(Express) IIC Lab</SelectItem>
                        <SelectItem value="(Express) Lab 1">(Express) Lab 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveWorkStatus}
                  size="sm"
                  disabled={(!hasWorkStatusChanges && !workStatusSaveSuccess) || !isEditable}
                  className={`h-7 text-xs px-4 transition-all ${
                    workStatusSaveSuccess
                      ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                      : hasWorkStatusChanges && isEditable
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {workStatusSaveSuccess ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>

              {/* Spacer */}
              <div className="pt-4" />

              {/* Delivery Tracking Card */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    Delivery Tracking
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">This is information regarding the shipments received by the lab.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold">Shipment Label No.</span>
                      <span className="font-medium">{item.inboundTracking?.trackingNo || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold">Carrier</span>
                      <span className="font-medium">{item.inboundTracking?.carrier || "-"}</span>
                    </div>
                  </div>
                  {item.inboundTracking && (
                    <button
                      onClick={() => {
                        const trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${item.inboundTracking?.trackingNo}`
                        window.open(trackingUrl, "_blank")
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors text-left group mt-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {item.inboundTracking.carrier}
                        </Badge>
                        <code className="text-[10px] font-mono truncate">
                          {item.inboundTracking.trackingNo}
                        </code>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Detail History Card */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm">Detail History</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="max-h-[220px] overflow-y-auto pr-1">
                    <div className="space-y-3">
                      {/* Dynamic history entries */}
                      {historyEntries.map((entry, idx) => (
                        <div key={`history-${idx}`} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className={`h-1.5 w-1.5 rounded-full mt-1.5 ${
                              entry.type === "cancel" ? "bg-red-500" : entry.type === "return" ? "bg-amber-500" : "bg-[oklch(0.7_0.15_55)]"
                            }`} />
                            <div className="w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-3 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-muted-foreground">{entry.timestamp}</p>
                              <p className="text-[10px] text-muted-foreground">monster1437</p>
                            </div>
                            <div className="space-y-1">
                              {entry.changes.map((change, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-1.5">
                                  <Badge variant="outline" className={`text-[10px] shrink-0 px-1.5 py-0 ${change.badgeClass}`}>
                                    {change.label}
                                  </Badge>
                                  <span className="text-xs">{change.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Multiple changes in one save */}
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.15_55)] mt-1.5" />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="pb-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">2026. 03.10 14:30 (PST)</p>
                            <p className="text-[10px] text-muted-foreground">monster1437</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="text-[10px] shrink-0 bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">Status</Badge>
                              <span className="text-xs">Pending → In Progress</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="text-[10px] shrink-0 bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0">Type</Badge>
                              <span className="text-xs">- → INHOUSE</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="text-[10px] shrink-0 bg-green-50 text-green-700 border-green-200 px-1.5 py-0">Period</Badge>
                              <span className="text-xs">- → (Basic) IIC Lab</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info change */}
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.15_55)] mt-1.5" />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="pb-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">2026. 03.09 16:00 (PST)</p>
                            <p className="text-[10px] text-muted-foreground">monster1437</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <Badge variant="outline" className="text-[10px] shrink-0 bg-orange-50 text-orange-700 border-orange-200 px-1.5 py-0">Customer Info</Badge>
                              <span className="text-xs">Address1, City</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel / Return Buttons */}
              {(() => {
                const cancelInfo = getCancelAvailability(
                  item.channel,
                  item.status,
                  item.outboundTracking,
                )
                const returnInfo = getReturnAvailability(
                  item.channel,
                  item.status,
                  item.outboundTracking,
                )
                return (
                  <div className="flex justify-end gap-2 mt-2">
                    {returnInfo.canReturn && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 text-amber-500 border-amber-200 hover:bg-amber-50 hover:text-amber-600 gap-1"
                        onClick={() => setReturnModalOpen(true)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Return
                      </Button>
                    )}
                    {cancelInfo.canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 text-red-400 border-red-200 hover:bg-red-50 hover:text-red-500 gap-1"
                        onClick={() => {
                          if (cancelInfo.errorMessage) {
                            toast.error(cancelInfo.errorMessage)
                            return
                          }
                          setCancelModalOpen(true)
                        }}
                      >
                        <XCircle className="h-3 w-3" />
                        Cancel Work
                      </Button>
                    )}
                  </div>
                )
              })()}

            </div>
          </div>
        </main>

        <footer className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-card">
          <span>© 2025 IICOMBINED CO., LTD. ALL RIGHTS RESERVED.</span>
          <span>V.1.0.0</span>
        </footer>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prescription Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Prescription"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Prescription Images */}
      {floatingImages.length > 0 && (
        <div
          className="fixed inset-0 z-[60] pointer-events-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ pointerEvents: dragging ? "auto" : "none" }}
        >
          {floatingImages.map((img) => (
            <div
              key={img.id}
              className="absolute pointer-events-auto"
              style={{ left: img.x, top: img.y }}
            >
              <div className="bg-white rounded-lg shadow-2xl border overflow-hidden" style={{ width: 320 }}>
                {/* Title bar - draggable */}
                <div
                  className="flex items-center justify-between px-2.5 py-1.5 bg-muted/60 border-b cursor-move select-none"
                  onMouseDown={(e) => handleMouseDown(e, img.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ImageIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] font-medium truncate">{img.name}</span>
                  </div>
                  <button
                    onClick={() => handleCloseFloatingImage(img.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Image content */}
                <div className="p-2 bg-muted/20">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-auto rounded object-contain max-h-[400px]"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Outbound Registration Confirm Dialog (ERP) - To Store only */}
      <Dialog open={outboundConfirmOpen} onOpenChange={setOutboundConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Outbound Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
              <span className="font-medium text-foreground">{item.orderNumber}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This order will be sent to ERP for outbound registration. Do you want to proceed?
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  console.log("ERP Outbound Registration:", { orderId: item.id })
                  setStoreOutboundRegistered(true)
                  setOutboundConfirmOpen(false)
                  toast.success("Outbound registration completed. Order has been sent to TMS.")
                }}
                className="h-8 text-xs px-4 gap-1.5"
              >
                <Package className="h-3.5 w-3.5" />
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Label Registration Confirm Dialog (TMS) */}
      <Dialog open={labelRegConfirmOpen} onOpenChange={setLabelRegConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" />
              Label Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
              <span className="font-medium text-foreground">{item.orderNumber}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This order will be sent to TMS for label registration. Do you want to proceed?
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  console.log("TMS Label Registration:", {
                    orderId: item.id,
                  })
                  setLabelRegConfirmOpen(false)
                  // To Customer: TMS 전달 완료 토스트 → 버튼 비활성화
                  setLabelRegistered(true)
                  toast.success("Label registration has been sent to TMS successfully.")
                }}
                className="h-8 text-xs px-4 gap-1.5"
              >
                <Truck className="h-3.5 w-3.5" />
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <InvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        item={item as any}
      />

      {/* Label Print Modal (To Store) */}
      <LabelPrintModal
        open={labelPrintModalOpen}
        onOpenChange={setLabelPrintModalOpen}
        item={{
          orderNumber: item.orderNumber,
          storeCode: item.storeCode,
          storeName: item.storeName,
          customer: {
            name: item.customer.name,
            phone: item.customer.phone,
            address1: item.customer.address1,
            address2: item.customer.address2,
            city: item.customer.city,
            state: item.customer.state,
            zip: item.customer.zip,
          },
        }}
      />

      {/* Cancel Modal */}
      <CancelReturnModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        type="cancel"
        orderId={item.id}
        orderNumber={item.orderNumber}
        onComplete={(info) => {
          const now = new Date()
          const timestamp = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} (PST)`
          const changes = [
            { label: "Cancelled", value: `${item.status} → Cancelled`, badgeClass: "bg-red-50 text-red-700 border-red-200" },
            { label: "Reason", value: info.reason, badgeClass: "bg-gray-50 text-gray-700 border-gray-200" },
          ]
          if (info.subReason) {
            changes.push({ label: "Sub Reason", value: info.subReason, badgeClass: "bg-gray-50 text-gray-700 border-gray-200" })
          }
          setHistoryEntries((prev) => [{ type: "cancel", timestamp, changes }, ...prev])
        }}
      />

      {/* Return Modal */}
      <CancelReturnModal
        open={returnModalOpen}
        onOpenChange={setReturnModalOpen}
        type="return"
        orderId={item.id}
        orderNumber={item.orderNumber}
        onComplete={(info) => {
          const now = new Date()
          const timestamp = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} (PST)`
          const changes = [
            { label: "Returned", value: `${item.status} → Refunded`, badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
            { label: "Reason", value: info.reason, badgeClass: "bg-gray-50 text-gray-700 border-gray-200" },
          ]
          if (info.subReason) {
            changes.push({ label: "Sub Reason", value: info.subReason, badgeClass: "bg-gray-50 text-gray-700 border-gray-200" })
          }
          setHistoryEntries((prev) => [{ type: "return", timestamp, changes }, ...prev])
        }}
      />
    </div>
  )
}
