"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { toast } from "sonner"

// Cancel reasons
const CANCEL_REASONS = [
  { value: "frame_out_of_stock", label: "Frame is Out of stock" },
  { value: "do_not_process", label: "Do Not Process" },
  { value: "prescription_verification", label: "Prescription Information Needs Verification" },
  { value: "incompatible_lens_frame", label: "Incompatible Lens-Frame" },
  { value: "no_po_box_shipping", label: "Do Not Accept P.O box shipping" },
  { value: "other", label: "Other" },
]

// Return reasons
const RETURN_REASONS = [
  { value: "payment_method_change", label: "Payment Method Change" },
  { value: "purchase_different_product", label: "Purchase a Different Product" },
  { value: "change_of_mind", label: "Change of Mind" },
  { value: "system_error", label: "System Error" },
  { value: "policy_violation", label: "Policy Violation" },
]

// Sub-reasons for specific reasons
const SUB_REASONS: Record<string, { value: string; label: string }[]> = {
  do_not_process: [
    { value: "customer_request", label: "Customer request" },
    { value: "duplicate_order", label: "Duplicate order" },
  ],
  prescription_verification: [
    { value: "missing_prescription", label: "Missing prescription information" },
    { value: "international_prescription", label: "International prescription" },
  ],
  incompatible_lens_frame: [
    { value: "frame_too_small", label: "Frame too small for lens" },
    { value: "frame_material_issue", label: "Frame material incompatibility" },
  ],
}

// Error messages for cancel restrictions
const CANCEL_ERROR_MESSAGES: Record<string, string> = {
  offline_transfer: "Cannot cancel while inventory is in transit.",
  offline_outbound: "Cannot cancel after outbound registration.",
  shipping: "Cannot cancel while shipment is in transit.",
  online_wms: "Cannot cancel after WMS outbound instruction is completed.",
}

interface CancelReturnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "cancel" | "return"
  orderId: string
  orderNumber: string
  onComplete: (info: { reason: string; subReason?: string }) => void
}

export function CancelReturnModal({
  open,
  onOpenChange,
  type,
  orderId,
  orderNumber,
  onComplete,
}: CancelReturnModalProps) {
  const [reason, setReason] = useState<string>("")
  const [subReason, setSubReason] = useState<string>("")

  const reasons = type === "cancel" ? CANCEL_REASONS : RETURN_REASONS
  const hasSubReasons = reason && SUB_REASONS[reason]

  useEffect(() => {
    if (!open) {
      setReason("")
      setSubReason("")
    }
  }, [open])

  useEffect(() => {
    setSubReason("")
  }, [reason])

  const handleReject = () => {
    const selectedReason = reasons.find((r) => r.value === reason)
    const selectedSubReason = hasSubReasons
      ? SUB_REASONS[reason].find((r) => r.value === subReason)
      : null

    console.log(`${type === "cancel" ? "Cancel" : "Return"} Work:`, {
      orderId,
      orderNumber,
      reason: selectedReason?.label,
      subReason: selectedSubReason?.label,
    })

    onComplete({
      reason: selectedReason?.label || "",
      subReason: selectedSubReason?.label,
    })
    onOpenChange(false)
    toast.success(
      type === "cancel"
        ? "Work has been cancelled successfully."
        : "Return request has been submitted successfully."
    )
  }

  const isSubmitDisabled = !reason || (hasSubReasons && !subReason)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            Please select a reason for {type === "cancel" ? "Cancel" : "Return"}.
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full h-11 text-sm">
              <SelectValue placeholder="Select Reason." />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasSubReasons && (
            <Select value={subReason} onValueChange={setSubReason}>
              <SelectTrigger className="w-full h-11 text-sm">
                <SelectValue placeholder="Select Sub Reason." />
              </SelectTrigger>
              <SelectContent>
                {SUB_REASONS[reason].map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleReject}
              disabled={isSubmitDisabled}
              size="sm"
              className="h-9 px-6 text-sm bg-amber-400 hover:bg-amber-500 text-white disabled:opacity-50"
            >
              {type === "cancel" ? "Reject" : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper to determine cancel/return availability
export function getCancelAvailability(
  channel: "Online" | "Offline",
  status: string,
  outboundTracking: { trackingNo: string; carrier: string } | null,
  storeShipmentPhase?: "outbound" | "label" | "labelPrint"
): { canCancel: boolean; errorMessage?: string } {
  if (channel === "Offline") {
    // 재고 이동 중 (Inbound Inspection with no inbound tracking = transfer in progress)
    if (status === "Inbound Inspection") {
      // Lab 입고 완료 전 = 이동 중으로 간주할 수 있으나,
      // 현재 구조에서는 Inbound Inspection 상태는 취소 가능
    }
    // 출고 등록 완료 시 불가
    if (outboundTracking) {
      return { canCancel: false, errorMessage: CANCEL_ERROR_MESSAGES.offline_outbound }
    }
    // Completed 상태에서 배송 중이면 불가 (outboundTracking 있으면 위에서 걸림)
    // Finalized = 고객 배송 완료 → 반품만 가능 (취소는 가능하되 반품 프로세스)
  }

  if (channel === "Online") {
    // WMS 출고 지시 완료 (Outbound Inspection 이후)
    if (status === "Completed" && outboundTracking) {
      return { canCancel: false, errorMessage: CANCEL_ERROR_MESSAGES.online_wms }
    }
    // 송장 출력 완료 상태
    if (outboundTracking) {
      return { canCancel: false, errorMessage: CANCEL_ERROR_MESSAGES.shipping }
    }
  }

  // Completed/Finalized 기본 불가 (상세 페이지에서 isEditable로 이미 처리)
  return { canCancel: true }
}

export function getReturnAvailability(
  channel: "Online" | "Offline",
  status: string,
  outboundTracking: { trackingNo: string; carrier: string } | null,
): { canReturn: boolean; errorMessage?: string } {
  // Refund is only available for Completed or Finalized orders
  if (status === "Completed" || status === "Finalized") {
    return { canReturn: true }
  }
  // All other statuses: not eligible for refund (use cancel instead)
  return { canReturn: false }
}
