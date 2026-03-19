"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  ArrowLeft,
  Package,
  User,
  Eye,
  FileText,
  Printer,
  Truck,
  ExternalLink,
  Image as ImageIcon,
  FolderOpen,
  X,
  Trash2,
  Plus,
  Check,
  Info,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
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

// Sample data - in real app, this would come from API
const getWorkItem = (id: string) => ({
  id,
  orderDate: "2025-12-01 15:00",
  orderNumber: "606069096005",
  channel: "Online" as const,
  storeCode: "US1004",
  storeName: "US_Online",
  status: "Pending" as const,
  workType: "-",
  processingPeriod: "-",
  assignee: null,
  country: "US",
  membership: {
    email: "***********@naver.com",
    phone: "010-****-2222",
    provider: "google",
    joinDate: "2026. 12. 31",
    isActive: true,
  },
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
    shippingType: "address" as const,
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
  inboundTracking: null,
  comments: [
    {
      id: "1",
      author: "sam_01",
      content: "Prescription verified. Ready for processing.",
      createdAt: "2026-03-09 14:30 (PST)",
    },
  ],
})

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
  const item = getWorkItem(id)

  // Editable work status fields
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

  // Image viewer state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Comments state
  const [comments, setComments] = useState<Comment[]>(item.comments)
  const [newComment, setNewComment] = useState("")

  // Shipment label state
  const [shipmentLabelNo, setShipmentLabelNo] = useState("")

  // Check if editable based on status (Completed and Finalized are read-only)
  const isEditable = !["Completed", "Finalized"].includes(item.status)

  // Label Print is only enabled when outbound registration is completed (Outbound Inspection status)
  const isLabelPrintEnabled = workStatus === "Outbound Inspection"

  // Track if any changes have been made
  const hasChanges = 
    workStatus !== item.status ||
    workType !== item.workType ||
    processingPeriod !== item.processingPeriod ||
    shippingType !== item.customer.shippingType ||
    address1 !== item.customer.address1 ||
    address2 !== item.customer.address2 ||
    city !== item.customer.city ||
    state !== item.customer.state ||
    zip !== item.customer.zip ||
    shipmentLabelNo !== ""

  const handleSave = () => {
    // Save all changes - in real app, this would call API
    console.log("Saving changes:", {
      workStatus,
      workType,
      processingPeriod,
      shippingType,
      address1,
      address2,
      city,
      state,
      zip,
      shipmentLabelNo,
    })
  }

  const handleWorkPrint = () => {
    // Picking list print (work instruction for the order)
  }

  const handleInvoicePrint = () => {
    // Print document that comes with the order before customer delivery
  }

  const handleLabelPrint = () => {
    // Print paper invoice for B2B re-shipment
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

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending:
        "bg-[oklch(0.92_0.12_85)] text-[oklch(0.45_0.12_70)] border-[oklch(0.85_0.15_85)]",
      Inspection: "bg-[oklch(0.75_0.16_55)] text-white border-transparent",
      "In Progress": "bg-[oklch(0.7_0.15_145)] text-white border-transparent",
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
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Back to List */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>

          {/* Header */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Left side - Order info and Worker (3 columns to match Member Info) */}
            <div className="col-span-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{item.orderNumber}</h1>
                {getStatusBadge(item.status)}
                <Badge variant="outline" className="px-3 py-1 text-green-600 border-green-600">
                  Online
                </Badge>
              </div>

              {/* Worker - aligned to right edge of col-span-3 */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Worker</span>
                <Select defaultValue="monster1437" disabled={!isEditable}>
                  <SelectTrigger className={`w-[180px] h-9 ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monster1437">monster1437 (Wooju lee)</SelectItem>
                    <SelectItem value="sam_01">sam_01</SelectItem>
                    <SelectItem value="sam_02">sam_02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Right side - Action Buttons (1 column aligned with right sidebar) */}
            <div className="col-span-1 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleWorkPrint}
                className="gap-2 bg-transparent"
              >
                <Package className="h-4 w-4" />
                Work Print
              </Button>
              <Button
                variant="outline"
                onClick={handleInvoicePrint}
                className="gap-2 bg-transparent"
              >
                <FileText className="h-4 w-4" />
                Invoice
              </Button>
              <Button
                variant="outline"
                onClick={handleLabelPrint}
                disabled={!isLabelPrintEnabled}
                className="gap-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-4 w-4" />
                Label Print
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Left Column - Main Content (3 columns) */}
            <div className="col-span-3 space-y-6">
              {/* Member Info Card */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Member Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground text-xs">Country</span>
                      <p className="font-medium">{item.country}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Membership</span>
                    <div className="mt-2 border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.membership.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.membership.phone} · {item.membership.provider}
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[oklch(0.7_0.15_55)] hover:bg-[oklch(0.65_0.15_55)] text-white gap-1"
                        >
                          <ImageIcon className="h-3 w-3" />
                          Prescription View
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.membership.joinDate}</span>
                        {item.membership.isActive && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info Card */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Order Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground text-xs">Order Date</span>
                      <p className="font-medium">{item.orderDate}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Store Info</span>
                      <p className="font-medium">{item.storeCode} / {item.storeName}</p>
                    </div>
                  </div>

                  {/* Products Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Product Info</TableHead>
                        <TableHead className="text-xs">Mapped Product</TableHead>
                        <TableHead className="text-xs text-center">Qty</TableHead>
                        <TableHead className="text-xs text-right">Total Price</TableHead>
                        <TableHead className="text-xs text-center">C.O.F</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge className={`${product.typeColor} text-xs font-medium`}>
                              {product.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{product.productInfo}</TableCell>
                          <TableCell className="text-xs">{product.mappedProduct}</TableCell>
                          <TableCell className="text-center text-xs">{product.qty}</TableCell>
                          <TableCell className="text-right text-xs">{product.totalPrice}</TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked={product.cof} disabled />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Tabs: Prescription, Additional Details, Comment */}
              <Tabs defaultValue="prescription" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent rounded-none h-auto p-0 border-b">
                  <TabsTrigger
                    value="prescription"
                    className="rounded-none border-b-2 border-transparent py-4 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Prescription
                  </TabsTrigger>
                  <TabsTrigger
                    value="additional"
                    className="rounded-none border-b-2 border-transparent py-4 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Additional Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="comment"
                    className="rounded-none border-b-2 border-transparent py-4 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Comment
                  </TabsTrigger>
                </TabsList>

                {/* Prescription Tab */}
                <TabsContent value="prescription" className="mt-6 space-y-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-medium">Prescription Values</span>
                  </div>

                  {/* Prescription Table */}
                  <div className="space-y-4">
                    {/* OS (Left Eye) */}
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <span className="text-sm font-medium">OS (Left Eye)</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">SPH</span>
                        <span className="font-medium text-primary">{item.prescription.os.sph}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">CYL</span>
                        <span className="font-medium">{item.prescription.os.cyl}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">Axis</span>
                        <span className="font-medium">{item.prescription.os.axis}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">PD</span>
                        <span className="font-medium">{item.prescription.os.pd}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">OC</span>
                        <span className="font-medium">{item.prescription.os.oc}</span>
                      </div>
                    </div>

                    {/* OD (Right Eye) */}
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <span className="text-sm font-medium">OD (Right Eye)</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">SPH</span>
                        <span className="font-medium text-primary">{item.prescription.od.sph}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">CYL</span>
                        <span className="font-medium">{item.prescription.od.cyl}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">Axis</span>
                        <span className="font-medium">{item.prescription.od.axis}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">PD</span>
                        <span className="font-medium">{item.prescription.od.pd}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block mb-1">OC</span>
                        <span className="font-medium">{item.prescription.od.oc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attached Files */}
                  {item.attachments.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Attached Files</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {item.attachments.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => file.type === "image" && setSelectedImage(file.url)}
                            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                          >
                            {file.type === "image" ? (
                              <ImageIcon className="h-5 w-5 text-blue-500" />
                            ) : (
                              <FileText className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Additional Details Tab */}
                <TabsContent value="additional" className="mt-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold mb-4">Customer Info</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                        <Label className="text-sm font-medium">Name</Label>
                        <Input value={item.customer.name} disabled className="bg-muted/50" />
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input value={item.customer.phone} disabled className="bg-muted/50" />
                      </div>
                      <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input value={item.customer.email} disabled className="bg-muted/50" />
                      </div>

                      {/* Address Section */}
                      <div className="grid grid-cols-[100px_1fr] gap-4 items-start">
                        <Label className="text-sm font-medium pt-2">Address</Label>
                        <div className="space-y-3">
                          {/* Shipping Type Toggle */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => isEditable && setShippingType("address")}
                              disabled={!isEditable}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                shippingType === "address"
                                  ? "bg-[oklch(0.97_0.08_85)] border-[oklch(0.7_0.15_55)] text-[oklch(0.5_0.15_55)]"
                                  : "bg-background border-border text-muted-foreground"
                              } ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  shippingType === "address"
                                    ? "border-[oklch(0.7_0.15_55)]"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {shippingType === "address" && (
                                  <div className="w-2 h-2 rounded-full bg-[oklch(0.7_0.15_55)]" />
                                )}
                              </div>
                              Ship to Address
                            </button>
                            <button
                              onClick={() => isEditable && setShippingType("store")}
                              disabled={!isEditable}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                shippingType === "store"
                                  ? "bg-[oklch(0.97_0.08_85)] border-[oklch(0.7_0.15_55)] text-[oklch(0.5_0.15_55)]"
                                  : "bg-background border-border text-muted-foreground"
                              } ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  shippingType === "store"
                                    ? "border-[oklch(0.7_0.15_55)]"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {shippingType === "store" && (
                                  <div className="w-2 h-2 rounded-full bg-[oklch(0.7_0.15_55)]" />
                                )}
                              </div>
                              Ship to Store
                            </button>
                          </div>

                          {/* Address Fields */}
                          <Input
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            placeholder="Address Line 1"
                            disabled={!isEditable}
                            className={!isEditable ? "opacity-60" : ""}
                          />
                          <Input
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            placeholder="Address Line 2"
                            disabled={!isEditable}
                            className={!isEditable ? "opacity-60" : ""}
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">CITY</span>
                              <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!isEditable}
                                className={!isEditable ? "opacity-60" : ""}
                              />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">STATE</span>
                              <Input
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                disabled={!isEditable}
                                className={!isEditable ? "opacity-60" : ""}
                              />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">ZIP</span>
                              <Input
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                disabled={!isEditable}
                                className={!isEditable ? "opacity-60" : ""}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent & Agreement Policy */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Check className="h-4 w-4 text-[oklch(0.7_0.15_55)]" />
                      <h3 className="font-semibold text-[oklch(0.7_0.15_55)]">Consent & Agreement Policy</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-[oklch(0.85_0.15_85)] rounded-lg p-4 bg-[oklch(0.99_0.01_85)]">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={item.consent.prescriptionPolicy} disabled />
                          <span className="text-sm">
                            I have read and agree to the{" "}
                            <span className="text-[oklch(0.7_0.15_55)] underline">
                              Consent & Agreement Policy
                            </span>{" "}
                            for prescription lens services.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-1">
                        <Checkbox checked={item.consent.hipaaAuthorization} disabled />
                        <span className="text-sm text-muted-foreground">
                          I authorize the use and disclosure of my health information as described in the HIPAA Authorization.
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pl-1">
                        <Checkbox checked={item.consent.marketingCommunications} disabled />
                        <span className="text-sm text-muted-foreground">
                          I agree to receive marketing communications.
                        </span>
                      </div>

                      {/* Signature */}
                      <div className="mt-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-sm text-muted-foreground">Signature</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                          <span className="text-sm text-muted-foreground">
                            {item.consent.signature ? "Signature on file" : "Agree to the policy to Sign."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" className="bg-transparent">
                          Back
                        </Button>
                        <Button variant="outline" className="bg-transparent">
                          Clear
                        </Button>
                      </div>
                      <Button disabled className="bg-muted text-muted-foreground">
                        Save
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Comment Tab */}
                <TabsContent value="comment" className="mt-6 space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment..."
                      className="w-full min-h-[100px] p-3 border border-input rounded-lg text-sm bg-background resize-none"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Comment
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 mt-6">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No comments yet
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border rounded-lg p-4 bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {comment.createdAt}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
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
            <div className="space-y-4">
              {/* Work Status Management Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Work Status Management</CardTitle>
                  {!isEditable && (
                    <p className="text-xs text-muted-foreground">Status is {item.status}. Editing is disabled.</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground font-bold shrink-0">Work Status</span>
                    <Select value={workStatus} onValueChange={setWorkStatus} disabled={!isEditable}>
                      <SelectTrigger className={`w-[180px] h-9 ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inbound Inspection">Inbound Inspection</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Outbound Inspection">Outbound Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground font-bold shrink-0">Work Type</span>
                    <Select value={workType} onValueChange={setWorkType} disabled={!isEditable}>
                      <SelectTrigger className={`w-[180px] h-9 ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="IN HOUSE">IN HOUSE</SelectItem>
                        <SelectItem value="OUTSOURCED">OUTSOURCED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground font-bold shrink-0">Work Processing Period</span>
                    <Select value={processingPeriod} onValueChange={setProcessingPeriod} disabled={!isEditable}>
                      <SelectTrigger className={`w-[180px] h-9 ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <SelectValue placeholder="-" />
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

              {/* Delivery Tracking Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    Delivery Tracking
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This is information regarding the shipments received by the lab.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-bold">Shipment Label No.</span>
                      <span className="font-medium">{item.inboundTracking?.trackingNo || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
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
                      className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-left group mt-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {item.inboundTracking.carrier}
                        </Badge>
                        <code className="text-xs font-mono truncate">
                          {item.inboundTracking.trackingNo}
                        </code>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                    </button>
                  )}
                </CardContent>
              </Card>

{/* Detail History Card */}
  <Card>
  <CardHeader className="pb-3">
  <CardTitle className="text-base">Detail History</CardTitle>
  </CardHeader>
  <CardContent>
  <div className="max-h-[300px] overflow-y-auto pr-2">
  <div className="space-y-4">
  {/* Example: Multiple changes in one save */}
  <div className="flex gap-3">
  <div className="flex flex-col items-center">
  <div className="h-2 w-2 rounded-full bg-[oklch(0.7_0.15_55)] mt-1.5" />
  <div className="w-px flex-1 bg-border" />
  </div>
  <div className="pb-4 flex-1">
  <div className="flex items-center justify-between mb-2">
  <p className="text-xs text-muted-foreground">
  2026. 03.10 14:30 (PST)
  </p>
  <p className="text-xs text-muted-foreground">By: monster1437</p>
  </div>
  <div className="space-y-2">
  <div className="flex items-start gap-2">
  <Badge variant="outline" className="text-xs shrink-0 bg-blue-50 text-blue-700 border-blue-200">Status</Badge>
  <span className="text-sm">Pending → In Progress</span>
  </div>
  <div className="flex items-start gap-2">
  <Badge variant="outline" className="text-xs shrink-0 bg-purple-50 text-purple-700 border-purple-200">Type</Badge>
  <span className="text-sm">- → INHOUSE</span>
  </div>
  <div className="flex items-start gap-2">
  <Badge variant="outline" className="text-xs shrink-0 bg-green-50 text-green-700 border-green-200">Period</Badge>
  <span className="text-sm">- → (Basic) IIC Lab</span>
  </div>
  </div>
  </div>
  </div>

  {/* Example: Customer Info change (offline only) */}
  <div className="flex gap-3">
  <div className="flex flex-col items-center">
  <div className="h-2 w-2 rounded-full bg-[oklch(0.7_0.15_55)] mt-1.5" />
  <div className="w-px flex-1 bg-border" />
  </div>
  <div className="pb-4 flex-1">
  <div className="flex items-center justify-between mb-2">
  <p className="text-xs text-muted-foreground">
  2026. 03.09 16:00 (PST)
  </p>
  <p className="text-xs text-muted-foreground">By: monster1437</p>
  </div>
  <div className="space-y-2">
  <div className="flex items-start gap-2">
  <Badge variant="outline" className="text-xs shrink-0 bg-orange-50 text-orange-700 border-orange-200">Customer Info</Badge>
  <span className="text-sm">Address1, City</span>
  </div>
  </div>
  </div>
  </div>

  {/* Initial status */}
  <div className="flex gap-3">
  <div className="flex flex-col items-center">
  <div className="h-2 w-2 rounded-full bg-[oklch(0.7_0.15_55)] mt-1.5" />
  </div>
  <div className="pb-2 flex-1">
  <div className="flex items-center justify-between mb-2">
  <p className="text-xs text-muted-foreground">
  2026. 03.09 11:00 (PST)
  </p>
  <p className="text-xs text-muted-foreground">By: monster1437</p>
  </div>
  <div className="space-y-2">
  <div className="flex items-start gap-2">
  <Badge variant="outline" className="text-xs shrink-0 bg-blue-50 text-blue-700 border-blue-200">Status</Badge>
  <span className="text-sm">Pending (Initial)</span>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </CardContent>
  </Card>

              {/* Save Button - Final save for all detail changes */}
              <div className="pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges || !isEditable}
                  className={`w-full ${
                    hasChanges && isEditable
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Save
                </Button>
              </div>
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
    </div>
  )
}
