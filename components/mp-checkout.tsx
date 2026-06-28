"use client"

import { useEffect, useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"

interface Props {
  amount: number
  preferenceId: string
  orderReference: string
  publicKey: string
  onSuccess: (paymentId: number) => void
  onError: () => void
}

const RECHAZO_MSGS: Record<string, string> = {
  cc_rejected_insufficient_amount: "Fondos insuficientes. Intenta con otra tarjeta o medio de pago.",
  cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto. Revísalo e intenta de nuevo.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta.",
  cc_rejected_bad_filled_security_code: "CVV incorrecto. Revisa el código de seguridad.",
  cc_rejected_blacklist: "Tarjeta no permitida. Intenta con otro medio de pago.",
  cc_rejected_call_for_authorize: "Tu banco requiere autorización. Llama a tu banco e intenta de nuevo.",
  cc_rejected_card_disabled: "Tarjeta desactivada. Contacta tu banco o usa otra tarjeta.",
  cc_rejected_duplicated_payment: "Pago duplicado detectado. Si ya pagaste, contacta al administrador.",
  cc_rejected_high_risk: "Pago rechazado por seguridad. Intenta con otro medio de pago.",
  pending_contingency: "El pago está pendiente. Te notificaremos cuando se confirme.",
  pending_review_manual: "Tu pago está en revisión. Te avisaremos pronto.",
}

function getMensaje(status: string, detail: string) {
  if (status === "pending") return RECHAZO_MSGS[detail] ?? "Tu pago está pendiente de confirmación."
  return RECHAZO_MSGS[detail] ?? "El pago fue rechazado. Intenta con otro medio de pago."
}

export function MpCheckout({ amount, preferenceId, orderReference, publicKey, onSuccess, onError }: Props) {
  const [ready, setReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    initMercadoPago(publicKey, { locale: "es-CO" })
    setReady(true)
  }, [publicKey])

  async function handleSubmit(formData: any) {
    setErrorMsg(null)
    try {
      const fd = formData.formData ?? formData
      const res = await fetch("/api/mp-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: fd.token,
          paymentMethodId: fd.payment_method_id,
          installments: fd.installments ?? 1,
          payer: fd.payer,
          amount,
          orderReference,
        }),
      })
      const data = await res.json()
      if (data.status === "approved") {
        onSuccess(data.id)
      } else {
        setErrorMsg(getMensaje(data.status ?? "rejected", data.statusDetail ?? ""))
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error de conexión. Intenta de nuevo.")
    }
  }

  if (!ready) return (
    <div className="flex items-center justify-center py-10">
      <p className="text-muted-foreground animate-pulse text-sm">Cargando métodos de pago...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4">
          <span className="text-xl leading-none mt-0.5">❌</span>
          <div>
            <p className="text-sm font-semibold text-red-400 mb-0.5">Pago no procesado</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
        </div>
      )}
      <Payment
        initialization={{ amount, preferenceId }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            mercadoPago: "all",
          },
          visual: {
            style: {
              theme: "dark",
              customVariables: {
                baseColor: "#c8993a",
                baseColorFirstVariant: "#b8891a",
                baseColorSecondVariant: "#a87900",
              },
            },
          },
        }}
        onSubmit={handleSubmit}
        onFormChange={(data: any) => {
          if (data?.cardNumberComplete || data?.selectedPaymentMethod) {
            ;(window as any).fbq?.("track", "AddPaymentInfo", { value: amount, currency: "COP" })
          }
        }}
        onError={(err) => {
          console.error("MP Brick error:", err)
          setErrorMsg("Error al cargar el formulario de pago. Recarga la página.")
        }}
      />
    </div>
  )
}
