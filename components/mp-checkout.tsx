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

export function MpCheckout({ amount, preferenceId, orderReference, publicKey, onSuccess, onError }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initMercadoPago(publicKey, { locale: "es-CO" })
    setReady(true)
  }, [publicKey])

  async function handleSubmit(formData: any) {
    try {
      // El Brick anida los datos dentro de formData.formData
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
      console.log("MP pay response:", JSON.stringify(data, null, 2))
      if (data.status === "approved") {
        onSuccess(data.id)
      } else {
        alert(`Estado del pago: ${data.status} — ${data.statusDetail ?? data.error ?? ""}`)
        onError()
      }
    } catch (err) {
      console.error("MP handleSubmit error:", err)
      alert(`Error al procesar el pago: ${err}`)
      onError()
    }
  }

  if (!ready) return (
    <div className="flex items-center justify-center py-10">
      <p className="text-muted-foreground animate-pulse text-sm">Cargando métodos de pago...</p>
    </div>
  )

  return (
    <Payment
      initialization={{
        amount,
        preferenceId,
      }}
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
      onError={(err) => {
        console.error("MP Brick error:", err)
        onError()
      }}
    />
  )
}
